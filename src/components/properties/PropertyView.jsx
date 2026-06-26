// import React from "react";
// import { useParams } from "react-router-dom";
// import { useSinglePropertiesData } from "./services";
// import Loader from "../common/Loader";
// import { formatDate } from "../../utils/dateFormatter";

// const DetailItem = ({ label, value }) => (
//   <div className="border rounded-lg p-3 bg-gray-50">
//     <p className="text-xs text-gray-500">{label}</p>
//     <p className="font-medium wrap-break-words">{value || "-"}</p>
//   </div>
// );

// const PropertyView = () => {
//   const { id } = useParams();

//   const { data, isPending } = useSinglePropertiesData(id);

//   const property = data?.data;

//   if (isPending) return <Loader />;

//   return (
//     <div className="max-w-12xl mx-auto p-6 space-y-6">
//       {/* Header */}
//       <div className="bg-white border rounded-xl shadow-sm p-5">
//         <h1 className="text-2xl font-bold">Property Details</h1>
//         <p className="text-gray-500">
//           Complete information of selected property
//         </p>
//       </div>

//       {/* Property Details */}
//       <div className="bg-white border rounded-xl shadow-sm p-5">
//         <h2 className="text-lg font-semibold mb-4">Property Details</h2>

//         <div className="grid md:grid-cols-4 gap-4">
//           <DetailItem label="Property Code" value={property?.propertyCode} />
//           <DetailItem label="Status" value={property?.status} />
//           <DetailItem label="Location" value={property?.propertyLocation} />
//           <DetailItem label="Bed Count" value={property?.bedCount} />
//           <DetailItem label="Address" value={property?.propertyAddress} />
//         </div>
//       </div>

//       {/* Internet Details */}
//       <div className="bg-white border rounded-xl shadow-sm p-5">
//         <h2 className="text-lg font-semibold mb-4">Internet Details</h2>

//         <div className="grid md:grid-cols-4 gap-4">
//           <DetailItem
//             label="Vendor Login ID"
//             value={property?.internet?.vendorLoginId}
//           />
//           <DetailItem
//             label="Vendor Password"
//             value={property?.internet?.vendorLoginPassword}
//           />
//           <DetailItem
//             label="Consumer ID"
//             value={property?.internet?.consumerId}
//           />
//           <DetailItem
//             label="Contact No 1"
//             value={property?.internet?.contactNo1}
//           />
//           <DetailItem
//             label="Contact No 2"
//             value={property?.internet?.contactNo2}
//           />
//           <DetailItem
//             label="WiFi Name"
//             value={property?.internet?.wifiName}
//           />
//           <DetailItem
//             label="WiFi Password"
//             value={property?.internet?.wifiPwd}
//           />
//           <DetailItem
//             label="Router Type"
//             value={property?.internet?.routerConnectionType}
//           />
//           <DetailItem
//             label="Main Router Code"
//             value={property?.internet?.mainRouterPropertyCode}
//           />
//           <DetailItem
//             label="Registered Number"
//             value={property?.internet?.gpgsRegisteredNoWithInternetVendor}
//           />
//         </div>
//       </div>

//       {/* Utility Details */}
//       <div className="bg-white border rounded-xl shadow-sm p-5">
//         <h2 className="text-lg font-semibold mb-4">Utility Details</h2>

