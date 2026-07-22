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
    { value: 1, label: "January 2026" },
    { value: 2, label: "February 2026" },
    { value: 3, label: "March 2026" },
    { value: 4, label: "April 2026" },
    { value: 5, label: "May 2026" },
    { value: 6, label: "June 2026" },
    { value: 7, label: "July 2026" },
    { value: 8, label: "August 2026" },
];

const paymentTypeOptions = [
    { value: "rent", label: "Rent" },
    { value: "deposit", label: "Deposit" },
    { value: "processing", label: "Processing Fees" },
    { value: "parking", label: "Parking Charges" },
];

const MapBankTransactionDrawer = ({ isOpen, onClose, transaction }) => {
    const {
        control,
        handleSubmit,
        watch,
    } = useForm({
        defaultValues: {
            propertyId: null,
            client: null,
            month: monthOptions[6],
            paymentType: paymentTypeOptions[0],
        },
    });

    const selectedProperty = watch("propertyId");

    const propertyId = selectedProperty?.value;

    const {
        data: clientData,
        isPending,
    } = useClientDataByProperty(propertyId);

    const { mutate: updateBankTransactionReceived } =
        useUpdateBankTransactionReceived();

    const clientOptions = clientData?.data?.map((item) => ({
        value: item._id,  // cleint id 
        label: item.fullName,
        propertyId: item.propertyId,
        bedId: item.bedId._id,
        roomNo: item.bedId.roomNo,
        bedNo: item.bedId.bedNo,
    }));


    const onSubmit = (data) => {
        const payload = {
            clientId: data.client.value,
            propertyId: data.client.propertyId,
            bedId: data.client.bedId,

            month: data.month.value,
            year: new Date().getFullYear(),

            paymentType: data.paymentType.value,

            amount: Number(transaction.deposit || 0),

            transactionDate: transaction.date,
            narration: transaction.narration,
        };

        console.log("payload", payload)

        updateBankTransactionReceived(payload, {
            onSuccess: (response) => {
                toast.dismiss()
                toast.success(
                    response?.message || "Bank transaction updated successfully."
                );

                // Optional
                // reset();
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
                            </div>
                        )}
                    />

                    <Controller
                        name="client"
                        control={control}
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
                            </div>
                        )}
                    />

                    {/* Month */}
                    <Controller
                        name="month"
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
                                    options={monthOptions}
                                    styles={selectStyles}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </div>
                        )}
                    />

                    {/* Payment Type */}
                    <Controller
                        name="paymentType"
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
                                    options={paymentTypeOptions}
                                    styles={selectStyles}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </div>
                        )}
                    />

                    {/* Dummy Client Details */}
                    <div className="rounded-xl border shadow-sm border-gray-400 p-4 bg-white space-y-2">
                        <h3 className="font-semibold text-slate-700">
                            Client Details
                        </h3>

                        <div className="flex justify-between">
                            <span className="text-gray-500">
                                Property
                            </span>
                            <span>RH-09</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">
                                Name
                            </span>
                            <span>Abhishek</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">
                                Bed
                            </span>
                            <span>A102</span>
                        </div>


                        <div className="flex justify-between">
                            <span className="text-gray-500">
                                Current Due
                            </span>
                            <span className="font-semibold text-red-500">
                                ₹27,667
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-gray-500">
                                Already Received
                            </span>
                            <span>₹24,000</span>
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