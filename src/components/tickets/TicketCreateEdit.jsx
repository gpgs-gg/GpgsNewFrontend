import React from 'react'
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import { selectStyles } from "../../utils/selectStyles";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useCreateTicketData, useSingleTicketData, useUpdateTicketData } from "./services";
import { useEffect, useState } from "react";
import { usePropertiesDropdown } from '../beds/services';
import { useCurrentUser } from '../../auth/services';
import { convertStringFormatDate, convertStringFormatDateTime } from '../../utils/dateFormatter';
import FilePreview from '../common/FilePreview';
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
    formState: { errors },
  } = useForm();

  // Api Hooks
  const { mutate: createTicket, isPending: isCreateTicket } = useCreateTicketData();
  const { mutate: updateTicket, isPending: isUpdateTicket } = useUpdateTicketData();
  const { data: singleTicket } = useSingleTicketData(id);
  const { data: propertiesDropdown, isPending: ispropertiesDropdown } = usePropertiesDropdown()
  const { data: currentUser, isLoading } = useCurrentUser();

  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);

  const assignee = watch("assignee");
  // useEffect(() => {
  //   if (id && singleTicket?.data) {
  //     const ticket = singleTicket.data;

  //     reset({
  //       ...ticket,

  //       propertyCode: ticket.propertyCode || "",
  //       department: ticket.department || "",
  //       category: ticket.category || "",
  //       priority: ticket.priority || "",
  //       manager: ticket.manager || "",
  //       assignee: ticket.assignee || "",
  //       title: ticket.title || "",
  //       description: ticket.description || "",
  //       status: ticket.status || "",
  //       customerImpacted: ticket.customerImpacted || "",
  //       escalated: ticket.escalated || "",
  //       targetDate: ticket.targetDate
  //         ? new Date(ticket.targetDate)
  //         : null,

  //       estimatedTimeToResolve:
  //         ticket.estimatedTimeToResolve || "",

  //       internalComments:
  //         ticket.internalComments || "",
  //     });

  //     setExistingAttachments(ticket.attachment || []);
  //   }
  // }, [id, singleTicket, reset]);


  useEffect(() => {
    if (id && singleTicket?.data) {
      const ticket = singleTicket.data;

      reset({
        ...ticket,

        targetDate: ticket.targetDate
          ? new Date(ticket.targetDate)
          : null,

        acknowledgedDate: ticket.acknowledgedDate
          ? new Date(ticket.acknowledgedDate)
          : null,
      });

      setExistingAttachments(ticket.attachment || []);
    }
  }, [id, singleTicket, reset]);



  const StatusOptions = [
    { value: "Open", label: "Open" },
    { value: "Acknowledged", label: "Acknowledged" },
    { value: "In Progress", label: "In Progress" },
    { value: "On Hold", label: "On Hold" },
    { value: "Resolved", label: "Resolved" },
    { value: "Closed", label: "Closed" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "ReOpen", label: "ReOpen" },
  ];
  const PoliceNocStatusOptions = [
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
  ];

  const RouterConnectionTypeOptions = [
    { value: "Main Router", label: "Main Router" },
    { value: "Sub Router", label: "Sub Router" },
  ];
  const LocationOptions = [
    { value: "Nerul ( E )", label: "Nerul ( E )" },
    { value: "Nerul ( W )", label: "Nerul ( W )" },
  ];

  //   { value: "Nerul ( E )", label: "Nerul ( E )" },
  //   { value: "Nerul ( W )", label: "Nerul ( W )" },
  // ];
  const propertiesOptions =
    propertiesDropdown?.data?.map((property) => ({
      value: property.propertyCode,
      label: property.propertyCode,
      propLocation: property.propertyLocation,
    })) || [];

  console.log("propertiesOptions", propertiesOptions);
  const DepartmentOptions = [
    { value: "Nerul ( E )", label: "Nerul ( E )" },
    { value: "Nerul ( W )", label: "Nerul ( W )" },
  ];
  const CategoryOptions = [
    { value: "Nerul ( E )", label: "Nerul ( E )" },
    { value: "Nerul ( W )", label: "Nerul ( W )" },
  ];
  const PriorityOptions = [
    { value: "Critical", label: "Critical" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
  ];
  const ManagerOptions = [
    { value: "Nerul ( E )", label: "Nerul ( E )" },
    { value: "Nerul ( W )", label: "Nerul ( W )" },
  ];
  const AssigneeOptions = [
    { value: "Nerul ( E )", label: "Nerul ( E )" },
    { value: "Nerul ( W )", label: "Nerul ( W )" },
  ];


  const onSubmit = (data) => {
    const formData = new FormData();

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (
        value !== null &&
        value !== undefined &&
        key !== "attachment" &&
        key !== "workLogs" &&
        key !== "createdBy" &&
        key !== "createdByName"
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

    formData.append("createdBy", currentUser?.user?.role || "");
    formData.append("createdByName", currentUser?.user?.name || "");
    // formData.append("dateCreated", convertStringFormatDateTime(new Date()));      
    // formData.append("propertyLocation", )
    formData.append(
      "auditorLog",
      data.auditorLog || ""
    );

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
            toast.success(res.message);

            navigate("/tickets");

            reset();

            setAttachmentFiles([]);
            setExistingAttachments([]);
          },

          onError: (err) => {
            toast.error(
              err?.response?.data?.message || "Update Failed"
            );
          },
        }
      );
    } else {
      createTicket(formData, {
        onSuccess: (res) => {
          toast.success(res.message);

          navigate("/tickets");

          reset();

          setAttachmentFiles([]);
          setExistingAttachments([]);
        },

        onError: (err) => {
          toast.error(
            err?.response?.data?.message || "Create Failed"
          );
        },
      });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
                  ? `${singleTicket?.data?.ticketId} - ${formatDate(singleTicket?.data?.createdAt)}`
                  : "Create and manage PG Ticket Details"}
              </p>
            </div>

            <div className="flex justify-end gap-5">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isCreateTicket || isUpdateTicket}
                className="theme-btn text-white px-5 py-2 rounded-lg"
              >
                {isCreateTicket || isUpdateTicket
                  ? "Processing..."
                  : id
                    ? "Update Ticket"
                    : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
        {/* Property Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Ticket Details</h2>

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

                  <Select
                    {...field}
                    options={propertiesOptions}
                    placeholder=""
                    isClearable
                    isDisabled={id ? true : false}
                    value={propertiesOptions.find(
                      (x) => x.value === field.value
                    )}
                    onChange={(selected) => {
                      field.onChange(selected?.value || "");

                      // Automatically set property location
                      setValue("propertyLocation", selected?.propLocation || "");
                    }}
                    styles={selectStyles}
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
                  <label className="select-label form-label required-label">Category</label>
                  <Select
                    {...field}
                    options={CategoryOptions}
                    placeholder=""
                    isClearable
                    value={CategoryOptions.find(
                      (x) => x.value === field.value
                    )}
                    onChange={(e) => field.onChange(e?.value)}
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

            {/* Priority */}
            <Controller
              name="priority"
              control={control}
              rules={{
                required: assignee ? "Priority is required" : false,
              }}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className={`select-label form-label ${assignee ? "required-label" : ""}`}>Priority</label>
                  <Select
                    {...field}
                    options={PriorityOptions}
                    placeholder=""
                    isClearable
                    value={PriorityOptions.find(
                      (x) => x.value === field.value
                    )}
                    onChange={(e) => field.onChange(e?.value)}
                    styles={selectStyles}
                  />
                  {errors.priority && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.priority.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* Title */}
            <div className="form-group md:col-span-2">
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

            {/* Target Date */}
            <Controller
              name="targetDate"
              control={control}
              render={({ field }) => (
                <div className={`datepicker-group ${field.value ? "has-value" : ""}`}>
                  <label className="datepicker-label">
                    Target Date
                  </label>

                  <DatePicker
                    selected={field.value}
                    onChange={(date) => field.onChange(date)}
                    dateFormat="dd MMM yyyy"
                    className="custom-datepicker"
                  />
                </div>
              )}
            />

            {/* Status */}
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
                      options={StatusOptions}
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
          </div>
        </div>

        {/* Internet Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

          <h2 className="text-xl font-semibold mb-4">
            Assignment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            <Controller
              name="manager"
              control={control}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label">Manager</label>

                  <Select
                    {...field}
                    options={ManagerOptions}
                    placeholder=""
                    isClearable
                    value={ManagerOptions.find(x => x.value === field.value)}
                    onChange={(e) => field.onChange(e?.value)}
                    styles={selectStyles}
                  />

                </div>
              )}
            />

            <Controller
              name="assignee"
              control={control}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label">Assignee</label>

                  <Select
                    {...field}
                    options={AssigneeOptions}
                    placeholder=""
                    isClearable
                    value={AssigneeOptions.find(x => x.value === field.value)}
                    onChange={(e) => field.onChange(e?.value)}
                    styles={selectStyles}
                  />

                </div>
              )}
            />

            <Controller
              name="customerImpacted"
              control={control}
              rules={{
                required: "Customer Impacted is required",
              }}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label form-label required-label">Customer Impacted</label>

                  <Select
                    {...field}
                    options={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" }
                    ]}
                    placeholder=""
                    isClearable
                    value={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" }
                    ].find(x => x.value === field.value)}
                    onChange={(e) => field.onChange(e?.value)}
                    styles={selectStyles}
                  />
                  {errors.customerImpacted && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customerImpacted.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="escalated"
              control={control}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label">Escalated</label>

                  <Select
                    {...field}
                    options={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" }
                    ]}
                    placeholder=""
                    isClearable
                    value={[
                      { value: "Yes", label: "Yes" },
                      { value: "No", label: "No" }
                    ].find(x => x.value === field.value)}
                    onChange={(e) => field.onChange(e?.value)}
                    styles={selectStyles}
                  />

                </div>
              )}
            />

          </div>

        </div>

        {/* Utility Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">

          <h2 className="text-xl font-semibold mb-4">
            Description
          </h2>

          <div className="grid grid-cols-1 gap-4">

            <div className="form-group">
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

        {/* Owner Details */}
        {id && (
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

              {/* <div className="form-group">
                <input
                  {...register("internalComments")}
                  className="form-input"
                  placeholder=" "
                />

                <label className="form-label">
                  Internal Comments
                </label>
              </div> */}
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
        )}

        {/* Agreement Details */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Agreement Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Controller
              name="agreement.propertyStartDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${field.value ? "has-value" : ""
                    }`}
                >
                  <label className="datepicker-label">
                    Property Start Date
                  </label>
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
            <Controller
              name="agreement.propertyEndDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${field.value ? "has-value" : ""
                    }`}
                >
                  <label className="datepicker-label">
                    Property End Date
                  </label>
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

            <Controller
              name="agreement.agreementStartDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${field.value ? "has-value" : ""
                    }`}
                >
                  <label className="datepicker-label">
                    Agreement Start Date
                  </label>
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

            <Controller
              name="agreement.agreementEndDate"
              control={control}
              render={({ field }) => (
                <div
                  className={`datepicker-group ${field.value ? "has-value" : ""
                    }`}
                >
                  <label className="datepicker-label">
                    Agreement End Date
                  </label>
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

            <Controller
              name="agreement.agreementStatus"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label">
                    Status
                  </label>

                  <Select
                    {...field}
                    options={statusOptions}
                    isClearable
                    placeholder=""
                    value={statusOptions.find(
                      (option) => option.value === field.value
                    )}
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />

            <div className="form-group">
              <input
                {...register("agreement.policeNocNo")}
                placeholder=" "
                type="text"
                className="form-input"
              />
              <label className="form-label">
                Police Noc No </label>
            </div>

            <Controller
              name="agreement.policeNocStatus"
              control={control}
              defaultValue={null}
              render={({ field }) => (
                <div className={`select-group ${field.value ? "has-value" : ""}`}>
                  <label className="select-label">
                    Police Noc Status
                  </label>

                  <Select
                    {...field}
                    options={PoliceNocStatusOptions}
                    isClearable
                    placeholder=""
                    value={PoliceNocStatusOptions.find(
                      (option) => option.value === field.value
                    )}
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    styles={selectStyles}
                  />
                </div>
              )}
            />

            <div className="form-group">
              <input
                {...register("agreement.dealDetails")}
                placeholder=" "
                type="text"
                className="form-input"
              />
              <label className="form-label">
                Deal Details</label>
            </div>

            <div className="form-group md:col-span-4">
              <textarea
                {...register("agreement.comment")}
                placeholder=""
                className="form-input md:col-span-4"
              />
              <label className="form-label">
                Agreement Comment</label>
            </div>
          </div>
        </div> */}

        <div className="flex justify-end gap-5">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="border border-gray-600 hover:bg-gray-700 hover:text-white px-6 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isCreateTicket || isUpdateTicket}
            className="theme-btn text-white px-5 py-2 rounded-lg"
          >
            {isCreateTicket || isUpdateTicket
              ? "Processing..."
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