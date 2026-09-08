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
  PhoneCall,
  GraduationCap,
  BriefcaseBusiness,
  ShieldCheck,
  Paperclip,
  Eye,
} from "lucide-react";
import { useCurrentUser } from "../../auth/services";
import { useSingleClientData } from "./services";
import { formatDate } from "../../utils/dateFormatter";

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
        <p className="text-sm font-medium  text-gray-500">
          {label}
        </p>

        <div className="mt-1.5 flex min-w-0 items-center gap-2">
          {Icon && (
            <Icon
              className={`h-4 w-4 shrink-0 ${iconClass}`}
            />
          )}

          <p title={value || "-"} className="truncate text-sm font-semibold text-gray-800">
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
  const DocumentItem = ({
    icon: Icon,
    label,
    urls = [],
    iconClass = "text-gray-500",
  }) => {
    const documents = Array.isArray(urls) ? urls : [];

    return (<div className="min-w-0 rounded-lg border border-gray-200 bg-white p-3">

      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            className={`h-4 w-4 shrink-0 ${iconClass}`}
          />
        )}

        <p className="truncate text-sm font-medium text-gray-600">
          {label}
        </p>
      </div>

      {documents.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {documents.map((url, index) => (
            <a
              key={url || index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-blue-50 hover:text-blue-700"
              title={`View ${label} ${documents.length > 1 ? index + 1 : ""}`}
            >
              <Eye className="h-3.5 w-3.5" />
              {documents.length > 1 ? `View ${index + 1}` : "View"}
            </a>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs font-medium text-gray-400">
          Not Available
        </p>
      )}

    </div>


    );
  };


  // ============================================================
  // UI
  // ============================================================
  return (
    <div className="min-h-[80vh] bg-gray-50 p-3 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-12xl space-y-5">

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
              <p className="text-[10px] font-medium uppercase  text-gray-400">
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

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-8">

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
              value={formatDate(client.clientDoj)}
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

            {/* <DetailItem
              icon={CreditCard}
              label="Booking Amount"
              value={`₹${formatAmount(client.bookingAmount)}`}
              iconClass="text-green-600"
            /> */}

          </div>
        </div>
        {/* ================= CLIENT DOCUMENTS ================= */}

        <div className="border-t border-gray-200 bg-white rounded-2xl p-4 sm:p-5">

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Client Documents
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Uploaded client photos and identification documents
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-8">

            {/* Photo */}
            <DocumentItem
              icon={User}
              label="Client Photo"
              urls={client.photo}
              iconClass="text-blue-500"
            />

            {/* Aadhaar Card */}
            <DocumentItem
              icon={CreditCard}
              label="Aadhaar Card"
              urls={client.aadhaarCard}
              iconClass="text-orange-500"
            />

            {/* PAN */}
            <DocumentItem
              icon={CreditCard}
              label="PAN Card"
              urls={client.pan}
              iconClass="text-purple-500"
            />

            {/* College Identification */}
            <DocumentItem
              icon={GraduationCap}
              label="College Identification"
              urls={client.collegeIdentification}
              iconClass="text-indigo-500"
            />

            {/* Company Identification */}
            <DocumentItem
              icon={BriefcaseBusiness}
              label="Company Identification"
              urls={client.companyIdentification}
              iconClass="text-green-500"
            />

            {/* Rental Agreement */}
            <DocumentItem
              icon={FileText}
              label="Client Rental Agreement"
              urls={client.clientRentalAgreement}
              iconClass="text-red-500"
            />

            {/* Police NOC */}
            <DocumentItem
              icon={ShieldCheck}
              label="Client Police NOC"
              urls={client.clientPoliceNOC}
              iconClass="text-teal-500"
            />

            {/* Attachments */}
            <DocumentItem
              icon={Paperclip}
              label="Attachments"
              urls={client.attachments}
              iconClass="text-gray-500"
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

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-10">

            <DetailItem
              icon={Building2}
              label="Property Code"
              value={client.propertyId?.propertyCode}
              iconClass="text-green-600"
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
                client.monthlyRent
              )}`}
              iconClass="text-green-600"
            />
            <DetailItem
              icon={IndianRupee}
              label="Deposit Amount"
              value={`₹${formatAmount(
                client.depositAmount
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

            <DetailItem
              label="Property Address"
              value={
                client?.propertyId?.propertyAddress
              }
              iconClass="text-orange-500"
            />



          </div>
        </div>

        {/* =====================================================
            PROPERTY DETAILS
        ====================================================== */}


        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <SectionHeader
            icon={Building2}
            title="Electricity Details"
            subtitle="Current property electricity information"
            iconContainerClass="bg-green-100"
            iconClass="text-green-600"
          />

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-8">

            <DetailItem

              label="Consumer No"
              value={client.propertyId?.utility?.ebConsumerNo}
              iconClass="text-green-600"
            />
            <DetailItem
              icon={BedDouble} label="Billing Unit"
              value={client.propertyId?.utility?.ebBillingUnit}
              iconClass="text-blue-500"
            />

            <DetailItem
              label="Power Company Web Link"
              value={<a
                href="https://wss.mahadiscom.in/wss/wss?uiActionName=getViewPayBill"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 hover:underline"
              >
                https://wss.mahadiscom.in/wss/wss?uiActionName=getViewPayBill </a>
              }
              iconClass="text-blue-500"
            />


          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <SectionHeader
            icon={PhoneCall}
            title="Emergency / Customer Care Contacts"
            subtitle="The following issues are considered emergencies"
            iconContainerClass="bg-red-100"
            iconClass="text-red-600"
          />

          <div className="p-4 sm:p-5">


            {/* Emergency Contacts */}
            <div className="mb-5 rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-800">
                Call / Chat <span className="text-red-600">(Emergency → Call)</span>
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:8928191814"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <PhoneCall size={16} />
                  8928191814
                </a>

                <a
                  href="tel:9326325181"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm ring-1 ring-gray-200 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <PhoneCall size={16} />
                  9326325181
                </a>
              </div>
            </div>

            {/* Emergency Issues */}
            <div className="space-y-3">

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800">
                  1. Electrical Short Circuit
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800">
                  2. No Electricity
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  If the nearby houses or buildings are also affected, then the issue
                  is external and beyond our control. The power will be restored after
                  the power company fixes the issue.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800">
                  3. No Water Supply
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Please ensure that all taps are closed and there are no flush
                  leakages. If the issue persists, report it to us immediately.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-800">
                  4. Medical Emergency Concerns
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default PropAndPersDetails;