import React from "react";
import {
  User,
  Phone,
  Mail,
  Building2,
  BedDouble,
  MapPin,
  CalendarDays,
  IndianRupee,
  FileText,
  Car,
  CreditCard,
  Home,
  Loader2,
} from "lucide-react";
import { useCurrentUser } from "../../auth/services";
import { useSingleClientData } from "./services";

// Apne actual paths ke according imports change karna


const PropAndPersDetails = () => {
  // ============================================================
  // CURRENT LOGGED-IN USER
  // ============================================================
  const {
    data: currentUser,
    isLoading: currentUserLoading,
  } = useCurrentUser();

  // Login user se client ID
  const clientId = currentUser?.user?.clientId;

  // ============================================================
  // SINGLE CLIENT DATA
  // ============================================================
  const {
    data: clientResponse,
    isLoading: clientLoading,
    isError,
    error,
  } = useSingleClientData(clientId);

  // ============================================================
  // CLIENT DATA
  // ============================================================
  const client = clientResponse?.data;
  // ============================================================
  // LOADING
  // ============================================================
  if (currentUserLoading || clientLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading client details...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================
  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm font-semibold text-red-700">
            Failed to load client details.
          </p>

          {error?.message && (
            <p className="mt-1 text-xs text-red-600">
              {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // NO CLIENT ID
  // ============================================================
  if (!clientId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <p className="text-sm font-semibold text-yellow-700">
            Client ID not found.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // NO CLIENT DATA
  // ============================================================
  if (!client) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <User className="mx-auto h-10 w-10 text-gray-400" />

          <p className="mt-3 text-sm font-semibold text-gray-700">
            Client details not found
          </p>

          <p className="mt-1 text-xs text-gray-500">
            No client data is available for this account.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    iconClass = "text-gray-500",
  }) => {
    return (
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
          {label}
        </p>

        <div className="mt-1.5 flex min-w-0 items-center gap-2">
          {Icon && (
            <Icon
              className={`h-4 w-4 shrink-0 ${iconClass}`}
            />
          )}

          <p className="truncate text-sm font-semibold text-gray-800">
            {value || "-"}
          </p>
        </div>
      </div>
    );
  };

  const SectionHeader = ({
    icon: Icon,
    title,
    subtitle,
    iconContainerClass = "bg-blue-100",
    iconClass = "text-blue-600",
  }) => {
    return (
      <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-5">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconContainerClass}`}
        >
          <Icon className={`h-5 w-5 ${iconClass}`} />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-800 sm:text-base">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-[80vh] bg-gray-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-gray-800 sm:text-xl">
                  My Profile
                </h1>

                <p className="text-xs text-gray-500 sm:text-sm">
                  View your personal and property details
                </p>
              </div>
            </div>

            {/* Client ID */}
            {/* <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Client ID
              </p>

              <p className="mt-0.5 text-xs font-semibold text-gray-700">
                {client._id}
              </p>
            </div> */}
          </div>
        </div>

        {/* =====================================================
            CLIENT PERSONAL DETAILS
        ====================================================== */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <SectionHeader
            icon={User}
            title="Client Personal Details"
            subtitle="Personal information of the client"
            iconContainerClass="bg-blue-100"
            iconClass="text-blue-600"
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">

            <DetailItem
              icon={User}
              label="Full Name"
              value={client.fullName}
              iconClass="text-blue-500"
            />

            <DetailItem
              icon={Phone}
              label="WhatsApp Number"
              value={client.whatsappNo}
              iconClass="text-green-500"
            />

            <DetailItem
              icon={Phone}
              label="Calling Number"
              value={client.callingNo}
              iconClass="text-green-500"
            />

            <DetailItem
              icon={Mail}
              label="Email"
              value={client.emailId}
              iconClass="text-purple-500"
            />

            <DetailItem
              icon={CalendarDays}
              label="Date of Joining"
              value={client.clientDoj}
              iconClass="text-orange-500"
            />

            <DetailItem
              icon={Home}
              label="Stay Type"
              value={client.stayType}
              iconClass="text-indigo-500"
            />

            <DetailItem
              icon={Car}
              label="Parking Charges"
              value={`₹${formatAmount(client.parkingCharges)}`}
              iconClass="text-gray-500"
            />

            <DetailItem
              icon={CreditCard}
              label="Booking Amount"
              value={`₹${formatAmount(client.bookingAmount)}`}
              iconClass="text-green-600"
            />

          </div>
        </div>

        {/* =====================================================
            PROPERTY DETAILS
        ====================================================== */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <SectionHeader
            icon={Building2}
            title="Property Details"
            subtitle="Current property information"
            iconContainerClass="bg-green-100"
            iconClass="text-green-600"
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">

            <DetailItem
              icon={Building2}
              label="Property Code"
              value={client.propertyId?.propertyCode}
              iconClass="text-green-600"
            />

            <DetailItem
              icon={MapPin}
              label="Property Location"
              value={client.propertyId?.propertyLocation}
              iconClass="text-red-500"
            />

            <DetailItem
              icon={BedDouble}
              label="Room No"
              value={client.bedId?.roomNo}
              iconClass="text-blue-500"
            />

            <DetailItem
              icon={BedDouble}
              label="Bed No"
              value={client.bedId?.bedNo}
              iconClass="text-blue-500"
            />

            <DetailItem
              icon={Home}
              label="Room Type"
              value={client.bedId?.acRoom}
              iconClass="text-cyan-500"
            />

            <DetailItem
              icon={IndianRupee}
              label="Monthly Rent"
              value={`₹${formatAmount(
                client.bedId?.monthlyRent || client.monthlyRent
              )}`}
              iconClass="text-green-600"
            />

            <DetailItem
              label="Wifi Name"
              value={
                client?.propertyId?.internet?.wifiName
           }
              iconClass="text-orange-500"
            />

            <DetailItem
              label="Wifi Password"
              value={
                client.propertyId?.internet?.wifiPwd
             }
              iconClass="text-orange-500"
            />


          </div>
        </div>

        {/* =====================================================
            PAYMENT DETAILS
        ====================================================== */}
   
        {/* =====================================================
            NOTICE DETAILS
        ====================================================== */}
        {(client.noticeStartDate ||
          client.noticeLastDate ||
          client.clientVacatingDate) && (
          <div className="overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm">

            <SectionHeader
              icon={FileText}
              title="Notice Details"
              subtitle="Notice and vacating information"
              iconContainerClass="bg-orange-100"
              iconClass="text-orange-600"
            />

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">

              <DetailItem
                icon={CalendarDays}
                label="Notice Start Date"
                value={client.noticeStartDate}
                iconClass="text-orange-500"
              />

              <DetailItem
                icon={CalendarDays}
                label="Notice Last Date"
                value={client.noticeLastDate}
                iconClass="text-red-500"
              />

              <DetailItem
                icon={CalendarDays}
                label="Vacating Date"
                value={client.clientVacatingDate}
                iconClass="text-red-600"
              />

            </div>
          </div>
        )}

        {/* =====================================================
            PERMANENT BOOKING
        ====================================================== */}
        {client.permanentBooking && (
          <div className="overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-sm">

            <SectionHeader
              icon={Building2}
              title="Permanent Booking Details"
              subtitle="Permanent booking/property information"
              iconContainerClass="bg-indigo-100"
              iconClass="text-indigo-600"
            />

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">

              <DetailItem
                icon={Building2}
                label="Property Code"
                value={client.permanentBooking.propertyCode}
                iconClass="text-indigo-600"
              />

              <DetailItem
                icon={MapPin}
                label="Property Location"
                value={client.permanentBooking.propertyLocation}
                iconClass="text-red-500"
              />

              <DetailItem
                icon={BedDouble}
                label="Room No"
                value={client.permanentBooking.roomNo}
                iconClass="text-blue-500"
              />

              <DetailItem
                icon={BedDouble}
                label="Bed No"
                value={client.permanentBooking.bedNo}
                iconClass="text-blue-500"
              />

              <DetailItem
                icon={IndianRupee}
                label="Monthly Rent"
                value={`₹${formatAmount(
                  client.permanentBooking.monthlyRent
                )}`}
                iconClass="text-green-600"
              />

              <DetailItem
                icon={IndianRupee}
                label="Deposit Amount"
                value={`₹${formatAmount(
                  client.permanentBooking.depositAmount
                )}`}
                iconClass="text-orange-500"
              />

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PropAndPersDetails;