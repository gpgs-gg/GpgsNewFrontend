import React from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import { selectStyles } from "../../utils/selectStyles";
import { formatDate } from "../../utils/dateFormatter";
import { AsyncPaginate } from "react-select-async-paginate";
import { getPropertyDropdown } from "../properties/services";
import { useClientDataByProperty, useUpdateBankTransactionReceived } from "./services";
import { toast } from "react-toastify";


// ===========================
// Property Options
// ===========================
const loadPropertyOptions = async (search, loadedOptions, { page }) => {
    const res = await getPropertyDropdown({
        page,
        limit: 20,
        search,
    });

    return {
        options: res.data.map((item) => ({
            value: item._id,
            label: item.propertyCode,
        })),
        hasMore: res.hasMore,
        additional: {
            page: page + 1,
        },
    };
};
const monthOptions = [
    { value: 1, label: "Jan 2026" },
    { value: 2, label: "Feb 2026" },
    { value: 3, label: "Mar 2026" },
    { value: 4, label: "Apr 2026" },
    { value: 5, label: "May 2026" },
    { value: 6, label: "Jun 2026" },
    { value: 7, label: "Jul2026" },
    { value: 8, label: "Aug 2026" },
    { value: 9, label: "Sept 2026" },
    { value: 10, label: "Oct 2026" },
    { value: 11, label: "Nov 2026" },
    { value: 12, label: "Dec 2026" },
];

const paymentTypeOptions = [
    { value: "rent", label: "Rent" },
    { value: "deposit", label: "Deposit" },
    { value: "processing", label: "Processing Fees" },
    { value: "parking", label: "Parking Charges" },
];

