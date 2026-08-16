import React, { useMemo, useState, useEffect } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoaderPage from "../common/Loader";
import { selectStyles } from "../../utils/selectStyles";
import { Link, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import { useParams } from "react-router-dom";
import FilePreview from "../common/FilePreview";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import { useBatchOptions } from "../Options/services";
import {
  useEmployeeDetailsData,
  useUpdateEmployee,
  useCreateEmployee,
  useUploadEmployeeDocs,
  useDropDowlList,
} from "./Services/index";

import * as yup from "yup";
const schema = yup.object({
  Name: yup.string().trim().required("Full Name is required"),

  department: yup.string().required("Department is required"),

  Designation: yup.string().required("Designation is required"),

  ParentCompany: yup.string().required("Parent Company is required"),
  // CONTACT DETAILS "contact.callingNo": yup .string() .trim() .required("Calling No is required"), "contact.email": yup .string() .trim() .email("Please enter a valid email address") .required("Email is required"),

  status: yup.string(),

  Role: yup.string(),
});
const formatWorklogField = (field) => {
  if (!field) return "";

  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
const formatWorklogValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "N/A";
    }

    return value
      .map((item) => {
        if (typeof item === "object") {
          return JSON.stringify(item);
        }

        return String(item);
      })
      .join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  // Format dates if required
  if (
    typeof value === "string" &&
    !isNaN(Date.parse(value)) &&
    value.includes("-")
  ) {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return String(value);
};

const EmployeesCreateEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      status: "ACTIVE",
      Role: "Employee",
      workingHours: "9",
      halfDayHours: "5",
      emergencyContacts: [
        {
          fullName: "",
          number: "",
        },
        {
          fullName: "",
          number: "",
        },
      ],
      contact: {
        whatsappNo: "",
        callingNo: "",
        email: "",
      },
      address: {
        permanentAddress: "",
        temporaryAddress: "",
      },
      login: {
        loginId: "",
        password: "",
      },
      DOJ: null,
      DOB: null,
    },
  });
  const [aadharFiles, setAadharFiles] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]);
  const [bankFiles, setBankFiles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [existingAadhar, setExistingAadhar] = useState([]);
  const [existingPhoto, setExistingPhoto] = useState([]);
  const [existingBank, setExistingBank] = useState([]);
  const { mutate: createEmployee, isPending: isCreateEmployee } =
    useCreateEmployee();

  const { mutate: updateEmployee, isPending: isUpdateEmployee } =
    useUpdateEmployee();
  const isUpdating = isCreateEmployee || isUpdateEmployee;
  const { data: employeeData, isPending: isSingleEmployee } =
    useEmployeeDetailsData(id);
  const { mutate: uploadEmployeeDocs, isPending: isUploadingDocs } =
    useUploadEmployeeDocs();

  // ================= DYNAMIC DROPDOWN OPTIONS =================

  const getDropdownOptions = (data) =>
    (data?.[0]?.items || []).map(({ value, label }) => ({
      value,
      label,
    }));

  // ======================================================
  // EMPLOYEE DROPDOWN OPTIONS - SINGLE API CALL
  // ======================================================

  // ======================================================
  // EMPLOYEE DROPDOWN OPTIONS
  // SINGLE BATCH API CALL
  // ======================================================

  // ======================================================
  // EMPLOYEE DROPDOWN OPTIONS
  // SINGLE BATCH API CALL
  // ======================================================

  const { data: options = {} } = useBatchOptions([
    "department",
    "employeeStatus",
    "departmentCompanies",
    "designationoptions",
    "parentcompanyoptions",
    "roleoptions",
    "subsidiaryoptions",
    "teamcode",
    "activeinactivestatus"
  ]);

  const DepartmentOptions = options.department || [];

  const ActiveInactiveStatus = options.activeinactivestatus || [];
  const DepartmentCompanyOptions = options.departmentCompanies || [];

  const DesignationOptions = options.designationoptions || [];

  const ParentCompanyOptions = options.parentcompanyoptions || [];

  const RoleOptions = options.roleoptions || [];

  const SubsidiaryOptions = options.subsidiaryoptions || [];

  const TeamCodeOptions = options.teamcode || [];
  // for getting email
  const emailValue = watch("contact.email");

  useEffect(() => {
    setValue("login.loginId", emailValue || "");
  }, [emailValue, setValue]);
  useEffect(() => {
    const employee = employeeData?.data;

    if (!employee) return;

    reset({
      EmployeeID: employee.employeeId || "",
      Name: employee.employeeName || "",
      department: employee.department || "",
      teamCode: employee.teamcode || "",
      Designation: employee.designation || "",
      ParentCompany: employee.parentCompany || "",
      Subsidiary: employee.subsidiary || "",
      status: employee.status || "",
      Role: employee.role || "",
      workingHours: String(employee.workingHours ?? 9),
      halfDayHours: String(employee.halfDayHours ?? 5),

      DOJ: employee.dateOfJoining ? new Date(employee.dateOfJoining) : null,

      DOB: employee.dateOfBirth ? new Date(employee.dateOfBirth) : null,

      contact: {
        whatsappNo: employee.whatsappNo || "",
        callingNo: employee.callingNo || "",
        email: employee.email || "",
      },

      address: {
        permanentAddress: employee.permanentAddress || "",
        temporaryAddress: employee.temporaryAddress || "",
      },

      emergencyContacts: [
        {
          fullName: employee.emergencyContacts?.[0]?.fullName || "",
          number: employee.emergencyContacts?.[0]?.number || "",
        },
        {
          fullName: employee.emergencyContacts?.[1]?.fullName || "",
          number: employee.emergencyContacts?.[1]?.number || "",
        },
      ],

      login: {
        loginId: employee.loginId || "",
        password: "",
      },

      Worklogs: employee.worklogs || [],
    });
  }, [employeeData, reset]);

  useEffect(() => {
    const employee = employeeData?.data;

    if (!employee) return;

    const documents = employee.documents || {};

    setExistingAadhar(
      Array.isArray(documents.aadharCard) ? documents.aadharCard : [],
    );

    setExistingPhoto(documents.photo ? [documents.photo] : []);

    setExistingBank(documents.bankDetails ? [documents.bankDetails] : []);
  }, [employeeData]);

  const onSubmit = (data) => {
    const payload = {
      employeeName: data.Name,
      department: data.department,
      teamCode: data.teamCode,
      designation: data.Designation,
      parentCompany: data.ParentCompany,
      subsidiary: data.Subsidiary,
      role: data.Role,
      workingHours: data.workingHours || "9",
      halfDayHours: data.halfDayHours || "5",
      dateOfJoining: data.DOJ || null,
      dateOfBirth: data.DOB || null,
      status: isEdit ? data.status : "ACTIVE",
      // CONTACT
      whatsappNo: data.contact?.whatsappNo || "",
      callingNo: data.contact?.callingNo || "",
      email: data.contact?.email || "",

      // ADDRESS
      permanentAddress: data.address?.permanentAddress || "",
      temporaryAddress: data.address?.temporaryAddress || "",

      // EMERGENCY
      emergencyContacts: [
        {
          fullName: data.emergencyContacts?.[0]?.fullName || "",
          number: data.emergencyContacts?.[0]?.number || "",
        },
        {
          fullName: data.emergencyContacts?.[1]?.fullName || "",
          number: data.emergencyContacts?.[1]?.number || "",
        },
      ],

      // LOGIN
      loginId: data.contact?.email?.trim().toLowerCase() || "",

      ...(data.login?.password
        ? {
            password: data.login.password,
          }
        : {}),
    };

    // UPDATE EMPLOYEE
    if (id) {
      updateEmployee(
        {
          id,
          payload,
        },
        {
          onSuccess: () => {
            toast.dismiss();
            toast.success("Employee Updated");
            navigate("/employees");
          },

          onError: (error) => {
            const message =
              error?.response?.data?.message ||
              error?.message ||
              "Unable to update employee";

            toast.error(message);
          },
        },
      );

      return;
    }

    // CREATE EMPLOYEE
    createEmployee(payload, {
      onSuccess: () => {
        toast.dismiss();
        toast.success("Employee Created");
        navigate("/employees");
      },

      onError: (error) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unable to create employee";

        toast.error(message);
      },
    });
  };

  const handleDocumentUpload = () => {
    const employeeId = id || watch("EmployeeID");

    if (!employeeId) {
      toast.error("Please create the employee first");
      return;
    }

    const hasNewDocuments =
      aadharFiles.length > 0 || photoFiles.length > 0 || bankFiles.length > 0;

    if (!hasNewDocuments) {
      toast.warning("Please select at least one document");
      return;
    }

    const formData = buildEmployeeDocumentsFormData();

    uploadEmployeeDocs(
      {
        employeeId,
        formData,
      },
      {
        onSuccess: () => {
          toast.dismiss();
          toast.success("Documents uploaded successfully");

          // Clear newly selected files
          setAadharFiles([]);
          setPhotoFiles([]);
          setBankFiles([]);

          // Optional: reload employee details after upload
          if (id) {
            // Your query will normally refetch depending on your service setup
          }
        },

        onError: (error) => {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            "Document upload failed";

          toast.error(message);
        },
      },
    );
  };
  const workingHoursOptions = [
    { value: "8", label: "8 Hr" },
    { value: "9", label: "9 Hr" },
    { value: "10", label: "10 Hr" },
    { value: "11", label: "11 Hr" },
    { value: "12", label: "12 Hr" },
  ];
  const halfDayHoursOptions = [
    { value: "4", label: "4 Hr" },
    { value: "4.5", label: "4.5 Hr" },
    { value: "5", label: "5 Hr" },
    { value: "5.5", label: "5.5 Hr" },
    { value: "6", label: "6 Hr" },
  ];
  const inputClass =
    "w-full px-3  py-2 mt-1 border border-orange-500 rounded-md shadow focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 disabled:cursor-not-allowed";

  const isActiveOptions = [
    {
      value: "active",
      label: "active",
    },
    {
      value: "inactive",
      label: "inactive",
    },
  ];
  const removeFile = (type, index, isExisting = false) => {
    if (type === "aadharCard") {
      if (isExisting) {
        setExistingAadhar((prev) => prev.filter((_, i) => i !== index));
      } else {
        setAadharFiles((prev) => {
          const updated = prev.filter((_, i) => i !== index);
          setValue("documents.aadharCard", updated);
          return updated;
        });
      }
    }

    if (type === "photo") {
      if (isExisting) {
        setExistingPhoto((prev) => prev.filter((_, i) => i !== index));
      } else {
        setPhotoFiles((prev) => {
          const updated = prev.filter((_, i) => i !== index);
          setValue("documents.photo", updated);
          return updated;
        });
      }
    }

    if (type === "bankPassbook") {
      if (isExisting) {
        setExistingBank((prev) => prev.filter((_, i) => i !== index));
      } else {
        setBankFiles((prev) => {
          const updated = prev.filter((_, i) => i !== index);
          setValue("documents.bankPassbook", updated);
          return updated;
        });
      }
    }
  };
  const buildEmployeeDocumentsFormData = () => {
    const formData = new FormData();

    aadharFiles.forEach((file) => {
      formData.append("aadharCard", file);
    });

    photoFiles.forEach((file) => {
      formData.append("photo", file);
    });

    bankFiles.forEach((file) => {
      formData.append("bankPassbook", file);
    });

    // Existing files that should remain
    existingAadhar.forEach((file) => {
      formData.append("aadharCardExisting", file);
    });

    existingPhoto.forEach((file) => {
      formData.append("photoExisting", file);
    });

    existingBank.forEach((file) => {
      formData.append("bankPassbookExisting", file);
    });

    return formData;
  };
  return (
    <div className="overflow-auto border border-gray-200 rounded-lg p-2">
      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("FORM VALIDATION ERRORS:", errors);
        })}
        className="space-y-6"
      >
        {/* =========================================================
      EMPLOYEE HEADER
  ========================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-4 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {isEdit ? "Update Employee" : "Create Employee"}
              </h1>

              <p className="text-sm text-gray-500">
                {isEdit
                  ? "Update existing employee details"
                  : "Create and manage employee details"}
              </p>
            </div>

            {/* ================= ACTION BUTTONS ================= */}
            <div className="flex justify-end gap-5">
              <button
                type="button"
                onClick={() => navigate("/employees")}
                className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUpdating}
                className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                {isUpdating ? (
                  <>
                    <LoaderPage />
                    Processing...
                  </>
                ) : isEdit ? (
                  "Update Employee"
                ) : (
                  "Create Employee"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
      EMPLOYEE DETAILS
  ========================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Employee Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Employee ID - Show only in Edit mode */}
            {isEdit && (
              <div className="form-group">
                <input
                  type="text"
                  {...register("EmployeeID")}
                  placeholder=" "
                  className="form-input bg-gray-100"
                  readOnly
                  disabled
                />

                <label className="form-label required-label">Employee ID</label>
              </div>
            )}
            {/* Active */}
            {isEdit && (
              <Controller
                name="status"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label">Status</label>

                    <Select
                      options={ActiveInactiveStatus}
                      isClearable
                      // isLoading={isEmployeeStatusesLoading}
                      placeholder=""
                      value={
                        ActiveInactiveStatus.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(option) => field.onChange(option?.value || "")}
                      styles={selectStyles}
                    />
                  </div>
                )}
              />
            )}
            {/* Full Name */}
            <div className="form-group">
              <input
                {...register("Name")}
                placeholder=" "
                className="form-input"
              />

              <label className="form-label required-label">
                Full Name 
              </label>
              {errors.Name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.Name.message}
                </p>
              )}
            </div>
            {/* Department */}
            <Controller
              name="department"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label required-label">
                    Department 
                  </label>

                  <Select
                    {...field}
                    options={DepartmentOptions}
                    isClearable
                    placeholder=""
                    value={
                      DepartmentOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Designation */}
            <Controller
              name="Designation"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label required-label">
                    Designation
                  </label>

                  <Select
                    options={DesignationOptions}
                    isClearable
                    placeholder=""
                    value={
                      DesignationOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Team Code */}
            {/* Team Code */}
            <Controller
              name="teamCode"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Team Code</label>

                  <Select
                    options={TeamCodeOptions}
                    isClearable
                    placeholder=""
                    value={
                      TeamCodeOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Parent Company */}
            <Controller
              name="ParentCompany"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">
                    Parent Company <span className="text-red-500">*</span>
                  </label>

                  <Select
                    {...field}
                    options={ParentCompanyOptions}
                    isClearable
                    placeholder=""
                    value={
                      ParentCompanyOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />
            {/* Subsidiary */}
            <Controller
              name="Subsidiary"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">Subsidiary</label>

                  <Select
                    {...field}
                    options={SubsidiaryOptions}
                    isClearable
                    placeholder=""
                    value={
                      SubsidiaryOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />
                </div>
              )}
            />

            {/* Role */}
            {/* <Controller
              name="Role"
              control={control}
              defaultValue="Employee"
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">
                    Role 
                  </label>

                  <Select
                    options={RoleOptions}
                    placeholder=""
                    value={
                      RoleOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    isDisabled={!isEdit}
                    isClearable={isEdit}
                    styles={selectStyles}
                  />
                </div>
              )}
            /> */}

            {/* DOJ */}
            <Controller
              name="DOJ"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${
                    field.value ? "has-value" : ""
                  }`}
                >
                  <label className="datepicker-label">Date of Joining</label>

                  <DatePicker
                    isClearable
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="dd MMM yyyy"
                    className="custom-datepicker"
                  />
                </div>
              )}
            />
            {/* DOB */}
            <Controller
              name="DOB"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${
                    field.value ? "has-value" : ""
                  }`}
                >
                  <label className="datepicker-label">Date of Birth</label>

                  <DatePicker
                    isClearable
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="dd MMM yyyy"
                    className="custom-datepicker"
                  />
                </div>
              )}
            />
            {/* Working Hours */}
            <Controller
              name="workingHours"
              control={control}
              render={({ field }) => (
                <div
                  className={`select-group ${field.value ? "has-value" : ""}`}
                >
                  <label className="select-label">
                    Working Hours <span className="text-red-500">*</span>
                  </label>

                  <Select
                    options={workingHoursOptions}
                    isClearable
                    placeholder=""
                    value={
                      workingHoursOptions.find(
                        (option) => option.value === field.value,
                      ) || null
                    }
                    onChange={(option) => field.onChange(option?.value || "")}
                    styles={selectStyles}
                  />

                  {errors.workingHours && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.workingHours.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Half Day Hours */}
            <Controller
              name="halfDayHours"
              control={control}
              render={({ field }) => {
                const selectedWorkingHours = Number(watch("workingHours") || 0);

                const availableHalfDayOptions = halfDayHoursOptions.filter(
                  (option) => Number(option.value) <= selectedWorkingHours,
                );

                return (
                  <div
                    className={`select-group ${field.value ? "has-value" : ""}`}
                  >
                    <label className="select-label">
                      Half Day Hours <span className="text-red-500">*</span>
                    </label>

                    <Select
                      options={availableHalfDayOptions}
                      isClearable
                      placeholder=""
                      value={
                        availableHalfDayOptions.find(
                          (option) => option.value === field.value,
                        ) || null
                      }
                      onChange={(option) => field.onChange(option?.value || "")}
                      styles={selectStyles}
                    />

                    {errors.halfDayHours && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.halfDayHours.message}
                      </p>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>
        {/* =========================================================
      CONTACT DETAILS
  ========================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Contact Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* WhatsApp */}
            <div className="form-group">
              <input
                {...register("contact.whatsappNo")}
                placeholder=" "
                type="tel"
                className="form-input"
              />

              <label className="form-label">WhatsApp No</label>
            </div>

            {/* Calling */}
            <div className="form-group">
              <input
                {...register("contact.callingNo")}
                placeholder=" "
                type="tel"
                className="form-input"
              />

              <label className="form-label">Calling No</label>
            </div>

            {/* Email */}
            <div className="form-group">
              <input
                {...register("contact.email")}
                placeholder=" "
                type="email"
                className="form-input"
              />

              <label className="form-label">Email</label>
            </div>
          </div>
        </div>
        {/* =========================================================
      ADDRESS DETAILS
  ========================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Address Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Permanent */}
            <div className="form-group">
              <textarea
                {...register("address.permanentAddress")}
                placeholder=" "
                className="form-input min-h-[120px]"
              />

              <label className="form-label">Permanent Address</label>
            </div>

            {/* Temporary */}
            <div className="form-group">
              <textarea
                {...register("address.temporaryAddress")}
                placeholder=" "
                className="form-input min-h-[120px]"
              />

              <label className="form-label">Temporary Address</label>
            </div>
          </div>
        </div>
        {/* =========================================================
      EMERGENCY CONTACT DETAILS
  ========================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Emergency Contact Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Emergency Contact 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-4">
                Emergency Contact 1
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <input
                    {...register("emergencyContacts.0.fullName")}
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">Full Name</label>
                </div>

                <div className="form-group">
                  <input
                    {...register("emergencyContacts.0.number")}
                    placeholder=" "
                    type="tel"
                    className="form-input"
                  />

                  <label className="form-label">Contact No</label>
                </div>
              </div>
            </div>

            {/* Emergency Contact 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-4">
                Emergency Contact 2
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <input
                    {...register("emergencyContacts.1.fullName")}
                    placeholder=" "
                    className="form-input"
                  />

                  <label className="form-label">Full Name</label>
                </div>

                <div className="form-group">
                  <input
                    {...register("emergencyContacts.1.number")}
                    placeholder=" "
                    type="tel"
                    className="form-input"
                  />

                  <label className="form-label">Contact No</label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
      LOGIN / ACCESS DETAILS
  ========================================================= */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Login / Access Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* ================= LOGIN ID ================= */}
            <div className="form-group">
              <input
                {...register("login.loginId")}
                placeholder=" "
                type="email"
                className="form-input bg-gray-100 cursor-not-allowed"
                readOnly
                disabled
              />

              <label className="form-label">Login ID</label>
            </div>

            {/* ================= PASSWORD ================= */}
            {!isEdit && (
              <div className="form-group relative">
                <input
                  {...register("login.password")}
                  placeholder=" "
                  type={showPassword ? "text" : "password"}
                  className="form-input pr-12"
                />

                <label className="form-label">Password</label>

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye Off
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.655 0 3.224-.38 4.616-1.052M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.5a10.523 10.523 0 01-4.132 5.411M6.228 6.228L3 3m3.228 3.228l4.65 4.65m0 0a3 3 0 104.243 4.243m-4.243-4.243l4.243 4.243M17.772 17.772L21 21"
                      />
                    </svg>
                  ) : (
                    // Eye
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* worklog */}
        {isEdit && (
          <div className="mt-6">
            {/* Heading */}
            <h3 className="text-[18px] font-medium text-gray-900 mb-3">
              Work Log History
            </h3>

            <Controller
              name="Worklogs"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <div className="h-[180px] overflow-y-auto overflow-x-hidden">
                  {!field.value || field.value.length === 0 ? (
                    <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-gray-400 text-sm">No Worklogs</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...field.value].reverse().map((log, index) => {
                        const updatedBy = log.updatedByName || "Pooja";

                        const formattedDate = log.createdAt
                          ? new Date(log.createdAt).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "";

                        return (
                          <div
                            key={log._id || index}
                            className="bg-gray-100 rounded-lg px-4 py-3"
                          >
                            {/* Header */}
                            <div className="text-[16px] text-gray-900 font-medium mb-1">
                              [{formattedDate} - {updatedBy}]
                            </div>

                            {/* Changes */}
                            {log.changes?.length > 0 ? (
                              <div className="space-y-1">
                                {log.changes.map((change, changeIndex) => (
                                  <div
                                    key={changeIndex}
                                    className="text-[16px] text-gray-900"
                                  >
                                    <span>
                                      {formatWorklogField(change.field)}
                                    </span>{" "}
                                    changed from{" "}
                                    <span>
                                      {formatWorklogValue(change.oldValue)}
                                    </span>{" "}
                                    to{" "}
                                    <span>
                                      {formatWorklogValue(change.newValue)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-[16px] text-gray-700">
                                {log.description || "Employee updated"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        )}
        {/* =========================================================
    FORM ACTION BUTTONS
========================================================= */}
        <div className="flex justify-end gap-5 pb-5">
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isUpdating}
            className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            {isUpdating ? (
              <>
                <LoaderPage />
                Processing...
              </>
            ) : isEdit ? (
              "Update Employee"
            ) : (
              "Create Employee"
            )}
          </button>
        </div>
      </form>

      {/* =====================Document Upload==============================*/}
      {/* =========================================================
      EMPLOYEE DOCUMENTS
  ========================================================= */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Employee Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Aadhar */}
          <div className="form-group">
            <input
              type="file"
              multiple
              className="form-input"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);

                setAadharFiles((prev) => {
                  const updated = [...prev, ...files];

                  setValue("documents.aadharCard", updated);

                  return updated;
                });

                e.target.value = "";
              }}
            />

            <label className="form-label">Aadhar Card</label>

            <FilePreview
              files={aadharFiles}
              existingFiles={existingAadhar}
              onRemoveExisting={(index) =>
                removeFile("aadharCard", index, true)
              }
              onRemoveNew={(index) => removeFile("aadharCard", index)}
            />
          </div>

          {/* Photo */}
          <div className="form-group">
            <input
              type="file"
              multiple
              accept="image/*"
              className="form-input"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);

                setPhotoFiles((prev) => {
                  const updated = [...prev, ...files];

                  setValue("documents.photo", updated);

                  return updated;
                });

                e.target.value = "";
              }}
            />

            <label className="form-label">Photo</label>

            <FilePreview
              files={photoFiles}
              existingFiles={existingPhoto}
              onRemoveExisting={(index) => removeFile("photo", index, true)}
              onRemoveNew={(index) => removeFile("photo", index)}
            />
          </div>

          {/* Bank Passbook */}
          <div className="form-group">
            <input
              type="file"
              multiple
              className="form-input"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);

                setBankFiles((prev) => {
                  const updated = [...prev, ...files];

                  setValue("documents.bankPassbook", updated);

                  return updated;
                });

                e.target.value = "";
              }}
            />

            <label className="form-label">Bank Passbook</label>

            <FilePreview
              files={bankFiles}
              existingFiles={existingBank}
              onRemoveExisting={(index) =>
                removeFile("bankPassbook", index, true)
              }
              onRemoveNew={(index) => removeFile("bankPassbook", index)}
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleDocumentUpload}
            disabled={isUploadingDocs}
            className="theme-btn text-white px-5 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {isUploadingDocs ? (
              <>
                <LoaderPage />
                Uploading...
              </>
            ) : (
              "Upload Documents"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeesCreateEdit;