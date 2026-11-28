import { useRef } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import "react-datepicker/dist/react-datepicker.css";
import {
  useSingleTicketData,
  useUpdateTicketData,
  getTicketNavigation,
} from "./services";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../auth/services";
import { convertStringFormatDate } from "../../utils/dateFormatter";
import Loader from "../common/Loader";
import { getPropertyDropdown } from "../properties/services";

import FilePreview from "../common/FilePreview";
import { useBatchOptions } from "../Options/services";
import { useManagerEmployees } from "../EmployeeDetails/Services/index";
import { useEmployeeDetailsData } from "../EmployeeDetails/Services/index";

import { useAuth } from "../../context/authContext";
import { compressAttachment } from "../../utils/compressFile";
import {
  Building2,
  Users,
  Layers,
  AlertCircle,
  ClipboardList,
  Camera,
  CheckCircle2,
  X,
} from "lucide-react";

import { translateToHindi } from "../../utils/translateText";
function FieldWorkerTicketCreateEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm();
  const { user } = useAuth();

  const { mutate: updateTicket, isPending: isUpdateTicket } =
    useUpdateTicketData();
  const { data: singleTicket } = useSingleTicketData(id);
  const { data: currentUser } = useCurrentUser();
  const { data: options = {} } = useBatchOptions([
    "department",
    "categories",
    "priority",
    "ticketstatus",
    "yesno",
  ]);
  const [hindiTranslation, setHindiTranslation] = useState({
    title: "",
    description: "",
    roomNo: "",
    bedNo: "",
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const { data: managerData } = useManagerEmployees();
  const { data: employeeData } = useEmployeeDetailsData({
    page: 1,
    limit: 1000,
  });
  const [navigation, setNavigation] = useState({
    previousId: null,
    nextId: null,
  });
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionFileName, setCompressionFileName] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [isDepartmentChanged, setIsDepartmentChanged] = useState(false);
  const submitLockRef = useRef(false);
  const assignee = watch("assignee");
  const manager = watch("manager");
  const ticketManager = watch("ticketManager");

  const userName =
    user?.Name || user?.name || user?.fullName || user?.username || "System";

  useEffect(() => {
    if (id && singleTicket?.data) {
      const ticket = singleTicket.data;

      setSelectedProperty(
        ticket.propertyId
          ? {
              value: ticket.propertyId._id,
              label: ticket.propertyId.propertyCode,
              propLocation: ticket.propertyId.propertyLocation,
            }
          : null,
      );

      reset({
        ...ticket,

        propertyId: ticket.propertyId?._id || "",

        targetDate: ticket.targetDate ? new Date(ticket.targetDate) : null,

        acknowledgedDate: ticket.acknowledgedDate
          ? new Date(ticket.acknowledgedDate)
          : null,
      });

      setExistingAttachments(ticket.attachment || []);
    }
  }, [id, singleTicket, reset]);

  const location = useLocation();

  const filters = location.state?.filters || {};
  const search = location.state?.search || "";

  useEffect(() => {
    if (!id) return;

    const loadNavigation = async () => {
      try {
        const res = await getTicketNavigation({
          id,
          search,
          ...filters,
        });

        setNavigation({
          previousId: res.previousId,
          nextId: res.nextId,
        });
      } catch (err) {
        console.log(err);
      }
    };

    loadNavigation();
  }, [id, search, filters]);

  const DepartmentOptions = options.department || [];
  const CategoryOptions = options.categories || [];
  const PriorityOptions = options.priority || [];
  const StatusOptions = options.ticketstatus || [];
  const YesNoOptions = options.yesno || [];

  const loadPropertyOptions = async (search, loadedOptions, { page }) => {
    const res = await getPropertyDropdown({
      page,
      limit: 10,
      search,
    });
    const options = [
      ...new Map(
        res.data.map((item) => [
          item.propertyCode,
          {
            value: item._id,
            label: item.propertyCode,
            propLocation: item.propertyLocation, // <-- Add this
          },
        ]),
      ).values(),
    ];

    return {
      options,
      hasMore: res.hasMore,
      additional: {
        page: page + 1,
      },
    };
  };

  const ManagerOptions =
    managerData?.data
      ?.filter((employee) => employee.loginEnabled === true)
      ?.map((employee) => ({
        value: employee.employeeName,
        label: employee.employeeName,
      })) || [];

  const TicketManagerOptions =
    employeeData?.data
      ?.filter(
        (employee) =>
          employee.ticketManager === true && employee.loginEnabled === true,
      )
      ?.map((employee) => ({
        value: employee.employeeName,
        label: employee.employeeName,
      })) || [];

  const AssigneeOptions =
    employeeData?.data
      ?.filter((employee) => employee.loginEnabled === true)
      ?.map((employee) => ({
        value: employee.employeeName,
        label: employee.employeeName,
      })) || [];

  const onSubmit = (data) => {
    // console.log("Submit triggered");
    // console.log("isDirty:", isDirty);
    // console.log("submitLock:", submitLockRef.current);
    // console.log("isCompressing:", isCompressing);

    const hasAttachmentChanges =
      attachmentFiles.length > 0 ||
      existingAttachments.length !==
        (singleTicket?.data?.attachment?.length || 0);

    if (!isDirty && !hasAttachmentChanges) {
      toast.dismiss();
      toast.info("No changes detected.");
      return;
    }

    if (submitLockRef.current) return;
    submitLockRef.current = true;

    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (
        value !== null &&
        value !== undefined &&
        key !== "attachment" &&
        key !== "workLogs" &&
        key !== "createdBy" &&
        key !== "createdByName" &&
        key !== "updatedByName"
      ) {
        if (key === "targetDate" && value instanceof Date) {
          formData.append(key, convertStringFormatDate(value));
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, value);
        }
      }
    });

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    if (!id) {
      formData.append("createdBy", currentUser?.user?.role || "");
      formData.append("createdByName", currentUser?.user?.name || "");
    }
    formData.append("updatedByName", currentUser?.user?.name || "");
    formData.append("role", currentUser?.user?.role || "");
    // formData.append("dateCreated", convertStringFormatDateTime(new Date()));
    // formData.append("propertyLocation", )
    formData.append("auditorLog", data.auditorLog || "");
    // Existing attachments
    formData.append("existingAttachments", JSON.stringify(existingAttachments));
    // New Attachments
    attachmentFiles.forEach((file) => {
      formData.append("attachment", file);
    });

    if (id) {
      updateTicket(
        {
          id,
          data: formData,
        },
        {
          onSuccess: (res) => {
            toast.dismiss();
            toast.success(res.message);
            submitLockRef.current = false;
            // navigate("/tickets");
            reset();
            setAttachmentFiles([]);
            setExistingAttachments([]);
          },
          onError: (err) => {
            console.error("Ticket Update Error:", {
              message: err?.message,
              status: err?.response?.status,
              response: err?.response?.data,
            });

            submitLockRef.current = false;
            toast.dismiss();
            toast.error(err?.response?.data?.message || "Update Failed");
          },
        },
      );
    } else {
      createTicket(formData, {
        onSuccess: (res) => {
          toast.dismiss();
          toast.success(res.message);
          submitLockRef.current = false;
          navigate("/tickets");

          reset();

          setAttachmentFiles([]);
          setExistingAttachments([]);
        },

        onError: (err) => {
          submitLockRef.current = false;
          toast.dismiss();
          toast.error(err?.response?.data?.message || "Create Failed");
        },
      });
    }
  };