const MapBankTransactionDrawer = ({ isOpen, onClose, transaction }) => {
    const currentMonthOption = monthOptions.find(
        (item) => item.value === new Date().getMonth() + 1
    );

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            propertyId: null,
            client: null,
            month: currentMonthOption,
            paymentType: paymentTypeOptions[0],
        },
    });
    const selectedProperty = watch("propertyId");
    const selectedClient = watch("client");
    const propertyId = selectedProperty?.value;

    const {
        data: clientData,
        isPending,
    } = useClientDataByProperty(propertyId);



    const { mutate: updateBankTransactionReceived } =
        useUpdateBankTransactionReceived();

    // const clientOptions = clientData?.data?.map((item) => ({
    //     value: item._id,  // cleint id 
    //     label: item.fullName,
    //     propertyId: item.propertyId,
    //     bedId: item.bedId._id,
    //     roomNo: item.bedId.roomNo,
    //     bedNo: item.bedId.bedNo,
    // }));

    const clientOptions = clientData?.data?.map((item) => ({
        value: item._id,
        label: item.fullName,
        propertyId: item.propertyId,
        bedId: item.bedId._id,
        roomNo: item.bedId.roomNo,
        bedNo: item.bedId.bedNo,
        month: item.month,
        year: item.year,
        monthName: item.monthName,
        currentDue: item.currentDue,
        totalReceived: item.totalReceived,
    }));

    const onSubmit = (data) => {
        const selectedMonth = Number(data.month.value);
        const clientMonth = Number(selectedClient.month);
        const latestRentHistoryMonthName = (selectedClient.monthName);
        const latestRentHistoryYear = Number(selectedClient.year);

        if (clientMonth !== selectedMonth) {
            toast.dismiss();
            toast.error(
                `The latest rent history for this client is ${latestRentHistoryMonthName} ${latestRentHistoryYear}. Please select ${latestRentHistoryMonthName} ${latestRentHistoryYear} from the Month field before mapping this transaction.`
            );
            return;
        }

        const payload = {
            transactionId: transaction._id,
            clientId: data.client.value,
            propertyId: data.client.propertyId,
            bedId: data.client.bedId,
            month: data.month.value,
            year: new Date().getFullYear(),
            paymentType: data.paymentType.value,
            amount: Number(transaction.deposit || 0),
            paymentComment : transaction.narration,
            transactionDate: transaction.date,
            narration: transaction.narration,
        };

        updateBankTransactionReceived(payload, {
            onSuccess: (response) => {
                toast.dismiss()
                toast.success(
                    response?.message || "Bank transaction updated successfully."
                );
                // Optional
                reset();
                // navigate("/bank-transactions");
            },
            onError: (error) => {
                toast.dismiss()
                toast.error(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong."
                );
            },
        });
    };



    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40"
                    onClick={onClose}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full w-[430px] bg-white z-50 shadow-xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-5 bg-linear-to-r from-slate-800 via-slate-700 to-slate-900 text-white">
                    <h2 className="text-lg font-semibold">
                        Map Bank Transaction
                    </h2>

                    <button onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="p-5 space-y-5"
                >
                    {/* Transaction Summary */}
                    <div className="rounded-xl shadow-sm border border-gray-400 bg-slate-50 p-4 space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">
                                Transaction Amount
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                                {transaction?.deposit}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Narration
                            </p>
                            <p className="font-medium">
                                {transaction?.narration}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">
                                Date
                            </p>
                            <p>{formatDate(transaction?.date)}</p>
                        </div>
                    </div>

                    {/* Client */}
                    <Controller
                        name="propertyId"
                        control={control}
                        rules={{
                            required: "Property is required.",
                        }}
                        render={({ field }) => (
                            <div
                                className={`select-group ${field.value ? "has-value" : ""}`}
                            >
                                <label className="select-label">Property Code</label>
                                <AsyncPaginate
                                    additional={{ page: 1 }}
                                    debounceTimeout={500}
                                    loadOptions={loadPropertyOptions}
                                    isClearable
                                    placeholder=""
                                    styles={selectStyles}
                                    value={field.value}
                                    onChange={(selectedOption) =>
                                        field.onChange(selectedOption)
                                    }
                                />
                                {errors.propertyId && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.propertyId.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    <Controller
                        name="client"
                        control={control}
                        rules={{
                            required: "Client is required.",
                        }}
                        render={({ field }) => (
                            <div
                                className={`select-group ${field.value ? "has-value" : ""
                                    }`}
                            >
                                <label className="select-label">
                                    Client Name
                                </label>

                                <Select
                                    options={clientOptions}
                                    isSearchable
                                    isClearable
                                    placeholder=""
                                    styles={selectStyles}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                                {errors.client && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.client.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    {/* Month */}
                    <Controller
                        name="month"
                        rules={{
                            required: "Month is required.",
                        }}
                        control={control}
                        render={({ field }) => (
                            <div
                                className={`select-group ${field.value ? "has-value" : ""
                                    }`}
                            >
                                <label className="select-label">
                                    Month
                                </label>

                                <Select
                                    isClearable
                                    options={monthOptions}
                                    styles={selectStyles}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                                {errors.month && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.month.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    {/* Payment Type */}
                    <Controller
                        name="paymentType"
                            rules={{
                            required: "PaymentType is required.",
                        }}
                        control={control}
                        render={({ field }) => (
                            <div
                                className={`select-group ${field.value ? "has-value" : ""
                                    }`}
                            >
                                <label className="select-label">
                                    Payment Type
                                </label>

                                <Select
                                    isClearable
                                    options={paymentTypeOptions}
                                    styles={selectStyles}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                                {errors.paymentType && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {errors.paymentType.message}
                                    </p>
                                )}
                            </div>
                        )}
                    />

                    {/* Dummy Client Details */}
                    <div className="rounded-xl border shadow-sm border-gray-400 p-4 bg-white space-y-2">
                        <h3 className="font-semibold text-slate-700">
                            Client Details
                        </h3>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Name</span>
                            <span>{selectedClient?.label || "-"}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Room / Bed</span>
                            <span>
                                {selectedClient
                                    ? `${selectedClient.roomNo}/${selectedClient.bedNo}`
                                    : "-"}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Current Due</span>
                            <span
                                className={`font-semibold ${Number(selectedClient?.currentDue) > 0
                                    ? "text-red-500"
                                    : "text-green-600"
                                    }`}
                            >
                                ₹{selectedClient?.currentDue ?? 0}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">Already Received</span>
                            <span className="font-semibold text-green-600">
                                ₹{selectedClient?.totalReceived ?? 0}
                            </span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full border rounded-lg py-2"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="w-full rounded-lg py-2 text-white bg-linear-to-r from-slate-800 via-slate-700 to-slate-900"
                        >
                            Apply Payment
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default MapBankTransactionDrawer;