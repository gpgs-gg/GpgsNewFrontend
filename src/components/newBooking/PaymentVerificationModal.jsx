import React, { useEffect } from "react";
import { useBankTransactionData } from "./services";
import useDebounce from "../hooks/useDebounce";

const PaymentVerificationModal = ({
    booking,
    onClose,
    register,
    handleSubmit,
    onSubmit,
    errors,
    watch,
    setValue,
}) => {
    const narration = watch("narration");
    const debouncedNarration = useDebounce(narration, 700);

    const { data: transactionData, isFetching } =
        useBankTransactionData(debouncedNarration);

    useEffect(() => {
        if (transactionData?.data?.deposit != null) {
            setValue("paymentAmount", transactionData.data.deposit);
        }
    }, [transactionData, setValue]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-5 text-xl font-bold">Verify Payment</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
                    {/* Naration */}
                    <div className="form-group">
                        <textarea
                            rows={3}
                            {...register("narration", {
                                required: "Bank Narration is required",
                            })}
                            placeholder=" "
                            className="form-input resize-none"
                        />
                        <label className="form-label">Bank Narration</label>
                        {errors?.narration && (
                            <p className="text-sm text-red-500">
                                {errors.narration.message}
                            </p>
                        )}
                    </div>          {/* Payment Amount */}
                    <div className="form-group">
                        <input
                            type="number"
                            {...register("paymentAmount", {
                                required: "Paid amount is required",
                            })}
                            //   disabled
                            placeholder=" "
                            className="form-input text-green-500"
                        />
                        <label className="form-label">Paid Amount</label>
                        {errors?.paymentAmount && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.paymentAmount.message}
                            </p>
                        )}
                    </div>

                    <div className="form-group mt-4">
                        <textarea
                            rows={3}
                            {...register("remarks")}
                            placeholder=" "
                            className="form-input resize-none"
                        />
                        <label className="form-label">Remarks (Optional)</label>
                    </div>


                    <div className="flex justify-end gap-3  pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border px-4 py-2"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="theme-btn px-4 py-2 text-white"
                        >
                            Verify Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentVerificationModal;