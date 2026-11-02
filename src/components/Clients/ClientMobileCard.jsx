import {
  Phone,
  MapPin,
  BedDouble,
  CalendarDays,
  Wallet,
  FileText,
  Eye,
  Pencil,
  History,
  Plane,
  Receipt,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/dateFormatter";

const ClientMobileCard = ({
  item,
  user,
  canEditClient,
  canViewClient,
  generatingRentClientId,
  enablingClientId,
  handleGenerateMonthlyRent,
  handleEnableClientLogin,
  setSelectedClient,
  setShowBedShiftModal,
  setShowClientVacationModal,
  setShowBedHistoryModal,
  setEditingVacation,
}) => {
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const currentDue = Number(item?.latestRentHistory?.currentDue || 0);

  const statusFullForm = {
    RFH: "Ready for Handover",
    "F&F C": "F&F Closed",
    BDR: "Bank Details Revised",
    "F&F DS": "F&F Details Sent",
    HD: "Handover Done",
  };

  const getClientStatus = () => {
    if (item?.fnf?.status?.trim()) {
      return {
        text: item.fnf.status,
        className: "bg-slate-100 text-slate-700 border-slate-200",
      };
    }

    if (item?.isBookingCancelled) {
      return {
        text: "Cancelled",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (
      item?.clientVacatingDate &&
      new Date(item.clientVacatingDate) <= new Date()
    ) {
      return {
        text: "RFH",
        className: "bg-orange-50 text-orange-700 border-orange-200",
      };
    }

    if (item?.noticeStartDate) {
      return {
        text: "Notice",
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }

    return {
      text: "Active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  };

  const status = getClientStatus();

  const documents = [
    { label: "Photo", docs: item?.photo },
    { label: "Aadhaar", docs: item?.aadhaarCard },
    { label: "PAN", docs: item?.pan },
    { label: "College ID", docs: item?.collegeIdentification },
    { label: "Company ID", docs: item?.companyIdentification },
    { label: "Rental Agreement", docs: item?.clientRentalAgreement },
    { label: "Police NOC", docs: item?.clientPoliceNOC },
    { label: "Attachments", docs: item?.attachments },
  ].filter(({ docs }) => Array.isArray(docs) && docs.length > 0);

  const handleAction = (callback) => {
    setSelectedClient(item);
    callback(true);
  };

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  const detail = (label, value) => (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="border-b border-slate-100 bg-slate-50/70 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Client
            </p>
            <h3 className="mt-0.5 break-words text-base font-bold text-slate-900">
              {item?.fullName || "-"}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">
                {item?.propertyId?.propertyCode || "No Property"}
              </span>
              <span>•</span>
              <span>
                {item?.bookingType === "Daily"
                  ? "Daily"
                  : item?.stayType || "-"}
              </span>
            </div>
          </div>

          <span
            title={statusFullForm[status.text] || status.text}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
          >
            {status.text}
          </span>
        </div>

        {/* CONTACT */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item?.callingNo && (
            <a
              href={`tel:${item.callingNo}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
            >
              <Phone size={14} />
              {item.callingNo}
            </a>
          )}

          {item?.whatsappNo && item.whatsappNo !== item.callingNo && (
            <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              WhatsApp: {item.whatsappNo}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3 p-3">
        {/* PROPERTY DETAILS */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <MapPin size={15} className="text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Property Details
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-slate-50 p-3">
            {detail("Property", item?.propertyId?.propertyCode)}
            {detail("Location", item?.propertyId?.propertyLocation)}
            {detail("Room No.", item?.bedId?.roomNo)}
            {detail("Bed No.", item?.bedId?.bedNo)}
          </div>
        </section>

        {/* PERMANENT BOOKING */}
        {item?.stayType === "T. Booked" && item?.permanentBooking && (
          <section className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
            <p className="mb-2 text-xs font-bold text-indigo-700">
              Permanent Booking Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              {detail("Property", item.permanentBooking?.propertyCode)}
              {detail("Room", item.permanentBooking?.roomNo)}
              {detail("Bed", item.permanentBooking?.bedNo)}
              {detail(
                "Monthly Rent",
                formatAmount(item.permanentBooking?.monthlyRent),
              )}
            </div>
          </section>
        )}

        {/* FINANCIAL DETAILS */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <Wallet size={15} className="text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Financial Details
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-100 p-3">
              {detail("Monthly Rent", formatAmount(item?.bedId?.monthlyRent))}
            </div>

            <div className="rounded-lg border border-slate-100 p-3">
              {detail("Deposit", formatAmount(item?.bedId?.depositAmount))}
            </div>

            <div className="rounded-lg border border-slate-100 p-3">
              {detail("Parking Charges", formatAmount(item?.parkingCharges))}
            </div>

            <div className="rounded-lg border border-slate-100 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Current Due
              </p>
              <p
                className={`mt-0.5 text-sm font-bold ${
                  currentDue < 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatAmount(currentDue)}
              </p>
            </div>
          </div>
        </section>

        {/* IMPORTANT DATES */}
        <section>
          <div className="mb-2 flex items-center gap-2">
            <CalendarDays size={15} className="text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Important Dates
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg bg-slate-50 p-3">
            {detail(
              "Rent DOJ",
              item?.clientDoj ? formatDate(item.clientDoj) : "-",
            )}
            {detail("EB DOJ", item?.ebDoj ? formatDate(item.ebDoj) : "-")}
            {detail(
              "Notice Start",
              item?.noticeStartDate ? formatDate(item.noticeStartDate) : "-",
            )}
            {detail(
              "Notice Last",
              item?.noticeLastDate ? formatDate(item.noticeLastDate) : "-",
            )}
            {detail(
              "Vacating Date",
              item?.clientVacatingDate
                ? formatDate(item.clientVacatingDate)
                : "-",
            )}
          </div>
        </section>

        {/* LOGIN STATUS */}
        <div className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
          <span className="text-sm font-medium text-slate-600">
            Client Login
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              item?.loginEnabled
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {item?.loginEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>

        {/* DOCUMENTS */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-slate-500" />
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Documents
              </h4>
            </div>
            <span className="text-xs text-slate-400">
              {documents.reduce((total, doc) => total + doc.docs.length, 0)}{" "}
              files
            </span>
          </div>

          {documents.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {documents.map(({ label, docs }) =>
                docs.map((url, index) => {
                  const isPdf = /\.pdf(?:$|[?#])/i.test(url);

                  return (
                    <a
                      key={`${label}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Preview ${label}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                    >
                      <FileText
                        size={14}
                        className={isPdf ? "text-red-500" : "text-blue-500"}
                      />
                      {label}
                      {docs.length > 1 ? ` ${index + 1}` : ""}
                    </a>
                  );
                }),
              )}
            </div>
          ) : (
            <p className="rounded-lg bg-slate-50 px-3 py-3 text-center text-xs text-slate-400">
              No documents available
            </p>
          )}
        </section>

        {/* VACATIONS */}
        <section className="rounded-lg border border-slate-100 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              Vacation Records
            </span>
            <span className="text-xs text-slate-400">
              {item?.vacations?.length || 0} records
            </span>
          </div>

          {item?.vacations?.length > 0 ? (
            <div className="space-y-2">
              {item.vacations
                .filter(
                  (vacation) =>
                    vacation.vacationStartDate1 ||
                    vacation.vacationLastDate1 ||
                    vacation.vacationStartDate2 ||
                    vacation.vacationLastDate2,
                )
                .map((vacation, index) => (
                  <div
                    key={vacation._id || index}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700">
                        {new Date(
                          vacation.year,
                          vacation.month - 1,
                        ).toLocaleString("en-IN", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {vacation.vacationStartDate1
                          ? formatDate(vacation.vacationStartDate1)
                          : "-"}
                        {" → "}
                        {vacation.vacationLastDate1
                          ? formatDate(vacation.vacationLastDate1)
                          : "-"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient(item);
                        setEditingVacation(vacation);
                        setShowClientVacationModal(true);
                      }}
                      className="shrink-0 rounded-md border border-slate-200 bg-white p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                      title="Edit vacation"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No vacation records found</p>
          )}
        </section>

        {/* ACTIONS */}
        <section className="border-t border-slate-100 pt-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Actions
          </p>

          <div className="grid grid-cols-2 gap-2">
            {canViewClient && (
              <Link
                to={`/rent-ledger/client/${item?._id}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Receipt size={15} />
                Rent
              </Link>
            )}

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleGenerateMonthlyRent(item?._id)}
                disabled={generatingRentClientId === item?._id}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw size={15} />
                {generatingRentClientId === item?._id
                  ? "Generating..."
                  : "Generate Rent"}
              </button>
            )}

            {isAdmin && !item?.loginEnabled && (
              <button
                type="button"
                onClick={() => handleEnableClientLogin(item)}
                disabled={enablingClientId === item?._id}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
              >
                <LogIn size={15} />
                {enablingClientId === item?._id
                  ? "Please wait..."
                  : "Enable Login"}
              </button>
            )}

            {canEditClient &&
              item?.bookingType !== "Daily" &&
              !item?.noticeStartDate && (
                <button
                  type="button"
                  onClick={() => handleAction(setShowBedShiftModal)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <BedDouble size={15} />
                  Bed Shift
                </button>
              )}

            <button
              type="button"
              onClick={() => handleAction(setShowClientVacationModal)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plane size={15} />
              Vacation
            </button>

            <button
              type="button"
              onClick={() => handleAction(setShowBedHistoryModal)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <History size={15} />
              Bed History
            </button>

            <Link
              to={`/clients/view/${item?._id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Eye size={15} />
              View
            </Link>

            {canEditClient && (
              <Link
                to={`/clients/edit/${item?._id}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={15} />
                Edit
              </Link>
            )}
          </div>
        </section>
      </div>
    </article>
  );
};

export default ClientMobileCard;