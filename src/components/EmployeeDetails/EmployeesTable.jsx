import React, { useMemo, useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Link } from "react-router-dom";
import {
  useEmployeeDetailsData,
  useUpdateEmployee,
  useCreateEmployee,
  useUploadEmployeeDocs,
  useDeleteEmployee,
  useToggleEmployeeLogin,
} from "./Services/index";
import {
  EmployeesTableSkeleton,
  SearchSkeleton,
  DashboardSkeleton,
} from "./EmployeesTableSkeleton";
import TableSkeleton from "../../components/common/TableSkelton";
import { useForm } from "react-hook-form";
import EmployeesCreate from "./EmployeesCreate";
import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";
import NoDataFound from "../common/NoDataFound";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Dashboard from "./Dashboard";
import { useAuth } from "../../context/authContext";
import EmployeeTabs from "./EmployeeTabs";
import { MobileCardSkeleton } from "../common/MobileCardSkelton";
import useDebounce from "../hooks/useDebounce";
import { Filter, Eye, Pencil, Trash2 } from "lucide-react";
import Pagination from "../Common/Pagination";
import ConfirmModal from "../Common/ConfirmModal";
const MAX_FILES = { aadhaar: 2, photo: 1, bank: 1 };

const schema = yup.object().shape({
  EmployeeID: yup.string().required("Employee ID is required"),
  Name: yup.string().required("Full Name is required"),
  Department: yup.string().required("Department is required"),
  Designation: yup.string().required("Designation is required"),
  DOJ: yup.string().required("Date of Joining is required"),
  DOB: yup.string().required("Date of Birth is required"),
  ParentCompany: yup.string().required("Parent Company is required"),
  Role: yup.string().required("Role is required"),
  Subsidiary: yup.string().required("Subsidiary is required"),
  WhatsAppNo: yup.string().required("WhatsApp No is required"),
  CallingNo: yup.string().required("Calling No is required"),
  Email: yup.string().required("Email is required"),
  PermanentAddress: yup.string().required("Permanent Address is required"),
  TemporaryAddress: yup.string().required("Temporary Address is required"),
  EmgyCont1FullName: yup
    .string()
    .required("Emergency Contact 1 Name is required"),
  EmgyCont1No: yup.string().required("Emergency Contact 1 No is required"),
  EmgyCont2FullName: yup
    .string()
    .required("Emergency Contact 2 Name is required"),
  EmgyCont2No: yup.string().required("Emergency Contact 2 No is required"),
  LoginID: yup.string().required("Login ID is required"),
});

const SR_WIDTH = 70;
const EMPID_COL_WIDTH = 120;
const DEFAULT_WIDTH = 180;
const ACTION_COL_WIDTH = 70;

const getColumnWidth = (key) => {
  if (key === "SrNo") return SR_WIDTH;
  if (key === "EmployeeID") return EMPID_COL_WIDTH;
  return DEFAULT_WIDTH;
};

const TOOLTIP_FIELDS = [
  "Designation",
  "Subsidiary",
  "Email",
  "LoginID",
  "Password",
  "Worklogs",
];

