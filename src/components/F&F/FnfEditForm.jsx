import React, { useEffect } from "react";
import Select from "react-select";
import { useForm, Controller } from "react-hook-form";
import {
    X,
    Wallet,
    IndianRupee,
    CheckCircle,
} from "lucide-react";
import { selectStyles } from "../../utils/selectStyles";
import { useUpdateClientData } from "../Clients/services";
import { toast } from "react-toastify";

// ============================================================
// STATUS OPTIONS
// ============================================================

const fnfStatusOptions = [
    {
        value: "Handover Done",
        label: "Handover Done",
    },
    {
        value: "F & F Details Sent",
        label: "F & F Details Sent",
    },
    {
        value: "Bank Details Received",
        label: "Bank Details Received",
    },
    // {
    //     value: "F&FPaid",
    //     label: "F & F Paid",
    // },
    {
        value: "F & F Closed",
        label: "F & F Closed",
    },
];

// ============================================================
// SELECT STYLES
// ============================================================



// ============================================================
// COMPONENT
// ============================================================

function FnfEditForm({
    client,
    onClose,
}) {
    // ============================================================
    // REACT HOOK FORM
    // ============================================================
    const { mutate: updateClientData, isPending: isUpdateClientData } = useUpdateClientData()

    const {
        register,
        control,
        handleSubmit,
        watch,
        reset,
    } = useForm({
        defaultValues: {
            currentDue: 0,
            totalPaidDeposit: 0,
            adjustmentAmount: 0,
            adjustmentEB: 0,
            fnfAmount: 0,
            bankDetailReceived: "",
            remarks: "",
            status: "",
        },
    });

    // ============================================================
    // WATCH VALUES
    // ============================================================

    const currentDue = Number(
        watch("currentDue") || 0
    );

    const totalPaidDeposit = Number(
        watch("totalPaidDeposit") || 0
    );

    const adjustmentAmount = Number(
        watch("adjustmentAmount") || 0
    );

    const adjustmentEB = Number(
        watch("adjustmentEB") || 0
    );

    // ============================================================
    // FNF AMOUNT
    // ============================================================

    const fnfAmount =
        totalPaidDeposit - currentDue;

    // ============================================================
    // LOAD CLIENT DATA
    // ============================================================

    useEffect(() => {
        if (!client) return;

        const due = Number(
            client?.latestRentHistory?.currentDue || 0
        );

        const deposit = Number(
            client?.totalPaidDeposit || 0
        );

        reset({
            currentDue: due,
            totalPaidDeposit: deposit,
            bankDetailReceived:client?.fnf?.bankDetailReceived,
            remarks: client?.fnf?.remarks,
            status: client?.fnf?.status,
        });
    }, [client, reset]);

    // ============================================================
    // SUBMIT
    // ============================================================

   const submitForm = (formData) => {
    const data = {
        fnf: {
            currentDue: Number(formData.currentDue || 0),

            totalPaidDeposit: Number(
                formData.totalPaidDeposit || 0
            ),

            adjustmentAmount: Number(
                formData.adjustmentAmount || 0
            ),

            adjustmentEB: Number(
                formData.adjustmentEB || 0
            ),

            fnfAmount: Number(fnfAmount || 0),

            bankDetailReceived:
                formData.bankDetailReceived || "",

            remarks:
                formData.remarks || "",

            status:
                formData.status || "",
        },
    };

    updateClientData(
        {
            clientId: client?._id,
            data: data,
        },  
        {
            onSuccess: (response) => {
                toast.dismiss()
                toast.success( "F&F Updated Successfully")
                onClose();
            },

            onError: (error) => {
                toast.dismiss()
                toast.error(response || "F&F Update Error")
            },
        }
    );
};

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-xl bg-white shadow-2xl">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 py-4">

                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            F&F Settlement
                        </h2>

                        <p className="text-sm text-gray-500">
                            Full & Final Settlement
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* ==================================================
                    BODY
                ================================================== */}

                <form
                    onSubmit={handleSubmit(submitForm)}
                    className="p-6 space-y-6"
                >


                    {/* ==================================================
                        FNF CALCULATION
                    ================================================== */}

                    <div className="rounded-xl border border-gray-300  p-5">

                        <h3 className="mb-5 flex items-center gap-2 font-semibold text-gray-800">
                            <Wallet size={18} />
                            F&F Details
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            {/* CURRENT DUE */}
                            <div className="form-group">

                                <input
                                    {...register(
                                        "currentDue"
                                    )}
                                    disabled
                                    placeholder=" "
                                    type="number"
                                    className="form-input cursor-not-allowed"
                                />
                                <label className="form-label">Current Due</label>
                            </div>

                            {/* TOTAL PAID DEPOSIT */}






                            <div className="form-group">

                                <input
                                    {...register(
                                        "totalPaidDeposit"
                                    )}
                                    disabled
                                    placeholder=" "
                                    type="number"
                                    className="form-input cursor-not-allowed"
                                />
                                <label className="form-label"> Total Deposit
                                </label>
                            </div>


                            {/* FNF AMOUNT */}




                            <div className="form-group">
                                <input
                                    type="number"
                                    value={fnfAmount}
                                    readOnly
                                    disabled
                                    className={`form-input cursor-not-allowed font-bold ${fnfAmount > 0
                                        ? "text-red-600"
                                        : fnfAmount < 0
                                            ? "text-red-600"
                                            : "text-green-600"
                                        }`}
                                />

                                <label className="form-label">
                                    F&F Amount
                                </label>
                            </div>



                            {/* ADJUSTMENT AMOUNT */}

                            {/* <div className="form-group">

                                <input
                                    {...register(
                                        "adjustmentAmount"
                                    )}
                                    placeholder=" "
                                    type="number"
                                    className="form-input"
                                />
                                <label className="form-label">   Adjustment Amount</label>
                            </div> */}
                            {/* ADJUSTMENT EB */}



                            {/* 
                            <div className="form-group">

                                <input
                                    {...register(
                                        "adjustmentEB"
                                    )}
                                    placeholder=" "
                                    type="number"
                                    className="form-input"
                                />
                                <label className="form-label">Adjustment EB</label>
                            </div> */}
                            {/* BANK DETAILS */}

                            <div className="form-group">
                                <input
                                    {...register(
                                        "bankDetailReceived"
                                    )}
                                    placeholder=" "
                                    type="text"
                                    className="form-input"
                                />
                                <label className="form-label">   Bank / UPI Details</label>
                            </div>

                            <Controller
                                name="status"
                                control={control}
                                defaultValue={null}
                                render={({ field }) => (
                                    <div className={`select-group ${field.value ? "has-value" : ""}`}>
                                        <label className="select-label">Status</label>
                                        <Select
                                            {...field}
                                            options={fnfStatusOptions}
                                            isClearable
                                            placeholder=""
                                            value={fnfStatusOptions.find(option => option.value === field.value)}
                                            onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                                            styles={selectStyles}
                                        />
                                    </div>
                                )}
                            />

                        </div>



                    </div>

                    {/* ==================================================
                        REMARKS + STATUS
                    ================================================== */}

                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>

                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                F&F Details / Remarks
                            </label>

                            <textarea
                                {...register("remarks")}
                                rows={5}
                                placeholder="Enter F&F details..."
                                className="w-full h-15 rounded-lg border px-4 py-3 outline-none focus:border-gray-500 "
                            />

                        </div>
                    </div> */}


                    {/* ==================================================
                        BUTTONS
                    ================================================== */}

                    <div className="flex justify-end gap-3 border-t pt-4">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="theme-btn flex justify-center items-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Save F&F
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default FnfEditForm;