useEffect(() => {
  const ticket = singleTicket?.data;

  if (!id || !ticket) return;

  let active = true;

  const translateTicket = async () => {
    setIsTranslating(true);

    try {
      const [
        translatedTitle,
        translatedDescription,
        translatedRoomNo,
        translatedBedNo,
      ] = await Promise.all([
        translateToHindi(ticket.title || ""),
        translateToHindi(ticket.description || ""),
        translateToHindi(String(ticket.roomNo || "")),
        translateToHindi(String(ticket.bedNo || "")),
      ]);

      if (active) {
        setHindiTranslation({
          title: translatedTitle,
          description: translatedDescription,
          roomNo: translatedRoomNo,
          bedNo: translatedBedNo,
        });
      }
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      if (active) setIsTranslating(false);
    }
  };

  translateTicket();

  return () => {
    active = false;
  };
}, [
  id,
  singleTicket?.data?.title,
  singleTicket?.data?.description,
  singleTicket?.data?.roomNo,
  singleTicket?.data?.bedNo,
]);
  const isSubmitting = isUpdateTicket;

  const handleMobileSubmit = (data) => {
    handleSubmit(onSubmit)();
  };
  return (
    <div className="max-w-12xl mx-auto px-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* MOBILE CREATE UI */}
        {id && (
          <div className="md:hidden fixed inset-0 z-30 flex flex-col bg-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <ClipboardList size={23} />
                <div>
                  <h1 className="text-base font-bold">अपडेट टिकट </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/tickets")}
                className="rounded-full p-2"
              >
                <X size={21} />
              </button>
            </div>

            {/* Compact Form */}

            {/* Form Content */}
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 pb-5">
              <div className="space-y-2">
                {/* FIRST ROW - PROPERTY, ROOM, BED */}
                {/* FIRST ROW - PROPERTY, ROOM, BED */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Property Code */}
                  <div className="min-w-0">
                    <label className="mb-1 flex items-center gap-1 text-[11px] font-medium text-gray-500">
                      <Building2 size={12} />
                      प्रॉपर्टी कोड
                    </label>
                    <div className="truncate text-xs font-semibold text-gray-800">
                      {selectedProperty?.label || "-"}
                    </div>
                  </div>

                  {/* Room No */}
                  <div className="min-w-0">
                    <label className="mb-1 block text-[11px] font-medium text-gray-500">
                      कमरा नंबर
                    </label>
                    <div className="truncate text-xs font-semibold text-gray-800">
                      {isTranslating
                        ? "अनुवाद हो रहा है..."
                        : hindiTranslation.roomNo || watch("roomNo") || "-"}
                    </div>
                  </div>

                  {/* Bed No */}
                  <div className="min-w-0">
                    <label className="mb-1 block text-[11px] font-medium text-gray-500">
                      बेड नंबर
                    </label>
                    <div className="truncate text-xs font-semibold text-gray-800">
                      {isTranslating
                        ? "अनुवाद हो रहा है..."
                        : hindiTranslation.bedNo || watch("bedNo") || "-"}
                    </div>
                  </div>
                </div>

                {/* TICKET TITLE */}
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-gray-500">
                    टिकट का शीर्षक
                  </label>

                  <div className="text-sm font-semibold text-gray-800">
                    {isTranslating
                      ? "अनुवाद हो रहा है..."
                      : hindiTranslation.title || watch("title") || "-"}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    समस्या का विवरण
                  </label>

                  <div className="min-h-16 whitespace-pre-wrap rounded-lg bg-gray-50 p-2 text-sm text-gray-700">
                    {isTranslating
                      ? "अनुवाद हो रहा है..."
                      : hindiTranslation.description ||
                        watch("description") ||
                        "-"}
                  </div>
                </div>
                {/* SECOND ROW - ASSIGNEE + ATTACHMENT */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Assignee */}
                  <div className="min-w-0">
                    <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-600">
                      <Users size={14} />
                      कर्मचारी नियुक्त करें
                    </label>

                    <select
                      {...register("assignee")}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-2 text-sm outline-none focus:border-gray-700"
                    >
                      <option value="">कर्मचारी चुनें</option>

                      {AssigneeOptions.map((employee) => (
                        <option key={employee.value} value={employee.value}>
                          {employee.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Attachment Upload */}
                  <div className="min-w-0">
                    <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-600">
                      <Camera size={14} />
                      फ़ाइलें संलग्न करें
                    </label>

                    <label className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-400 bg-white px-2 text-sm font-semibold text-gray-700 active:bg-gray-100">
                      <Camera size={18} />
                      <span className="truncate">फ़ाइलें जोड़ें</span>

                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,application/pdf"
                        className="hidden"
                        disabled={isCompressing}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);

                          if (!files.length) return;

                          setPendingFiles(files);
                          setIsCompressing(true);
                          setCompressionProgress(0);

                          try {
                            const compressedFiles = [];

                            for (const file of files) {
                              setCompressionFileName(file.name);

                              const compressedFile = await compressAttachment(
                                file,
                                (progress) => setCompressionProgress(progress),
                              );

                              compressedFiles.push(compressedFile);
                            }

                            setAttachmentFiles((prev) => {
                              const updated = [...prev, ...compressedFiles];

                              setValue("attachment", updated, {
                                shouldDirty: true,
                              });

                              return updated;
                            });
                          } catch (error) {
                            toast.error(
                              error?.message || "फ़ाइल संपीड़ित नहीं हो सकी।",
                            );
                          } finally {
                            setPendingFiles([]);
                            setIsCompressing(false);
                            setCompressionProgress(0);
                            setCompressionFileName("");
                            e.target.value = "";
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* ATTACHMENT PREVIEW */}
                <div>
                  {isCompressing && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="truncate font-medium text-blue-800">
                          Processing: {compressionFileName}
                        </span>
                        <span className="font-semibold text-blue-800">
                          {Math.round(compressionProgress)}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{ width: `${compressionProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <FilePreview
                    files={attachmentFiles}
                    pendingFiles={pendingFiles}
                    existingFiles={existingAttachments}
                    isCompressing={isCompressing}
                    compressionProgress={compressionProgress}
                    compressionFileName={compressionFileName}
                    onRemoveExisting={(index) =>
                      setExistingAttachments((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    onRemoveNew={(index) =>
                      setAttachmentFiles((prev) => {
                        const updated = prev.filter((_, i) => i !== index);

                        setValue("attachment", updated, {
                          shouldDirty: true,
                        });

                        return updated;
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Fixed Bottom Button */}
            {/* Fixed Bottom Button */}
            <div className="border-t border-gray-200 bg-white p-3">
              <button
                type="submit"
                disabled={isSubmitting || isCompressing}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-base font-bold text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader />
                    अपडेट हो रहा है...
                  </>
                ) : isCompressing ? (
                  <>
                    <Loader />
                    फ़ाइल प्रोसेस हो रही है...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    टिकट अपडेट करें
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

export default FieldWorkerTicketCreateEdit;