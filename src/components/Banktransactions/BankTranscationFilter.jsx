import React, { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { formatDate } from "../../utils/dateFormatter";
import { AsyncPaginate } from "react-select-async-paginate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getPropertyDropdown,
  usePropertyDropdown,
} from "../../components/properties/services/index";
const BankTransactionFilter = ({
  isOpen,
  onClose,
  apiData,
  filters,
  onApply,
  handleReset,
  resetTrigger,
}) => {
  const { data: dropdownData } = usePropertyDropdown({
    page: 1,
    limit: 10,
    search: "",
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      fromDate: null,
      toDate: null,
      bankAccount: null,
      status: null,
      assignee: null,
      transactionType: null,
    },
  });

  const loadPropertyOptions = async (search, loadedOptions, { page }) => {
    const res = await getPropertyDropdown({ page, limit: 10, search });
    return {
      options: res.data.map((item) => ({
        value: item._id,
        label: item.propertyCode,
        location: item.propertyLocation,
        bedCount: item.bedCount,
      })),
      hasMore: res.hasMore,
      additional: { page: page + 1 },
    };
  };
  const bankAccountOptions = [
    {
      value: "HDFC",
      label: "HDFC",
    },
    {
      value: "ICICI",
      label: "ICICI",
    },
  ];
  const statusOptions = [
    {
      value: "Updated",
      label: "Updated",
    },
    {
      value: "Pending",
      label: "Pending",
    },
  ];
  const transactionTypeOptions = [
    {
      value: "deposit",
      label: "Deposit",
    },
    {
      value: "withdrawal",
      label: "Withdrawal",
    },
  ];
  const assigneeOptions = [
    ...new Map(
      apiData
        .filter((item) => item.userId)
        .map((item) => [
          item.userId._id,
          {
            value: item.userId._id,
            label: item.userId.fullName,
          },
        ]),
    ).values(),
  ];

  const onSubmit = (data) => {
    const filters = {};

    if (data.fromDate) {
      filters.fromDate = formatDate(data.fromDate);
    }

    if (data.toDate) {
      filters.toDate = formatDate(data.toDate);
    }
    if (data.bankAccount) filters.source = data.bankAccount.value;

    if (data.propertyId) filters.propertyId = data.propertyId.value;

    if (data.status) filters.status = data.status.value;

    if (data.assignee) filters.userId = data.assignee.value;

    if (data.transactionType) {
      filters.transactionType = data.transactionType.value;
    }

    if (data.minAmount) filters.minAmount = data.minAmount;

    if (data.maxAmount) filters.maxAmount = data.maxAmount;

    if (data.chqNo) filters.chqNo = data.chqNo;

    if (data.narration) filters.narration = data.narration;

    const labels = [
      data.fromDate && {
        key: "fromDate",
        label: `From : ${formatDate(data.fromDate)}`,
      },

      data.toDate && {
        key: "toDate",
        label: `To : ${formatDate(data.toDate)}`,
      },

      data.transactionType && {
        key: "transactionType",
        label: `Type : ${data.transactionType.label}`,
      },

      data.bankAccount && {
        key: "source",
        label: `Bank : ${data.bankAccount.label}`,
      },

      data.status && {
        key: "status",
        label: `Status : ${data.status.label}`,
      },
    ].filter(Boolean);

    onApply(filters, labels);

    onClose();
  };
  useEffect(() => {
    reset({
      propertyCode: null,
      propertyLocation: null,
      bedCount: null,
      status: null,
    });
  }, [resetTrigger, reset]);
  useEffect(() => {
    if (!isOpen) return;

    reset({
      fromDate: filters.fromDate ? new Date(filters.fromDate) : null,
      toDate: filters.toDate ? new Date(filters.toDate) : null,
      bankAccount: filters.source
        ? bankAccountOptions.find((x) => x.value === filters.source)
        : null,
      transactionType: filters.transactionType
        ? transactionTypeOptions.find(
            (x) => x.value === filters.transactionType,
          )
        : null,
    });
  }, [filters, isOpen, reset]);
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white z-50 shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-5 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600">
          <h2 className="font-bold text-lg">Filters</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          {/* Property Code */}
          {/* <Controller
            name="propertyId"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Property Code</label>

                <AsyncPaginate
                  additional={{
                    page: 1,
                  }}
                  debounceTimeout={500}
                  isClearable
                  placeholder=""
                  loadOptions={loadPropertyOptions}
                  styles={selectStyles}
                  value={field.value}
                  onChange={(selectedOption) => field.onChange(selectedOption)}
                />
              </div>
            )}
          /> */}
          {/* from date */}
          <Controller
            name="fromDate"
            control={control}
            render={({ field }) => (
              <div
                className={`datepicker-group ${field.value ? "has-value" : ""}`}
              >
                <label className="datepicker-label">From Date</label>

                <DatePicker
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  isClearable
                  placeholderText="From Date"
                  dateFormat="dd MMM yyyy"
                  className="custom-datepicker"
                />
              </div>
            )}
          />

          {/* To Date */}
          <Controller
            name="toDate"
            control={control}
            render={({ field }) => (
              <div
                className={`datepicker-group ${field.value ? "has-value" : ""}`}
              >
                <label className="datepicker-label">To Date</label>

                <DatePicker
                  selected={field.value}
                  onChange={(date) => field.onChange(date)}
                  isClearable
                  placeholderText="To Date"
                  dateFormat="dd MMM yyyy"
                  className="custom-datepicker"
                />
              </div>
            )}
          />

          {/* bank account */}
          <Controller
            name="bankAccount"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Bank Account</label>

                <Select
                  options={bankAccountOptions}
                  value={field.value}
                  onChange={field.onChange}
                  styles={selectStyles}
                  isClearable
                  placeholder="Bank Account"
                />
              </div>
            )}
          />
          {/* status */}
          {/* <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                options={statusOptions}
                value={field.value}
                onChange={field.onChange}
                styles={selectStyles}
                isClearable
              />
            )}
          /> */}
          {/* assignee */}
          {/* <Controller
            name="assignee"
            control={control}
            render={({ field }) => (
              <Select
                options={assigneeOptions}
                value={field.value}
                onChange={field.onChange}
                styles={selectStyles}
                isClearable
              />
            )}
          /> */}
          {/* deposit and widthdrawal radio */}
          <Controller
            name="transactionType"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Transaction Type</label>

                <Select
                  options={transactionTypeOptions}
                  value={field.value}
                  onChange={field.onChange}
                  styles={selectStyles}
                  isClearable
                  placeholder="Transaction Type"
                />
              </div>
            )}
          />

          {/* Status */}
          {/* <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <div className={`select-group ${field.value ? "has-value" : ""}`}>
                <label className="select-label">Status</label>

                <Select
                  options={statusOptions}
                  isSearchable
                  isClearable
                  placeholder="Status"
                  value={field.value}
                  onChange={(option) => field.onChange(option)}
                  styles={selectStyles}
                />
              </div>
            )}
          /> */}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="w-full border border-gray-300 py-2 rounded-lg"
            >
              Reset
            </button>

            <button
              type="submit"
              className="w-full bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 border-b border-slate-600 text-white py-2 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default BankTransactionFilter;