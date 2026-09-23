

import React from "react";
import { formatDate } from "../../utils/dateFormatter";
import { IoIosCall } from "react-icons/io";
import Loader from "../common/Loader";
const BookingConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  data,
  isLoading,
}) => {

  if (!isOpen) return null;
  // last date of the month for parmanent property 
  const startDate = data?.clientDoj
    ? new Date(data.clientDoj)
    : null;
  const endDate = data?.clientLastDate
    ? new Date(data.clientLastDate)
    : startDate
      ? (() => {
        const year = startDate.getFullYear();
        const month = startDate.getMonth();

        const actualLastDay = new Date(year, month + 1, 0).getDate();
        const day = Math.min(actualLastDay, 30);

        return new Date(year, month, day);
      })()
      : null;

  // last date of the month for Temporary property 
  const TempStartDate = data?.temporaryClientDoj
    ? new Date(data.temporaryClientDoj)
    : null;

  const TempEndDate = data?.temporaryClientLastDate
    ? new Date(data.temporaryClientLastDate)
    : TempStartDate
      ? (() => {
        const year = TempStartDate.getFullYear();
        const month = TempStartDate.getMonth();

        const actualLastDay = new Date(year, month + 1, 0).getDate();
        const day = Math.min(actualLastDay, 30);

        return new Date(year, month, day);
      })()
      : null;




  const shareOnWhatsApp = () => {
    const formatWhatsAppDate = (date) =>
      date
        ? new Date(date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        : "NA";

    const totalAmount =
      (Number(data?.clientCalculatedRent) || 0) +
      (Number(data?.depositAmount) || 0) +
      (Number(data?.processingFees) || 0) +
      (Number(data?.parkingCharges) || 0) +
      (Number(data?.temporaryParkingCharges) || 0) +
      (Number(data?.temporaryclientCalculatedRent) || 0);

    const balanceAmount =
      totalAmount - (Number(data?.monthlyRent) || 0);

    let msg = `Payment Details For ${data?.fullName} ( Contact No : ${data?.callingNo} )`;

    // ================= TEMPORARY =================
    if (data?.temporaryPropertyId) {
      msg += "\n\n";
      msg += `
Temporary PG Facility Code: ${data?.temporaryPropertyId?.value?.split(",")[1] || "-"}
Room No: ${data?.temporaryRoomNo || "-"}
Bed No: ${data?.temporaryBedId?.split(",")[1] || "-"}
AC Room: ${data?.temporaryAcRoom || "-"}
Start Date: ${formatWhatsAppDate(data?.temporaryClientDoj)}
Last Date: ${formatWhatsAppDate(data?.temporaryClientLastDate)}
Temporary Bed Rent Amount: ₹${data?.temporaryclientCalculatedRent || 0} (This rent is from ${formatWhatsAppDate(data?.temporaryClientDoj)} to ${formatWhatsAppDate(TempEndDate)}, monthly fixed rent is ₹${data?.temporaryMonthlyRent || 0})
${Number(data?.temporaryParkingCharges) > 0
          ? `Temp Parking Charges: ₹${data?.temporaryParkingCharges}`
          : ""}
${data?.bookingType === "Daily"
          ? `Deposit Amount: ₹${data?.temporaryclientCalculatedRent || 0}`
          : ""}
${data?.bookingType === "Daily"
          ? `Total Amount To Be Paid: ₹${(Number(data?.temporaryclientCalculatedRent || 0) * 2)}`
          : ""}
`.trim();
    }

    // ================= PERMANENT =================
    if (data?.propertyId) {
      msg += "\n\n";
      msg += `
Permanent PG Facility Code: ${data?.propertyId?.value?.split(",")[1] || "-"}
Room No.: ${data?.roomNo || "-"}
Bed No.: ${data?.bedId?.split(",")[1] || "-"}
AC Room: ${data?.acRoom || "-"}
Start Date: ${formatWhatsAppDate(data?.clientDoj)}
Last Date: ${formatWhatsAppDate(data?.clientLastDate)}
Permanent Bed Rent Amount: ₹${data?.clientCalculatedRent || 0} (This rent is from ${formatWhatsAppDate(data?.clientDoj)} to ${formatWhatsAppDate(endDate)}, monthly fixed rent is ₹${data?.monthlyRent || 0})
Permanent Bed Deposit Amount: ₹${data?.depositAmount || 0}
Processing Fees: ₹${data?.processingFees || 0}
${Number(data?.parkingCharges) > 0
          ? `Parking Charges: ₹${data?.parkingCharges}`
          : ""}
Total Amount to be paid: ₹${totalAmount}
`.trim();

      if (data?.askFor === "BA") {
        msg += `

📌 The booking is confirmed only after the booking amount ₹${Number(
          data?.monthlyRent || 0
        ).toLocaleString("en-IN")} is received by us. The balance amount ₹${balanceAmount.toLocaleString(
          "en-IN"
        )} is to be paid before possession on the date of joining.`;
      }

      if (data?.askFor === "FA") {
        msg += `

📌 The booking is confirmed only after full amount ₹${totalAmount.toLocaleString(
          "en-IN"
        )} is received by us.`;
      }

      msg += `

📌 Payment is not refundable if you cancel the booking for any reason. Please read the agreement file sent to your WhatsApp and contact us if you have any concerns.`;
    }

    // ================= UPCOMING RENT HIKE =================
    if (data?.URHD || data?.URHA) {
      msg += `

📌 Upcoming Rent Hike Details — Date: ${data?.URHD || "NA"} | Amount: ${data?.URHA ? `₹${data.URHA}` : "NA"
        }`;
    }

    msg += `

Gopal's Paying Guest Services
(Customer Care No: 8928191814 | Service Hours: 10AM to 7PM)
Note: This is a system-generated message and does not require a signature.`;

    const encodedMsg = encodeURIComponent(msg);

    const number = data?.callingNo?.replace(/\D/g, "") || "";

    if (!number) {
      alert("WhatsApp number is not available");
      return;
    }

    window.open(
      `https://api.whatsapp.com/send?phone=91${number}&text=${encodedMsg}`,
      "_blank"
    );
  };










  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] text-md overflow-y-auto">

        {/* Header */}
        <div className="border-b border-gray-400 py-2 flex justify-center items-center">
          {/* Center */}
          <h2 className="text-xl flex justify-center items-center gap-1 p-2 font-bold">
            Payment Detail For {data?.fullName} - <span className="text-blue-500"> <IoIosCall /></span> {data?.callingNo}
          </h2>

        </div>

        {/* Body */}
        <div className="px-6 py-2">
          {data?.temporaryPropertyId && (
            <div className="mb-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                <div>
                  <p><strong>Temporary PG Facility Code :</strong>{" "}{data?.temporaryPropertyId?.value?.split(",")[1]}</p>
                  <p><strong>Room No :</strong>{" "}{data?.temporaryRoomNo}</p>
                  <p><strong>Bed No :</strong>{" "}{data?.temporaryBedId?.split(",")[1]}</p>
                  <p><strong>ACRoom :</strong> {data?.temporaryAcRoom}</p>
                  <p><strong>Start Date :</strong> {formatDate(data?.temporaryClientDoj)}</p>
                  <p><strong>Last Date :</strong> {formatDate(data?.temporaryClientLastDate)}</p>
                </div>
                <div>
                  <p><strong>Temporary Bed Rent Amount :</strong> ₹{" "}{data?.temporaryclientCalculatedRent}</p>
                  <div className=" text-gray-600 whitespace-normal wrap-break-word">
                    ( This rent is from{" "}
                    {formatDate(TempStartDate)}
                    {" "}to{" "}
                    {formatDate(TempEndDate)}
                    , also please note the monthly fixed rent of this bed is ₹{" "}
                    {data?.temporaryMonthlyRent} )
                  </div>
                  <p><strong>Temporary Parking Charges :</strong> ₹ {data?.temporaryParkingCharges || 0}</p>
                  {data?.bookingType === "Daily" ? <p><strong> Deposit Amount :</strong> ₹ {data?.temporaryclientCalculatedRent || 0}</p> : ""}
                  {data?.bookingType === "Daily" ? <p><strong> Total Amount to be Paid:</strong> ₹ {data?.temporaryclientCalculatedRent * 2 || 0}</p> : ""}
                </div>
              </div>
            </div>
          )}
          <hr className="border border-gray-200" />

          {data?.propertyId && (
            <div className="mb-2 mt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 whitespace-nowrap gap-1">
                <div>

                  <p><strong>Permanent PG Facility Code :</strong> {data?.propertyId?.value?.split(",")[1]}</p>
                  <p><strong>Room No :</strong> {data?.roomNo}</p>
                  <p><strong>Bed No :</strong> {data?.bedId?.split(",")[1]}</p>
                  <p><strong>ACRoom :</strong> {data?.acRoom}</p>
                  <p><strong>Start Date :</strong> {formatDate(data?.clientDoj)}</p>
                  <p><strong>Last Date :</strong> {formatDate(data?.clientLastDate)}</p>
                </div>
                <div>

                  <p><strong>Permanent Bed Rent Amount :</strong> ₹ {data?.clientCalculatedRent}</p>
                  <div className="text-gray-600 whitespace-normal wrap-break-word">
                    ( This rent is from{" "}
                    {formatDate(startDate)}
                    {" "}to{" "}
                    {formatDate(endDate)}
                    , also please note the monthly fixed rent of this bed is ₹
                    {"  "}{data?.monthlyRent} )
                  </div>
                  <p><strong>Permanent Bed Deposit Amount   :</strong> ₹ {data?.depositAmount}</p>
                  <p><strong>Processing Fees :</strong> ₹ {data?.processingFees}</p>
                  <p><strong>Parking Charges :</strong> ₹ {data?.parkingCharges}</p>
                  <p>
                    <strong>Total Amount To Be Paid :</strong> ₹ {
                      (Number(data?.clientCalculatedRent) || 0) +
                      (Number(data?.depositAmount) || 0) +
                      (Number(data?.processingFees) || 0) +
                      (Number(data?.parkingCharges) || 0) +
                      (Number(data?.temporaryParkingCharges) || 0) +
                      (Number(data?.temporaryclientCalculatedRent) || 0)
                    }
                  </p>
                </div>

              </div>
            </div>
          )}

          {data?.bookingType !== "Daily" && (
            <>

              <hr className="border border-gray-200" />
              <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-4">
                {data?.askFor === "BA" && (
                  <p className="mb-3">
                    📌 <strong>
                      The booking is confirmed only after the booking amount ₹{" "}
                      {Number(data?.monthlyRent || 0).toLocaleString("en-IN")} is received by us.
                    </strong>{" "}
                    The balance amount ₹{" "}
                    <strong>
                      {(
                        (Number(data?.clientCalculatedRent) || 0) +
                        (Number(data?.depositAmount) || 0) +
                        (Number(data?.processingFees) || 0) +
                        (Number(data?.parkingCharges) || 0) +
                        (Number(data?.temporaryParkingCharges) || 0) +
                        (Number(data?.temporaryclientCalculatedRent) || 0)
                        - Number(data?.monthlyRent || 0))?.toLocaleString("en-IN")
                      }
                    </strong> is to be paid before possession on the date of joining.
                  </p>
                )}

                {data?.askFor === "FA" && (
                  <p className="mb-2">
                    📌 <strong>
                      The booking is confirmed only after the full amount ₹{" "}
                      {(
                        (Number(data?.clientCalculatedRent) || 0) +
                        (Number(data?.depositAmount) || 0) +
                        (Number(data?.processingFees) || 0) +
                        (Number(data?.parkingCharges) || 0) +
                        (Number(data?.temporaryParkingCharges) || 0) +
                        (Number(data?.temporaryclientCalculatedRent) || 0)
                      ).toLocaleString("en-IN")}{" "}
                      is received by us.
                    </strong>
                  </p>
                )}

                <p>
                  📌 <strong>Payment is non-refundable</strong> if you cancel the booking for
                  any reason. Before making any payment, please read the agreement file sent
                  on your WhatsApp. If you have any concerns, please let us know.
                </p>
              </div>
            </>
          )}


          <div className="mt-2 border-t border-gray-300 pt-1 text-center text-gray-700">
            <h3 className="font-bold text-base">
              Gopal's Paying Guest Services
            </h3>
            <p className="mt-1">
              (Customer Care No: 8928191814 | Service Hours: 10:00 AM to 7:00 PM)
            </p>
            <div className="mt-1 text-center ">
              <p>
                📌 <strong>Upcoming Rent Hike Details : </strong> <span>
                  <strong>Date :</strong> {data?.URHD} &nbsp; | &nbsp;
                  <strong>Amount :</strong> {data?.URHA}
                </span>
              </p>


            </div>

            <p className="mt-1 text-xs text-gray-500 italic">
              Note: This is a system-generated document and does not require a signature.
            </p>
          </div>
        </div>
        {/* Footer */}
        <div className="border-t border-gray-400 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Edit
          </button>

          <button
            onClick={() => {
              shareOnWhatsApp();
              onConfirm();
            }}
            disabled={isLoading}
            className="theme-btn px-5 py-2"
          >
            {isLoading ? (
              <div className="flex gap-5">
                <Loader /> Submit ..
              </div>
            ) : (
              "Confirm & Share on WhatsApp"
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookingConfirmationModal;



// import React from "react";
// import { formatDate } from "../../utils/dateFormatter";
// import { IoIosCall } from "react-icons/io";
// import Loader from "../common/Loader";

// const BookingConfirmationModal = ({
//   isOpen,
//   onClose,
//   onConfirm,
//   data,
//   isLoading,
// }) => {
//   if (!isOpen) return null;
//   // last date of the month for parmanent property
//   const startDate = data?.clientDoj
//     ? new Date(data.clientDoj)
//     : null;
//   const endDate = data?.clientLastDate
//     ? new Date(data.clientLastDate)
//     : startDate
//       ? (() => {
//         const year = startDate.getFullYear();
//         const month = startDate.getMonth();

//         const actualLastDay = new Date(year, month + 1, 0).getDate();
//         const day = Math.min(actualLastDay, 30);

//         return new Date(year, month, day);
//       })()
//       : null;

//   // last date of the month for Temporary property
//   const TempStartDate = data?.temporaryClientDoj
//     ? new Date(data.temporaryClientDoj)
//     : null;
//   const TempEndDate = data?.temporaryClientLastDate
//     ? new Date(data.temporaryClientLastDate)
//     : TempStartDate
//       ? (() => {
//         const year = TempStartDate.getFullYear();
//         const month = TempStartDate.getMonth();

//         const actualLastDay = new Date(year, month + 1, 0).getDate();
//         const day = Math.min(actualLastDay, 30);

//         return new Date(year, month, day);
//       })()
//       : null;

//   return (
//     <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
//       <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] text-md overflow-y-auto">

//         {/* Header */}
//         <div className="border-b border-gray-400 py-2 flex justify-center items-center">
//           {/* Center */}
//           <h2 className="text-xl flex justify-center items-center gap-1 p-2 font-bold">
//             Payment Detail For {data?.fullName} - <span className="text-blue-500"> <IoIosCall /></span> {data?.callingNo}
//           </h2>

//         </div>

//         {/* Body */}
//         <div className="px-6 py-2">
//           {data?.temporaryPropertyId && (
//             <div className="mb-2">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
//                 <div>
//                   <p><strong>Temporary PG Facility Code :</strong>{" "}{data?.temporaryPropertyId?.value?.split(",")[1]}</p>
//                   <p><strong>Room No :</strong>{" "}{data?.temporaryRoomNo}</p>
//                   <p><strong>Bed No :</strong>{" "}{data?.temporaryBedId?.split(",")[1]}</p>
//                   <p><strong>ACRoom :</strong> {data?.temporaryAcRoom}</p>
//                   <p><strong>Start Date :</strong> {formatDate(data?.temporaryClientDoj)}</p>
//                   <p><strong>Last Date :</strong> {formatDate(data?.temporaryClientLastDate)}</p>
//                 </div>
//                 <div>
//                   <p><strong>Temporary Bed Rent Amount :</strong> ₹{" "}{data?.temporaryclientCalculatedRent}</p>
//                   <div className=" text-gray-600 whitespace-normal wrap-break-word">
//                     ( This rent is from{" "}
//                     {formatDate(TempStartDate)}
//                     {" "}to{" "}
//                     {formatDate(TempEndDate)}
//                     , also please note the monthly fixed rent of this bed is ₹{" "}
//                     {data?.monthlyRent} )
//                   </div>
//                   <p><strong>Temporary Parking Charges :</strong> ₹ {data?.temporaryParkingCharges  || 0}</p>
//                  {data?.bookingType === "Daily" ? <p><strong> Deposit Amount :</strong> ₹ {data?.temporaryclientCalculatedRent  || 0}</p> : ""}
//                  {data?.bookingType === "Daily" ? <p><strong> Total Amount to be Paid:</strong> ₹ {data?.temporaryclientCalculatedRent * 2  || 0}</p> : ""}
//                 </div>
//               </div>
//             </div>
//           )}
//           <hr className="border border-gray-200" />

//            {data?.propertyId && (
//           <div className="mb-2 mt-1">
//             <div className="grid grid-cols-1 md:grid-cols-2 whitespace-nowrap gap-1">
//               <div>

//                 <p><strong>Permanent PG Facility Code :</strong> {data?.propertyId?.value?.split(",")[1]}</p>
//                 <p><strong>Room No :</strong> {data?.roomNo}</p>
//                 <p><strong>Bed No :</strong> {data?.bedId?.split(",")[1]}</p>
//                 <p><strong>ACRoom :</strong> {data?.acRoom}</p>
//                 <p><strong>Start Date :</strong> {formatDate(data?.clientDoj)}</p>
//                 <p><strong>Last Date :</strong> {formatDate(data?.clientLastDate)}</p>
//               </div>
//               <div>

//                 <p><strong>Permanent Bed Rent Amount :</strong> ₹ {data?.clientCalculatedRent}</p>
//                 <div className="text-gray-600 whitespace-normal wrap-break-word">
//                   ( This rent is from{" "}
//                   {formatDate(startDate)}
//                   {" "}to{" "}
//                   {formatDate(endDate)}
//                   , also please note the monthly fixed rent of this bed is ₹
//                   {"  "}{data?.monthlyRent} )
//                 </div>
//                 <p><strong>Permanent Bed Deposit Amount   :</strong> ₹ {data?.depositAmount}</p>
//                 <p><strong>Processing Fees :</strong> ₹ {data?.processingFees}</p>
//                 <p><strong>Parking Charges :</strong> ₹ {data?.parkingCharges}</p>
//                 <p>
//                   <strong>Total Amount To Be Paid :</strong> ₹ {
//                     (Number(data?.clientCalculatedRent) || 0) +
//                     (Number(data?.depositAmount) || 0) +
//                     (Number(data?.processingFees) || 0) +
//                     (Number(data?.parkingCharges) || 0) +
//                     (Number(data?.temporaryParkingCharges) || 0) +
//                     (Number(data?.temporaryclientCalculatedRent) || 0)
//                   }
//                 </p>
//               </div>

//             </div>
//           </div>
//             )}
//           <hr className="border border-gray-200" />

//           <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-4">
//             {data?.askFor === "BA" && (
//               <p className="mb-3">
//                 📌 <strong>
//                   The booking is confirmed only after the booking amount ₹{" "}
//                   {Number(data?.monthlyRent || 0).toLocaleString("en-IN")} is received by us.
//                 </strong>{" "}
//                 The balance amount ₹{" "}
//                 <strong>
//                   {(
//                     (Number(data?.clientCalculatedRent) || 0) +
//                     (Number(data?.depositAmount) || 0) +
//                     (Number(data?.processingFees) || 0) +
//                     (Number(data?.parkingCharges) || 0) +
//                     (Number(data?.temporaryParkingCharges) || 0) +
//                     (Number(data?.temporaryclientCalculatedRent) || 0)
//                     - Number(data?.monthlyRent || 0))?.toLocaleString("en-IN")
//                   }
//                 </strong> is to be paid before possession on the date of joining.
//               </p>
//             )}

//             {data?.askFor === "FA" && (
//               <p className="mb-2">
//                 📌 <strong>
//                   The booking is confirmed only after the full amount ₹{" "}
//                   {(
//                     (Number(data?.clientCalculatedRent) || 0) +
//                     (Number(data?.depositAmount) || 0) +
//                     (Number(data?.processingFees) || 0) +
//                     (Number(data?.parkingCharges) || 0) +
//                     (Number(data?.temporaryParkingCharges) || 0) +
//                     (Number(data?.temporaryclientCalculatedRent) || 0)
//                   ).toLocaleString("en-IN")}{" "}
//                   is received by us.
//                 </strong>
//               </p>
//             )}

//             <p>
//               📌 <strong>Payment is non-refundable</strong> if you cancel the booking for
//               any reason. Before making any payment, please read the agreement file sent
//               on your WhatsApp. If you have any concerns, please let us know.
//             </p>
//           </div>


//           <div className="mt-2 border-t border-gray-300 pt-1 text-center text-gray-700">
//             <h3 className="font-bold text-base">
//               Gopal's Paying Guest Services
//             </h3>
//             <p className="mt-1">
//               (Customer Care No: 8928191814 | Service Hours: 10:00 AM to 7:00 PM)
//             </p>
//             <div className="mt-1 text-center ">
//               <p>
//                 📌 <strong>Upcoming Rent Hike Details : </strong> <span>
//                   <strong>Date :</strong> {data?.URHD} &nbsp; | &nbsp;
//                   <strong>Amount :</strong> {data?.URHA}
//                 </span>
//               </p>


//             </div>

//             <p className="mt-1 text-xs text-gray-500 italic">
//               Note: This is a system-generated document and does not require a signature.
//             </p>
//           </div>
//         </div>
//         {/* Footer */}
//         <div className="border-t border-gray-400 p-4 flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 border rounded-lg"
//           >
//             Edit
//           </button>

//           <button
//             onClick={onConfirm}
//             disabled={isLoading}
//             className="theme-btn px-5 py-2"
//           >
//             {isLoading ? <div className="flex gap-5">
//                <Loader/> Submit ..
//             </div> : "Confirm & Submit"}
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default BookingConfirmationModal;



