//         <div className="grid md:grid-cols-4 gap-4">
//           <DetailItem
//             label="EB Consumer No"
//             value={property?.utility?.ebConsumerNo}
//           />
//           <DetailItem
//             label="EB Billing Unit"
//             value={property?.utility?.ebBillingUnit}
//           />
//           <DetailItem
//             label="EB Start Date"
//             value={formatDate(property?.utility?.ebStartDate)}
//           />
//           <DetailItem
//             label="EB End Date"
//             value={formatDate(property?.utility?.ebEndDate)}
//           />
//           <DetailItem
//             label="EB Website"
//             value={property?.utility?.ebPcWebLink}
//           />
//           <DetailItem
//             label="Gas Consumer No"
//             value={property?.utility?.gasConsumerNo}
//           />
//           <DetailItem
//             label="Gas Start Date"
//             value={formatDate(property?.utility?.gasBillStartDate)}
//           />
//           <DetailItem
//             label="Gas End Date"
//             value={formatDate(property?.utility?.gasBillEndDate)}
//           />
//           <DetailItem
//             label="Water Consumer No"
//             value={property?.utility?.waterBillConsumerNo}
//           />
//           <DetailItem
//             label="Water Start Date"
//             value={formatDate(property?.utility?.waterBillStartDate)}
//           />
//           <DetailItem
//             label="Water End Date"
//             value={formatDate(property?.utility?.waterBillEndDate)}
//           />
//         </div>
//       </div>

//       {/* Owner Details */}
//       <div className="bg-white border rounded-xl shadow-sm p-5">
//         <h2 className="text-lg font-semibold mb-4">Owner Details</h2>

//         <div className="grid md:grid-cols-4 gap-4">
//           <DetailItem
//             label="Owner Name"
//             value={property?.owner?.fullName}
//           />
//           <DetailItem
//             label="Contact No 1"
//             value={property?.owner?.contactNo1}
//           />
//           <DetailItem
//             label="Contact No 2"
//             value={property?.owner?.contactNo2}
//           />
//           <DetailItem
//             label="Emergency Contact Name"
//             value={property?.owner?.emergencyContactName}
//           />
//           <DetailItem
//             label="Emergency Contact No"
//             value={property?.owner?.emergencyContactNo}
//           />
//         </div>

//         {/* Photos */}
//         <div className="mt-6">
//           <h3 className="font-semibold mb-3">Owner Photos</h3>

//           <div className="flex flex-wrap gap-4">
//             {property?.owner?.photo?.map((img, index) => (
//               <img
//                 key={index}
//                 src={img}
//                 alt=""
//                 className="w-32 h-32 object-cover rounded-lg border"
//               />
//             ))}
//           </div>
//         </div>

//         {/* Aadhar */}
//         <div className="mt-6">
//           <h3 className="font-semibold mb-3">Aadhar Documents</h3>

//           <div className="flex flex-wrap gap-3">
//             {property?.owner?.aadharCard?.map((file, index) => (
//               <a
//                 key={index}
//                 href={file}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="px-3 py-2 border rounded-lg text-blue-600"
//               >
//                 View Document {index + 1}
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Agreement Details */}
//       <div className="bg-white border rounded-xl shadow-sm p-5">
//         <h2 className="text-lg font-semibold mb-4">Agreement Details</h2>

//         <div className="grid md:grid-cols-4 gap-4">
//           <DetailItem
//             label="Property Start Date"
//             value={formatDate(property?.agreement?.propertyStartDate)}
//           />
//           <DetailItem
//             label="Property End Date"
//             value={formatDate(property?.agreement?.propertyEndDate)}
//           />
//           <DetailItem
//             label="Agreement Start Date"
//             value={formatDate(property?.agreement?.agreementStartDate)}
//           />
//           <DetailItem
//             label="Agreement End Date"
//             value={formatDate(property?.agreement?.agreementEndDate)}
//           />
//           <DetailItem
//             label="Agreement Status"
//             value={property?.agreement?.agreementStatus}
//           />
//           <DetailItem
//             label="Police NOC No"
//             value={property?.agreement?.policeNocNo}
//           />
//           <DetailItem
//             label="Police NOC Status"
//             value={property?.agreement?.policeNocStatus}
//           />
//           <DetailItem
//             label="Deal Details"
//             value={property?.agreement?.dealDetails}
//           />
//         </div>

//         <div className="mt-4 border rounded-lg p-4 bg-gray-50">
//           <p className="text-sm text-gray-500 mb-1">
//             Agreement Comment
//           </p>
//           <p>{property?.agreement?.comment || "-"}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyView;