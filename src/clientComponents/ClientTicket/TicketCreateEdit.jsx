import React, { useMemo, useRef } from 'react'
import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { selectStyles } from "../../utils/selectStyles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCreateTicketData, useSingleTicketData, useUpdateTicketData, useClientTicketDetails } from "./services";
import { useEffect, useState } from "react";
import { useCurrentUser } from '../../auth/services';
import { convertStringFormatDate, convertStringFormatDateTime, formatDateAndTime } from '../../utils/dateFormatter';
import { AsyncPaginate } from 'react-select-async-paginate';
import { Link } from "react-router-dom";
import { usePropertiesDropdown } from '../../components/Clients/services';
import { getPropertyDropdown } from '../../components/properties/services';
import Loader from '../../components/common/Loader';
import { useBatchOptions } from '../../components/Options/services';
import FilePreview from '../../components/common/FilePreview';
function TicketCreateEdit() {
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

  // Api Hooks
  const { mutate: createTicket, isPending: isCreateTicket } = useCreateTicketData();
  const { mutate: updateTicket, isPending: isUpdateTicket } = useUpdateTicketData();
  const { data: singleTicket } = useSingleTicketData(id);
  const { data: propertiesDropdown, isPending: ispropertiesDropdown } = usePropertiesDropdown()
  const { data: currentUser, isLoading } = useCurrentUser();
  const clientId = currentUser?.user?.clientId;
  const isClient = currentUser?.user?.role === "Client";
  const { data: clientTicketDetails } =
    useClientTicketDetails(clientId, isClient && !id);
  const { data: options = {} } = useBatchOptions([
    "department",
    "categories",
    "ticketstatus",
  ]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  const assignee = watch("assignee");
  useEffect(() => {
    if (id && singleTicket?.data) {
      const ticket = singleTicket.data;

      reset({
        ...ticket,
      });

      setExistingAttachments(ticket.attachment || []);
    }
  }, [id, singleTicket, reset]);

  const DepartmentOptions = options.department || [];
  const CategoryOptions = options.categories || [];
  const StatusOptions = options.ticketstatus || [];


  const propertiesOptions = useMemo(() => {
    return (
      propertiesDropdown?.data?.map((property) => ({
        value: property.propertyCode,
        label: property.propertyCode,
        propLocation: property.propertyLocation,
      })) || []
    );
  }, [propertiesDropdown?.data]);
  const propertyInitialized = useRef(false);
  useEffect(() => {
    if (
      id ||
      !isClient ||
      !clientTicketDetails?.success ||
      !clientTicketDetails?.data ||
      propertyInitialized.current
    ) {
      return;
    }

    const clientDetails = clientTicketDetails.data;

    const propertyCode =
      clientDetails?.propertyId?.propertyCode || "";

    const bedNo =
      clientDetails?.bedId?.bedNo || "";

    const roomNo =
      clientDetails?.bedId?.roomNo || "";

    if (!propertyCode) return;

    const selectedProperty = propertiesOptions.find(
      (property) => property.value === propertyCode
    );

    // Property options अजून load झाले नसतील
    if (!selectedProperty) return;

    setValue("propertyCode", propertyCode);

    // Property Options मधून Location
    setValue(
      "propertyLocation",
      selectedProperty.propLocation || ""
    );

    if (bedNo) {
      setValue("bedNo", bedNo);
    }

    if (roomNo) {
      setValue("roomNo", roomNo);
    }

    propertyInitialized.current = true;

  }, [
    id,
    isClient,
    clientTicketDetails,
    propertiesOptions,
    setValue,
  ]);

  const loadPropertyOptions = async (
    search,
    loadedOptions,
    { page }
  ) => {
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
            value: item.propertyCode,
            label: item.propertyCode,
            propLocation: item.propertyLocation, // <-- Add this
          },
        ])
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

  const ManagerOptions = [
    { value: "Nerul ( E )", label: "Nerul ( E )" },
    { value: "Nerul ( W )", label: "Nerul ( W )" },
  ];
  const AssigneeOptions = [
    { value: "Nerul ( E )", label: "Nerul ( E )" },
    { value: "Nerul ( W )", label: "Nerul ( W )" },
  ];


  const onSubmit = (data) => {
    const hasAttachmentChanges =
      attachmentFiles.length > 0 ||
      existingAttachments.length !== (singleTicket?.data?.attachment?.length || 0);

    if (!isDirty && !hasAttachmentChanges) {
      toast.dismiss();
      toast.info("No changes detected.");
      return;
    }
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
        key !== "createdById"
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

    }
    formData.append("createdBy", currentUser?.user?.role || "");
    formData.append("createdByName", currentUser?.user?.name || "");
    formData.append("createdById", currentUser?.user?.clientId || "");
    // Existing attachments
    formData.append(
      "existingAttachments",
      JSON.stringify(existingAttachments)
    );
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
            toast.dismiss()
            toast.success(res.message);

            navigate("/client-tickets");

            reset();

            setAttachmentFiles([]);
            setExistingAttachments([]);
          },

          onError: (err) => {
            toast.dismiss()
            toast.error(
              err?.response?.data?.message || "Update Failed"
            );
          },
        }
      );
    } else {
      createTicket(formData, {
        onSuccess: (res) => {
          toast.dismiss()
          toast.success(res.message);

          navigate("/client-tickets");

          reset();

          setAttachmentFiles([]);
          setExistingAttachments([]);
        },

        onError: (err) => {
          toast.dismiss()
          toast.error(
            err?.response?.data?.message || "Create Failed"
          );
        },
      });
    }
  };



  const input =
    "w-full border border-gray-300 rounded-lg px-3 py-2 hover  focus:ring-2 focus:ring-gray-500 outline-none";
  return (
    <div className="max-w-12xl mx-auto px-6">

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-400 px-4 py-2">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">
                {id ? "Update Ticket" : "Create Ticket"}
              </h1>

              <p className="text-sm text-gray-500">
                {id
                  ? `${singleTicket?.data?.ticketId} - ${formatDateAndTime(singleTicket?.data?.createdAt)}`
                  : "Create and manage PG Ticket Details"}
              </p>
            </div>

            <div className="flex justify-end gap-5">
              <Link to="/client-tickets">
                <button
                  type="button"
                  className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </Link>

              <button
                type="submit"
                disabled={isCreateTicket || isUpdateTicket}
                className="theme-btn text-white px-5 py-2 rounded-lg"
              >
                {isCreateTicket || isUpdateTicket
                  ? <div className='flex justify-center items-center gap-2'><Loader /> Processing...</div>
                  : id
                    ? "Update Ticket"
                    : "Create Ticket"}
              </button>
            </div>

          </div>
        </div>
        {/* Property Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center  mb-4">
            <h2 className="text-xl font-semibold mb-4">Ticket Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Property */}
            <Controller
              name="propertyCode"

              control={control}
              rules={{
                required: "Property is required",
              }}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label form-label required-label">
                    Property
                  </label>

                  <AsyncPaginate
                    additional={{ page: 1 }}
                    debounceTimeout={500}
                    isClearable
                    isDisabled
                    placeholder=""
                    loadOptions={loadPropertyOptions}
                    styles={selectStyles}
                    value={
                      field.value
                        ? {
                          value: field.value,
                          label: field.value,
                        }
                        : null
                    }
                    onChange={(selected) => {
                      field.onChange(selected?.value || ""); // Sirf value save hogi

                      setValue(
                        "propertyLocation",
                        selected?.propLocation || ""
                      );
                    }}
                  />
                  {errors.propertyCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.propertyCode.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Department */}
            <Controller
              name="department"
              control={control}
              rules={{
                required: "Department is required",
              }}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label form-label required-label">Department</label>
                  <Select
                    {...field}
                    options={DepartmentOptions}
                    placeholder=""
                    isClearable
                    value={DepartmentOptions.find(
                      (x) => x.value === field.value
                    )}
                    onChange={(e) => field.onChange(e?.value)}
                    styles={selectStyles}
                  />
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.department.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Category */}
            <Controller
              name="category"
              control={control}
              rules={{
                required: "Category is required",
              }}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label form-label required-label">
                    Category
                  </label>

                  <Select
                    {...field}
                    options={CategoryOptions}
                    placeholder=""
                    isClearable
                    value={CategoryOptions.find(
                      (x) => x.value === field.value
                    )}
                    onChange={(e) => {
                      const category = e?.value || "";

                      field.onChange(category);

                      if (category === "Notice") {
                        setValue("priority", "High", {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    styles={selectStyles}
                  />

                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>
              )}
            />
            {/* Title */}
            <div className="form-group md:col-span-1">
              <input
                {...register("title", {
                  required: "Title is required",
                })}
                className="form-input"
                placeholder=" "
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
              <label className="form-label form-label required-label">Title</label>
            </div>
            {id && (
              <Controller
                name="status"
                control={control}
                rules={{
                  required: "Status is required",
                }}
                render={({ field }) => (
                  <div className={`select-group ${field.value ? "has-value" : ""}`}>
                    <label className="select-label form-label required-label">Status</label>
                    <Select
                      {...field}
                      options={
                        isClient
                          ? StatusOptions.filter(
                            (option) => option.value === "ReOpen"
                          )
                          : StatusOptions
                      }
                      placeholder=""
                      isClearable
                      value={StatusOptions.find(
                        (x) => x.value === field.value
                      )}
                      onChange={(e) => field.onChange(e?.value)}
                      styles={selectStyles}
                    />
                    {errors.status && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.status.message}
                      </p>
                    )}
                  </div>
                )}
              />
            )}
            {id && (
              <div className=' md:col-span-2'></div>
            )
            }
            <div className="form-group md:col-span-2">
              <textarea
                disabled={id ? true : false}
                rows={5}
                {...register("description", {
                  required: "Description is required",
                })}
                className="form-input"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
              <label className="form-label form-label required-label">
                Description
              </label>
            </div>
            <div className="form-group md:col-span-2">
              <input
                type="file"
                multiple
                className="form-input"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setAttachmentFiles((prev) => {
                    const updated = [...prev, ...files];
                    setValue("attachment", updated);
                    return updated;
                  });
                  e.target.value = "";
                }}
              />
              <label className="form-label">
                Attachment
              </label>
              <FilePreview
                files={attachmentFiles}
                existingFiles={existingAttachments}
                onRemoveExisting={(index) =>
                  setExistingAttachments((prev) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
                onRemoveNew={(index) =>
                  setAttachmentFiles((prev) =>
                    prev.filter((_, i) => i !== index)
                  )
                }
              />
            </div>

          </div>
        </div>

        {/* Utility Details */}
        {singleTicket?.data?.workLogs?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

            <h2 className="text-xl font-semibold mb-4">
              WorkLog
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Add WorkLog */}
              {id && (
                <div className="form-group">
                  <textarea
                    rows={5}
                    {...register("newWorkLog")}
                    className="form-input"
                  />

                  <label className="form-label">
                    Add WorkLog
                  </label>
                </div>
              )}

              {/* Work Log History */}
              {id && (
                <div className="border rounded-lg bg-gray-50 py-2 px-4 h-44 flex flex-col md:col-span-1">

                  <h3 className="font-semibold text-lg mb-1">
                    Work Log History
                  </h3>

                  <div className="flex-1 overflow-y-auto">
                    {singleTicket.data.workLogs
                      .slice()
                      .reverse()
                      .map((log) => (
                        <div
                          key={log._id}
                          className="border-b py-3 last:border-b-0"
                        >
                          <small className="text-gray-500">
                            {log.createdBy || "System"} •{" "}
                            {formatDateAndTime(log.createdAt)}
                          </small>

                          <p className="whitespace-pre-line text-sm">
                            {log.message}
                          </p>
                        </div>
                      ))}
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

        {/* Owner Details */}
        {/* {id && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

            <h2 className="text-xl font-semibold mb-4">
              Auditor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="form-group md:col-span-2">
                <textarea
                  {...register("auditorLog")}
                  placeholder=" "
                  className="form-input min-h-25"
                />
                <label className="form-label">
                  Auditor Log
                </label>
              </div>


              <div className="form-group">
                <input
                  {...register("actualTimeSpent")}
                  className="form-input"
                  placeholder=" "
                />

                <label className="form-label">
                  Actual Time
                </label>
              </div>
              {singleTicket?.data?.auditorLogs?.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50 h-48 col-span-4 flex flex-col">
                  <h3 className="font-semibold mb-3 shrink-0">
                    Auditor Log History
                  </h3>

                  <div className="overflow-y-auto flex-1 pr-2">
                    {singleTicket.data.auditorLogs
                      .slice()
                      .reverse()
                      .map((log) => (
                        <div
                          key={log._id}
                          className="border-b last:border-b-0 py-3"
                        >
                          <p className="break-words">
                            {log.message}
                          </p>

                          <small className="text-gray-500">
                            {log.createdBy || "System"} •{" "}
                            {new Date(log.createdAt).toLocaleString()}
                          </small>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )} */}
        <div className="flex justify-end gap-5">
          <Link to="/client-tickets">
            <button
              type="button"
              className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
          </Link>

          <button
            type="submit"
            disabled={isCreateTicket || isUpdateTicket}
            className="theme-btn text-white px-5 py-2 rounded-lg"
          >
            {isCreateTicket || isUpdateTicket
              ? <div className='flex justify-center items-center gap-2'><Loader /> Processing...</div>
              : id
                ? "Update Ticket"
                : "Create Ticket"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default TicketCreateEdit