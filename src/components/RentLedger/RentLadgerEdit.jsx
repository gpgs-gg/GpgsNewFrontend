import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { selectStyles } from '../../utils/selectStyles';
import Select from "react-select";
import DatePicker from 'react-datepicker';
import FilePreview from "../common/FilePreview";
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../common/Loader';
import { convertStringFormatDate, formatDate } from '../../utils/dateFormatter';
import { toast } from 'react-toastify';
import { useBedsData, useCreateClientData, usePropertiesDropdown, useSingleClientData, useUpdateClientData } from '../Clients/services';
import { useSingleClientRentData, useUpdateRentData } from './services';

const RentLadgerEdit = () => {
    const navigate = useNavigate()
    const { clientId } = useParams();
    const { data: singleClientRentData, isPending: isSingleClientRentData } = useSingleClientRentData(clientId)
    const { mutate: updateClientRentData, isPending: isUpdateClientRentData } = useUpdateRentData(clientId)

    const client = singleClientRentData?.data?.clientId ?? {};
    console.log(client?._id)
    const property = singleClientRentData?.data?.propertyId ?? {};
    const bed = singleClientRentData?.data?.bedId ?? {};
    const totalReceivedHistory = singleClientRentData?.data?.totalReceivedHistory ?? {};
    const [aadhaarFiles, setAadhaarFiles] = useState([]);
    const [companyFiles, setCompanyFiles] = useState([]);
    const [nocFiles, setNocFiles] = useState([]);
    const [agreementFiles, setAgreementFiles] = useState([]);
    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { isDirty, dirtyFields },
    } = useForm();




    const isBookingCancelledOptions = [
        {
            value: true,
            label: "Yes",
        },
        {
            value: false,
            label: "No",
        },
    ];

    useEffect(() => {
        const ClientData = singleClientRentData?.data;
        if (!ClientData) return;

        reset({
            currentDue: ClientData.currentDue,
            totalReceived: ClientData?.totalReceived,
            totalReceivable: ClientData?.totalReceivable,
            rentAmt: ClientData.rentAmt,
            ebAmt: ClientData.ebAmt,
            flatEB: ClientData.flatEB,
            adjEB: ClientData.adjEB,
            adjAmt: ClientData.adjAmt,

            parkingCharges: ClientData.parkingCharges,
            processingFees: ClientData.processingFees,

            depositAmount: ClientData.depositAmount,
            monthlyRent: ClientData.monthlyRent,
            daysCount: ClientData.daysCount,

            previousDue: ClientData.previousDue,
            month: `${ClientData?.monthName}/${ClientData?.year}`
        });

    }, [singleClientRentData, reset]);


    const onSubmit = (data) => {
        if (!isDirty) {
            toast.dismiss()
            toast.info("No changes detected.");
            return;
            // 👉 EDIT MODE
        }

        if (!dirtyFields.totalReceived) {
            data.totalReceived = 0;
        }

        if (clientId) {
            updateClientRentData(
                { id: clientId, data: data },
                {
                    onSuccess: (response) => {
                        toast.dismiss()
                        toast.success(response?.message || "Updated successfully");
                        navigate(`/rent-ledger/client/${client?._id}`);
                    },
                    onError: (error) => {
                        const errorMessage =
                            error?.response?.data?.message ||
                            error?.message ||
                            "Something went wrong";
                        toast.dismiss()
                        toast.error(errorMessage);
                    },
                }
            );
            return;
        }
        // 👉 CREATE MODE
        createClientData(data, {
            onSuccess: (response) => {
                toast.dismiss()
                toast.success(response?.message || "Created successfully");
                navigate("/client");
            },
            onError: (error) => {
                const errorMessage =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong";
                toast.dismiss()
                toast.error(errorMessage);
            },
        });
    };




    return (
        <div className="max-w-12xl mx-auto px-6">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm   px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div>
                            {/* <h1 className="text-2xl font-bold">
                                {clientId ? "Update Rent" : ""}
                            </h1>

                            <p className="text-sm text-gray-500">
                                {clientId
                                    ? "Update existing Rent details"
                                    : "Create and manage PG clents"}
                            </p> */}
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
                                disabled={isUpdateClientRentData}
                                className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                {isUpdateClientRentData ? (
                                    <div className='flex justify-center items-center gap-2'>
                                        <Loader />
                                        Processing...
                                    </div>
                                ) : (
                                    clientId ? "Update Rent" : ""
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">

                    <div className="flex items-center justify-between mb-2  ">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Update payment Details
                            </h1>

                            {!clientId && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage all PG Rent
                                </p>
                            )}
                        </div>
                    </div>

                    {clientId && client && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Client Name
                                  </p>
                                  <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {client.fullName}
                                  </p>
                                </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Contact No.
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {client.callingNo}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Date of Joining
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {formatDate(client.clientDoj)}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Property Code
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {property?.propertyCode ?? "-"}
                                </p>
                            </div>

                            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Room / Bed
                                </p>
                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {bed?.roomNo} / {bed?.bedNo}
                                </p>
                            </div>

                        </div>
                    )}
                </div>

                {/* Client Permanent Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-semibold mb-4">
                            Client Rent Details
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                        <div className="form-group">
                            <input
                                {...register("month")}
                                placeholder=" "
                                type="text"
                                disabled={true}
                                className="form-input cursor-not-allowed"
                            />
                            <label className="form-label required-label">Month</label>

                        </div>

                        <div className="form-group">
                            <input
                                {...register("currentDue")}
                                placeholder=" "
                                type="number"
                                disabled={true}
                                className="form-input cursor-not-allowed"
                            />
                            <label className="form-label required-label text-red-500!">Current Due</label>

                        </div>
                        <div className="form-group relative">
                            <input
                                {...register("totalReceived")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                                onFocus={() => setValue("totalReceived", "")}
                            />

                            <label className="form-label required-label text-green-500!">
                                Total Received
                            </label>

                            <div className="absolute right-3 top-3 group cursor-pointer z-50">
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-400 text-white text-xs">
                                    i
                                </span>

                                <div className="absolute right-0 top-5 hidden group-hover:block w-72 max-h-50 overflow-y-auto bg-white rounded-lg shadow-lg px-2">
                                    <h4 className="font-semibold text-sm sticky top-0 p-2 bg-white">
                                        Received History
                                    </h4>

                                    {totalReceivedHistory?.length ? (
                                        [...totalReceivedHistory]
                                            .reverse()
                                            .map((item) => (
                                                <div
                                                    key={item._id}
                                                    className="flex justify-between border-b border-gray-200 py-1 text-sm"
                                                >
                                                    <span>₹{item.amount}</span>
                                                    <span>{formatDate(item.date)}</span>
                                                </div>
                                            ))
                                    ) : (
                                        <p className="text-sm text-gray-500 p-2">No history found</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <input
                                {...register("totalReceivable")}
                                placeholder=" "
                                type="number"
                                disabled={true}
                                className="form-input cursor-not-allowed"
                            />
                            <label className="form-label required-label">Total Receivable</label>

                        </div>

                        <div className="form-group">
                            <input
                                {...register("rentAmt")}
                                placeholder=" "
                                type="number"
                                disabled={true}
                                className="form-input cursor-not-allowed"
                            />
                            <label className="form-label required-label">Rent Amount</label>

                        </div>
                        <div className="form-group">
                            <input
                                {...register("daysCount")}
                                placeholder=" "
                                type="number"
                                disabled={true}
                                className="form-input cursor-not-allowed"
                            />
                            <label className="form-label required-label">Days Count</label>

                        </div>
                        <div className="form-group">
                            <input
                                {...register("ebAmt")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label required-label">EB Amount </label>

                        </div>
                        <div className="form-group">
                            <input
                                {...register("adjEB")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label required-label">Adj. EB</label>
                        </div>



                        <div className="form-group">
                            <input
                                {...register("previousDue")}
                                placeholder=" "
                                type="number"
                                disabled={true}
                                className="form-input cursor-not-allowed"
                            />
                            <label className="form-label required-label">Previous Due</label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("parkingCharges")}
                                placeholder=" "
                                type="number"
                                className="form-input"
                            />
                            <label className="form-label required-label">Parking Charges</label>
                        </div>


                        <div className="form-group">
                            <input
                                {...register("depositAmount")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Deposit</label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("monthlyRent")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Monthly Rent</label>
                        </div>

                        <div className="form-group">
                            <input
                                {...register("processingFees")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Processing Fees</label>
                        </div>
                        <div className="form-group">
                            <input
                                {...register("adjAmt")}
                                placeholder=" "
                                type="text"
                                className="form-input"
                            />
                            <label className="form-label required-label">Adj. Amount</label>
                        </div>


                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm   px-4 py-2">
                    <div className="flex justify-between items-center">
                        <div>

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
                                disabled={isUpdateClientRentData}
                                className="theme-btn text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                            >
                                {isUpdateClientRentData ? (
                                    <div className='flex justify-center items-center gap-2'>
                                        <Loader />
                                        Processing...
                                    </div>
                                ) : (
                                    clientId ? "Update Rent" : ""
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default RentLadgerEdit


