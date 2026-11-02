import {
  User,
  Building2,
  BedDouble,
  MapPin,
  CalendarDays,
  Phone,
  MessageCircle,
  IndianRupee,
  CreditCard,
  Copy,
  Wallet,
  Clock,
  FileCheck,
} from "lucide-react";

import { formatDate } from "../../utils/dateFormatter";
import { toast } from "react-toastify";
import { FaWhatsapp } from "react-icons/fa";
const FnfMobileCard = ({ item, canEditFnf, onEdit }) => {
  const rentHistory = item.latestRentHistory || {};
  const fnfHistory = item.fnf || {};

  const getClientStatus = () => {
    const today = new Date();

    if (item.isBookingCancelled) {
      return {
        text: "Cancelled",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (item.clientVacatingDate) {
      const vacatedDate = new Date(item.clientVacatingDate);

      if (vacatedDate <= today) {
        return {
          text: "RFH",
          className: "bg-slate-100 text-slate-700 border-slate-300",
        };
      }
    }

    if (item.noticeStartDate) {
      return {
        text: "Notice",
        className: "bg-orange-50 text-orange-700 border-orange-200",
      };
    }

    return {
      text: "Active",
      className: "bg-green-50 text-green-700 border-green-200",
    };
  };

  const statusFullForm = {
    RFH: "Ready for Handover",
    "F&F C": "F&F Closed",
    BDR: "Bank Details Revised",
    "F&F DS": "F&F Details Sent",
    HD: "Handover Done",
  };

  const clientStatus = getClientStatus();
  const fnfStatus = item?.fnf?.status;
  const status = fnfStatus?.trim() ? fnfStatus : clientStatus.text;

  const statusClass = fnfStatus?.trim()
    ? "bg-blue-50 text-blue-700 border-blue-200"
    : clientStatus.className;

  const amount = Number(fnfHistory.fnfAmount) || 0;

  const copyBankDetails = () => {
    if (!fnfHistory.bankDetailReceived) return;

    navigator.clipboard
      .writeText(fnfHistory.bankDetailReceived)
      .then(() => {
        toast.dismiss();
        toast.success("Copied!");
      })
      .catch(() => {
        toast.error("Unable to copy bank details");
      });
  };

  const Detail = ({ label, value, icon: Icon }) => (
    <div className="min-w-0 rounded-lg bg-slate-50 p-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
        {Icon && <Icon size={13} className="shrink-0 text-slate-400" />}
        <span className="truncate">{value || "-"}</span>
      </p>
    </div>
  );
  const sendFnfWhatsAppMessage = () => {
    const formatAmount = (amount) =>
      Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const clientName = client?.fullName || "";
    const propertyCode = client?.propertyCode || "";
    const whatsappNo = client?.whatsappNo || "";

    const currentDue = Number(client?.latestRentHistory?.currentDue || 0);
    const securityDeposit = Number(client?.fnf?.totalPaidDeposit || 0);

    const settlementAmount = securityDeposit - currentDue;

    const message = `
*Full & Final Settlement Details*

Client Name : *${clientName}*
Property Code : *${propertyCode}*

📌 Current Due Amount : *₹${formatAmount(currentDue)}*

📌 Security Deposit : *₹${formatAmount(securityDeposit)}*

📌 F&F Settlement ${
      settlementAmount >= 0 ? "Refundable" : "Payable"
    } Amount: *₹${formatAmount(Math.abs(settlementAmount))}*

_${
      settlementAmount >= 0
        ? "(GPGS will pay you this amount)."
        : "(You have to pay this amount to GPGS)."
    }_

For detailed settlement calculations and other details, please visit:

🌐 https://gpgs24.in

Please check all the details carefully. If you have any concerns or queries regarding the settlement, kindly let us know.

*Gopal's Paying Guest Services*

Customer Care / Emergency No. 1 : 8928191814
Customer Care / Emergency No. 2 : 9326325181

(Service Hours : 10 AM to 7 PM)
`.trim();

    const phone = whatsappNo.replace(/\D/g, "");

    window.open(
      `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="border-b border-slate-100 bg-slate-50/70 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <User size={19} />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-800">
                {item.fullName || "-"}
              </h3>

              <p className="mt-0.5 text-xs text-slate-500">
                {item.propertyCode || "No Property Code"}
              </p>
            </div>
          </div>

          <span
            title={statusFullForm[status] || status}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass}`}
          >
            {status}
          </span>
        </div>

        {/* CONTACT DETAILS */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={
              item.whatsappNo
                ? `https://wa.me/${String(item.whatsappNo).replace(/\D/g, "")}`
                : undefined
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"
          >
            <MessageCircle size={14} className="shrink-0 text-green-600" />
            <span className="truncate">{item.whatsappNo || "-"}</span>
          </a>

          <a
            href={item.callingNo ? `tel:${item.callingNo}` : undefined}
            className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700"
          >
            <Phone size={14} className="shrink-0 text-blue-600" />
            <span className="truncate">{item.callingNo || "-"}</span>
          </a>
        </div>
      </div>

      <div className="space-y-3 p-3">
        {/* PROPERTY DETAILS */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Building2 size={15} className="text-blue-600" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Property Details
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Detail label="Property Code" value={item.propertyCode} />

            {/* <Detail
              label="Location"
              value={item.propertyLocation}
              icon={MapPin}
            /> */}

            <Detail label="Room No." value={item.roomNo} icon={Building2} />

            <Detail label="Bed No." value={item.bedNo} icon={BedDouble} />

            {/* <Detail
              label="Stay Type"
              value={item.bookingType === "Daily" ? "Daily" : item.stayType}
            /> */}

            {/* <Detail label="Booking Type" value={item.bookingType} /> */}
          </div>
        </div>

        {/* IMPORTANT DATES */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CalendarDays size={15} className="text-orange-600" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Important Dates
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Detail
              label="NSD"
              value={
                item.noticeStartDate ? formatDate(item.noticeStartDate) : "-"
              }
              icon={CalendarDays}
            />

            <Detail
              label="NLD"
              value={
                item.noticeLastDate ? formatDate(item.noticeLastDate) : "-"
              }
              icon={CalendarDays}
            />

            <div className="col-span-2">
              <Detail
                label="CVD"
                value={
                  item.clientVacatingDate
                    ? formatDate(item.clientVacatingDate)
                    : "-"
                }
                icon={CalendarDays}
              />
            </div>
          </div>
        </div>

        {/* FINANCIAL SUMMARY */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
            <Wallet size={15} className="text-green-600" />
            <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
              Financial Summary
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3">
            <div>
              <p className="text-[10px] text-slate-500">Total Deposit</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                ₹
                {Number(fnfHistory.totalPaidDeposit || 0).toLocaleString(
                  "en-IN",
                )}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-slate-500">Current Due</p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                ₹{Number(fnfHistory.currentDue || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="col-span-2 rounded-lg bg-slate-50 p-3">
              <p className="text-[10px] font-semibold uppercase text-slate-500">
                F&F Amount
              </p>

              <p
                className={`mt-1 text-lg font-bold ${
                  amount < 0 ? "text-red-600" : "text-green-700"
                }`}
              >
                ₹{amount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* BANK DETAILS */}
        <div className="rounded-xl border border-slate-200 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CreditCard size={15} className="text-blue-600" />
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                Bank Details
              </h4>{" "}
            </div>
            {fnfHistory.bankDetailReceived && (
              <button
                type="button"
                onClick={copyBankDetails}
                className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                title="Copy bank details"
              >
                <Copy size={16} />
              </button>
            )}
          </div>

          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 break-words text-xs font-medium text-slate-700">
              {fnfHistory.bankDetailReceived || "-"}
            </p>
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={sendFnfWhatsAppMessage}
            className="flex self-start h-fit w-fit items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            <FaWhatsapp size={18} className="text-white" /> F&F Msg
          </button>
          {/* FNF ACTION */}
          {canEditFnf && (
            <div className="border-t border-slate-100 ">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <IndianRupee size={16} />
                F&F Settlement
              </button>
            </div>
          )}{" "}
        </div>
      </div>
    </div>
  );
};

export default FnfMobileCard;