const CellWithTooltip = ({ value, columnKey }) => {
  const [show, setShow] = useState(false);

  const shouldShowTooltip = TOOLTIP_FIELDS.includes(columnKey);

  if (!shouldShowTooltip) {
    return (
      <div className="truncate overflow-hidden text-ellipsis">
        {value ?? ""}
      </div>
    );
  }

  const isWorklog = typeof value === "string" && value.includes("[");

  const previewLine = isWorklog ? value.split("\n").filter(Boolean)[0] : value;

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {/* ===== TABLE PREVIEW (NO STYLE CHANGE) ===== */}
      <div className="truncate overflow-hidden text-ellipsis">
        {previewLine ?? ""}
      </div>

      {/* ===== WORKLOG TOOLTIP ===== */}
      {show && isWorklog && (
        <div
          className="absolute left-10 ml-3 z-[9999]
          bg-white border border-gray-300 rounded-lg shadow-xl
          p-3 max-w-[450px] max-h-[350px] overflow-auto"
          style={{
            width: "max-content",
            minWidth: "280px",
            top: "95%",
            transform: "translateY(0%)",
          }}
        >
          {value.split("\n").map((line, i) => {
            const isHeader = line.startsWith("[");
            const isEmpty = line.trim() === "";

            if (isEmpty) {
              return <div key={i} style={{ height: "12px" }} />;
            }

            return (
              <div
                key={i}
                style={{
                  fontWeight: isHeader ? "normal" : "600",
                  color: isHeader ? "#374151" : "#000",
                  fontSize: "13px",
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      )}

      {/* ===== NORMAL TOOLTIP FOR OTHER COLUMNS ===== */}
      {show && !isWorklog && (
        <div
          className="absolute left-10 ml-3 top-5 z-[9999] bg-white border border-gray-300 rounded-lg shadow-xl p-3 text-xs break-words max-w-[400px] max-h-[400px] overflow-auto"
          style={{ width: "max-content", minWidth: "150px" }}
        >
          <pre className="whitespace-pre-wrap">{value ?? ""}</pre>
        </div>
      )}
    </div>
  );
};

const FileCell = ({ url }) => {
  const [previewImage, setPreviewImage] = useState(null);

  // ============================================================
  // NORMALIZE URL VALUE
  // API can return:
  // null
  // ""
  // string
  // array of strings
  // ============================================================

  if (!url) return null;

  let urls = [];

  if (Array.isArray(url)) {
    urls = url
      .flat(Infinity)
      .map((item) => {
        if (typeof item === "string") return item;

        // If backend returns objects
        if (item && typeof item === "object") {
          return item.url || item.fileUrl || item.path || "";
        }

        return "";
      })
      .map((item) => item.trim())
      .filter(Boolean);
  } else if (typeof url === "string") {
    urls = url
      .split(/\n|,/)
      .map((u) => u.trim())
      .filter(Boolean);
  }

  if (!urls.length) return null;

  return (
    <>
      <div className="flex gap-2 items-center">
        {urls.map((fileUrl, index) => {
          const cleanUrl = fileUrl.split("?")[0];

          const ext = cleanUrl.split(".").pop()?.toLowerCase() || "";

          const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);

          const isPDF = ext === "pdf";

          const handleClick = () => {
            if (isImage) {
              setPreviewImage(fileUrl);
            } else {
              window.open(fileUrl, "_blank", "noopener,noreferrer");
            }
          };

          return (
            <div
              key={index}
              onClick={handleClick}
              title="Open document"
              className="w-10 h-10 rounded-md overflow-hidden
              hover:ring-2 hover:ring-blue-400 relative cursor-pointer
              flex items-center justify-center bg-gray-100"
            >
              {isImage ? (
                <img
                  src={fileUrl}
                  alt="document"
                  className="w-full h-full object-cover"
                />
              ) : isPDF ? (
                <i className="fa-solid fa-file-pdf text-red-600 text-2xl" />
              ) : (
                <i className="fa-solid fa-file text-gray-500 text-2xl" />
              )}
            </div>
          );
        })}
      </div>

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center
          justify-center z-[9999]"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="preview"
              className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-xl"
            />

            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-white
              text-red-500 rounded-full w-7 h-7 flex items-center
              justify-center font-bold text-lg shadow-lg"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const EmployeesTable = () => {
  //const employeesData = useMemo(() => employeesDetail?.data || [], [employeesDetail]);

  const { mutate: updateEmployee, isPending: isUpdating } = useUpdateEmployee();
  const { mutate: createEmployee, isPending: isCreating } = useCreateEmployee();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { mutate: toggleEmployeeLogin, isPending: isTogglingLogin } =
    useToggleEmployeeLogin();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingRow, setEditingRow] = useState(null);
  const rowsPerPage = 10;
  const [filters, setFilters] = useState({});
  const [filterLabels, setFilterLabels] = useState([]);
  const debouncedSearch = useDebounce(search);
  const {
    data: employeesDetail,
    isPending,
    isFetching,
  } = useEmployeeDetailsData({
    page: currentPage,
    limit: rowsPerPage,
    search: debouncedSearch,
    departmentId: filters.departmentId,
    teamCodeId: filters.teamCodeId,
    statusId: filters.statusId,
  });

  // Keep login-enabled state synchronized with API data
  const employeesData = useMemo(
    () => employeesDetail?.data || [],
    [employeesDetail],
  );
  const displayedEmployees = employeesData;
  //console.log("employeesDetail: ", employeesDetail);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // mutation
  const { mutate: deleteEmployee, isPending: deletingEmployee } =
    useDeleteEmployee();

  const handleDelete = () => {
    if (!deleteId) return;

    deleteEmployee(deleteId, {
      onSuccess: (data) => {
        toast.dismiss();
        toast.success(data?.message || "Employee deleted successfully.");

        setDeleteId(null);
        setShowDeleteModal(false);

        if (employeesData.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      },

      onError: (error) => {
        console.error("Delete employee error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to delete employee.",
        );
      },
    });
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    // setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const SelectStylesfilter = {
    control: (base, state) => ({
      ...base,
      width: "250px",
      paddingTop: "0.20rem",
      paddingBottom: "0.0 rem",
      paddingLeft: "0.20rem",
      paddingRight: "0.50rem",
      marginTop: "0.30rem",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: state.isFocused ? "#fb923c" : "#fdba74",
      borderRadius: "0.375rem",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(251,146,60,0.5)"
        : "0 1px 2px rgba(0,0,0,0.05)",
      backgroundColor: "white",
      minHeight: "40px",
      "&:hover": { borderColor: "#fb923c" },
    }),

    option: (provided, state) => ({
      ...provided,
      color: state.isSelected ? "white" : "#fb923c",
      backgroundColor: state.isSelected ? "#fb923c" : "white",
      "&:hover": { backgroundColor: "#fed7aa" },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
      maxHeight: "200px",
      // overflowY: "auto",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  // ============================================================
  // EMPLOYEE SELECTION
  // ============================================================

  // ============================================================
  // DELETE EMPLOYEE
  // ============================================================

  //========================FILTER========================

  const [filterOpen, setFilterOpen] = useState(false);

  const [resetTrigger, setResetTrigger] = useState(0);

  const totalPages = employeesDetail?.pagination?.totalPages || 1;
  const totalRecords = employeesDetail?.pagination?.total || 0;

  //====================On Submit===================

  //================ Handle Edit===================

  const handleEdit = (row) => {
    if (!row?.EmployeeID) return;

    const selectedEmployee = employeesData.find(
      (emp) => emp.EmployeeID === row.EmployeeID,
    );

    if (!selectedEmployee) return;

    setEditingRow(selectedEmployee);

    const parseDate = (dateStr) => (dateStr ? new Date(dateStr) : null);

    reset({
      ...selectedEmployee,
      DOJ: parseDate(selectedEmployee.dateOfJoining),
      DOB: parseDate(selectedEmployee.dateOfBirth),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  //====================TABLE_COLUMNS====================
  const TABLE_COLUMNS = [
    { key: "SrNo", label: "Sr No" },
    { key: "EmployeeID", label: "Employee ID" },
    { key: "status", label: "Is Active" },
    { key: "EmployeeName", label: "Employee Name" },
    { key: "loginEnabled", label: "Enabled Login" },
    { key: "DepartmentName", label: "Department" },
    { key: "Designation", label: "Designation" },
    { key: "dateOfJoining", label: "Date of Joining" },
    { key: "dateOfBirth", label: "Date of Birth" },
    { key: "ParentCompany", label: "Parent Company" },
    { key: "Role", label: "Role" },
    { key: "Subsidiary", label: "Subsidiary" },
    { key: "WhatsAppNo", label: "WhatsApp No." },
    { key: "CallingNo", label: "Calling No." },
    { key: "Email", label: "Email" },
    { key: "AadharCard", label: "Aadhar Card" },
    { key: "Photo", label: "Photo" },
    { key: "BankDetails", label: "Bank Details" },
    { key: "PermanentAddress", label: "Permanent Address" },
    { key: "TemporaryAddress", label: "Temporary Address" },
    { key: "LoginID", label: "Login ID" },
    { key: "workingHours", label: "Working Hours" },
    { key: "halfDayHours", label: "Half Hours" },
  ];

  // 🔹 Get current index of editing row
  const currentIndex = editingRow
    ? employeesData.findIndex((emp) => emp.EmployeeID === editingRow.EmployeeID)
    : -1;

  const goToNext = () => {
    if (currentIndex >= 0 && currentIndex < employeesData.length - 1) {
      handleEdit(employeesData[currentIndex + 1]);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      handleEdit(employeesData[currentIndex - 1]);
    }
  };

  // Generate Next EmployeeID
  const getNextEmployeeID = () => {
    if (!employeesData?.length) return 240001;

    const lastEmployee = employeesData[0];
    return Number(lastEmployee.EmployeeID) + 1;
  };

  //=======================Document Upload===============================

  const [pendingDocType, setPendingDocType] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState({
    aadhaar: [],
    photo: [],
    bank: [],
  });
  const [existingDocs, setExistingDocs] = useState({
    aadhaar: [],
    photo: [],
    bank: [],
  });

  // ✅ ADD HERE (RIGHT AFTER STATES)
  const isDocAvailable = (type) => {
    return uploadedDocs[type]?.length > 0 || existingDocs[type]?.length > 0;
  };

  const allDocsUploaded =
    isDocAvailable("aadhaar") &&
    isDocAvailable("photo") &&
    isDocAvailable("bank");

  //console.log("existingDocs: ", existingDocs);
  //     const [savedDocs, setSavedDocs] = useState({
  //     aadhaar: false,
  //     photo: false,
  //     bank: false,
  // });

  const fileInputRefs = {
    aadhaar: useRef(),
    photo: useRef(),
    bank: useRef(),
  };

  const { mutate: uploadEmployeeDocs } = useUploadEmployeeDocs();
  // const {
  //   data: employeeDetailsForDocuments,
  //   isLoading: isDocument,
  //   refetch,
  // } = useEmployeeDetailsData();
  // 🔁 Load existing documents on component mount
  // useEffect(() => {
  //   if (!employeeDetailsForDocuments?.data || !editingRow) {
  //     setExistingDocs({
  //       aadhaar: [],
  //       photo: [],
  //       bank: [],
  //     });
  //     return;
  //   }

  //   const selectedEmployee = employeeDetailsForDocuments.data.find(
  //     (ele) => ele.EmployeeID === editingRow.EmployeeID,
  //   );

  //   if (selectedEmployee) {
  //     setExistingDocs({
  //       //aadhaar: selectedEmployee.AadharCard ? [selectedEmployee.AadharCard] : [],
  //       aadhaar: selectedEmployee.AadharCard
  //         ? selectedEmployee.AadharCard.split(",")
  //         : [],
  //       photo: selectedEmployee.Photo ? [selectedEmployee.Photo] : [],
  //       bank: selectedEmployee.BankDetails
  //         ? [selectedEmployee.BankDetails]
  //         : [],
  //     });
  //   }
  // }, [employeeDetailsForDocuments, editingRow]);

  useEffect(() => {
    // Employee change → clear unsaved uploads
    setUploadedDocs({
      aadhaar: [],
      photo: [],
      bank: [],
    });

    setPendingDocType(null);
  }, [editingRow?.EmployeeID]);

  const handleFileChange = (type, event) => {
    const newFiles = Array.from(event.target.files);
    if (!newFiles.length) return;

    setUploadedDocs((prev) => {
      const currentFiles = prev[type] || [];
      const existingCount = existingDocs[type]?.length || 0;

      const totalFiles = currentFiles.length + newFiles.length + existingCount;
      if (totalFiles > MAX_FILES[type]) {
        toast.dismiss();
        toast.error(
          `You can upload a maximum of ${MAX_FILES[type]} files for ${type.toUpperCase()}.`,
        );
        return prev;
      }

      // Rename files to ensure uniqueness
      const uniqueNewFiles = newFiles.map((file) => {
        const timestamp = Date.now();
        const uniqueSuffix = `${timestamp}-${Math.floor(Math.random() * 10000)}`;
        const fileExtension = file.name.split(".").pop();
        const baseName =
          file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        const newFileName = `${uniqueSuffix}_${baseName}.${fileExtension}`;
        return new File([file], newFileName, { type: file.type });
      });
      return {
        ...prev,
        [type]: [...currentFiles, ...uniqueNewFiles],
      };
    });

    // Reset the input so selecting the same file again will trigger onChange
    event.target.value = "";
  };

  const handleUploadClick = (type) => {
    fileInputRefs[type].current.click();
  };

  const generateDocumentWorklog = () => {
    const now = new Date();

    const formattedDate = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const formattedTime = now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const header = `[${formattedDate}, ${formattedTime} - (${user?.employee?.EmployeeID}) ${user?.employee?.Name || ""}]`;

    const newBlock = `${header}
  Documents Uploaded`;

    return newBlock;
  };

  const handleSave = () => {
    if (!watch("EmployeeID") || !watch("Name")) {
      return toast.error("Create employee first");
    }

    if (!allDocsUploaded) {
      return toast.error("All documents are mandatory");
    }

    const formData = new FormData();

    if (uploadedDocs.aadhaar.length)
      //formData.append("aadharCard", uploadedDocs.aadhaar[0]);
      uploadedDocs.aadhaar.forEach((file) => {
        formData.append("aadharCard", file);
      });

    if (uploadedDocs.photo.length)
      formData.append("photo", uploadedDocs.photo[0]);

    if (uploadedDocs.bank.length)
      formData.append("bankPassbook", uploadedDocs.bank[0]);

    if ([...formData.keys()].length === 0) {
      return toast.warning("Upload at least one document");
    }

    formData.append("EmployeeID", watch("EmployeeID"));
    formData.append("Name", watch("Name"));

    // ✅ WORKLOG ADD HERE
    const worklog = generateDocumentWorklog();
    formData.append("Worklogs", worklog);

    setPendingDocType("all");

    uploadEmployeeDocs(formData, {
      onSuccess: async () => {
        toast.dismiss();
        toast.success("Documents uploaded successfully");
        await refetch();
        setUploadedDocs({
          aadhaar: [],
          photo: [],
          bank: [],
        });

        setPendingDocType(null);
      },
      onError: () => {
        toast.error("Upload failed");
        setPendingDocType(null);
      },
    });
  };

  const handleRemoveFile = (type, index) => {
    setUploadedDocs((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };
  const handleReset = () => {
    setFilters({});
    setFilterLabels([]);
    setSearch("");
    setCurrentPage(1);

    setResetTrigger((prev) => prev + 1);
  };

  const removeFilter = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: "",
    }));

    setFilterLabels((prev) => prev.filter((item) => item.key !== key));

    setCurrentPage(1);
  };
  const documentsList = [
    {
      type: "aadhaar",
      label: "Aadhaar Card",
      desc: "Upload Aadhaar Card",
      icon: "fa-id-card",
      required: true,
    },
    {
      type: "photo",
      label: "Employee Photo",
      desc: "Upload Passport Size Photo",
      icon: "fa-user",
      required: true,
    },
    {
      type: "bank",
      label: "Bank Details",
      desc: "Upload Bank Passbook",
      icon: "fa-university",
      required: true,
    },
  ];

  return (
    <div className=" w-auto bg-gray-50 ">
      <>
        {/* ================= HEADER ================= */}
        {/* ================= HEADER ================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-3 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold uppercase">Employees Master</h1>

              <p className="text-sm text-gray-500">Manage all employees</p>
            </div>

            <Link to="/employees/create">
              <button className="theme-btn">+ Add Employee</button>
            </Link>
          </div>
        </div>
        {/* ================= TABLE ================= */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col h-[75vh] mt-2">
          {/* ================= SEARCH + FILTER ================= */}

          <div className="px-3 py-2 border-b border-gray-400 flex justify-between gap-3">
            {/* SEARCH */}

            <div className="relative w-80">
              <input
                className="border px-3 py-2 pr-10 rounded-lg w-full"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>

            {/* FILTER CHIPS */}

            <div className="flex flex-wrap items-center gap-2 flex-1">
              {filterLabels.map((filter) => (
                <div
                  key={filter.key}
                  className="group inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm shadow-sm"
                >
                  <span className="mr-2 font-medium text-slate-700">
                    {filter.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFilter(filter.key)}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-red-100 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* RESET + FILTER */}

            <div className="flex gap-2 items-center">
              {Object.keys(filters).some((key) => filters[key]) && (
                <button
                  onClick={handleReset}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-red-500"
                >
                  Reset
                </button>
              )}

              {/* LOGIN ENABLED SWITCH */}
              {/* <label className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg cursor-pointer select-none">
                <span className="text-sm text-gray-700 whitespace-nowrap">
                  Login Enabled
                </span>

                <button
                  type="button"
                  role="switch"
                  aria-checked={loginEnabledOnly}
                  disabled={loginFilterLoading}
                  onClick={() => setLoginEnabledOnly((prev) => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    loginEnabledOnly ? "bg-green-500" : "bg-gray-300"
                  } ${
                    loginFilterLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      loginEnabledOnly ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </label> */}

              {/* <button
                onClick={() => setFilterOpen(true)}
                className="border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Filter size={16} />
                Filters
              </button> */}
            </div>
          </div>

          {/* ================= TABLE CONTENT ================= */}

          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-100 z-30">
                <tr>
                  {TABLE_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      className={`p-3 text-left whitespace-nowrap ${
                        col.key === "EmployeeID"
                          ? "sticky left-0 z-20 bg-gray-100"
                          : ""
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="p-3 text-center sticky right-0 z-20 bg-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>

              {isPending ? (
                <TableSkeleton
                  rows={8}
                  columns={TABLE_COLUMNS.length + 1}
                  showActions
                />
              ) : (
                <tbody>
                  {displayedEmployees.length > 0 ? (
                    displayedEmployees.map((row, idx) => (
                      <tr
                        key={row?._id || row?.EmployeeID || idx}
                        className="border-t border-gray-300 hover:bg-gray-50"
                      >
                        {TABLE_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className={`p-3 text-left whitespace-nowrap ${
                              col.key === "EmployeeID"
                                ? "sticky left-0 z-10 bg-white"
                                : ""
                            }`}
                          >
                            {col.key === "SrNo" ? (
                              (currentPage - 1) * rowsPerPage + idx + 1
                            ) : ["Photo", "AadharCard", "BankDetails"].includes(
                                col.key,
                              ) ? (
                              <FileCell url={row[col.key]} />
                            ) : col.key === "status" ? (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  row.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {row.status || "-"}
                              </span>
                            ) : col.key === "loginEnabled" ? (
                              (() => {
                                const isLoginEnabled =
                                  row.loginEnabled === true;

                                return (
                                  <button
                                    type="button"
                                    disabled={isTogglingLogin}
                                    onClick={() => {
                                      toggleEmployeeLogin(row._id, {
                                        onSuccess: (data) => {
                                          toast.dismiss();
                                          toast.success(
                                            data?.message ||
                                              (isLoginEnabled
                                                ? "Employee login disabled successfully."
                                                : "Employee login enabled successfully."),
                                          );
                                        },

                                        onError: (error) => {
                                          console.error(
                                            "Toggle employee login error:",
                                            error,
                                          );

                                          toast.error(
                                            error?.response?.data?.message ||
                                              "Failed to update employee login.",
                                          );
                                        },
                                      });
                                    }}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                      isLoginEnabled
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-gray-300 hover:bg-gray-400"
                                    } ${
                                      isTogglingLogin
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }`}
                                    title={
                                      isLoginEnabled
                                        ? "Disable Login"
                                        : "Enable Login"
                                    }
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                        isLoginEnabled
                                          ? "translate-x-6"
                                          : "translate-x-1"
                                      }`}
                                    />
                                  </button>
                                );
                              })()
                            ) : col.key === "dateOfJoining" ||
                              col.key === "dateOfBirth" ? (
                              formatDate(row?.[col.key])
                            ) : col.key === "workingHours" ? (
                              row?.workingHours != null ? (
                                `${row.workingHours} hr`
                              ) : (
                                "-"
                              )
                            ) : col.key === "halfDayHours" ? (
                              row?.halfDayHours != null ? (
                                `${row.halfDayHours} hr`
                              ) : (
                                "-"
                              )
                            ) : (
                              (row?.[col.key] ?? "-")
                            )}
                          </td>
                        ))}

                        {/* ACTIONS */}

                        <td className="p-3 sticky right-0 z-10 bg-white">
                          <div className="flex justify-center gap-2">
                            {/* EDIT */}
                            <Link to={`/employees/edit/${row._id}`}>
                              <button
                                type="button"
                                className="p-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
                                title="Edit Employee"
                              >
                                <Pencil size={16} />
                              </button>
                            </Link>

                            {/* DELETE */}
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteId(row._id);
                                setShowDeleteModal(true);
                              }}
                              disabled={deletingEmployee}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                              title="Delete Employee"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={TABLE_COLUMNS.length + 1}>
                        <NoDataFound
                          title="No Employees Found"
                          description="Try searching different keywords"
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              )}
            </table>
          </div>

          {/* ================= PAGINATION ================= */}

          <div className="border-t p-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Showing{" "}
              {totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} -{" "}
              {Math.min(currentPage * rowsPerPage, totalRecords)} of{" "}
              {totalRecords}
            </span>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
        {/* ============================================================
    DELETE CONFIRMATION MODAL
============================================================ */}
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Delete Employee"
          message="Are you sure you want to deactivate this employee? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => {
            if (deletingEmployee) return;
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
        />
        {/* ================= EMPLOYEE FILTER ================= */}
        {/* <EmployeeFilter
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          onApply={(data, labels) => {
            setFilters(data);
            setFilterLabels(labels);
            setCurrentPage(1);
          }}
          handleReset={handleReset}
          resetTrigger={resetTrigger}
        /> */}
      </>
    </div>
  );
};

export default EmployeesTable;