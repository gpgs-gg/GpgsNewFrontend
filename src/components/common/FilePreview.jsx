import React, { useMemo, useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import { formatDateAndTime } from "../../utils/dateFormatter";
import { useAuth } from "../../context/authContext";
const FilePreview = ({
  files,
  existingFiles,
  onRemoveNew,
  onRemoveExisting,
  isCompressing,
  compressionProgress,
  compressionFileName,
}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [loadingImages, setLoadingImages] = useState({});
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const selectedFiles = files ? Array.from(files) : [];

  const existing = useMemo(() => {
    if (!existingFiles) return [];

    if (Array.isArray(existingFiles)) {
      return existingFiles.map((file) => {
        if (typeof file === "string") {
          return {
            url: file,
            uploadedBy: "",
            uploadedAt: "",
            role: "",
          };
        }

        return {
          url: file?.url || "",
          uploadedBy: file?.uploadedBy || "",
          uploadedAt: file?.uploadedAt || "",
          role: file?.role || "",
        };
      });
    }

    return String(existingFiles)
      .split(",")
      .map((url) => ({
        url: url.trim(),
        uploadedBy: "",
        uploadedAt: "",
        role: "",
      }))
      .filter((x) => x.url);
  }, [existingFiles]);

  // 🚀 SAFE PREVIEWS
  const previews = useMemo(() => {
    return selectedFiles.map((file) => {
      let url = "";
      let type = "";
      let fileName = "";

      if (file instanceof File || file instanceof Blob) {
        url = URL.createObjectURL(file);
        type = file.type || "";
        fileName = file.name || "";
      } else if (typeof file === "string") {
        url = file;
        fileName = file;
      } else if (file) {
        url = file.url || "";
        type = file.type || "";
        fileName = file.name || file.url || "";
      }

      const lowerUrl = url.toLowerCase().split("?")[0];
      const lowerName = fileName.toLowerCase().split("?")[0];

      const isImage =
        type.startsWith("image/") ||
        /\.(jpg|jpeg|png|webp|gif|bmp|svg|heic|heif)$/i.test(lowerName) ||
        /\.(jpg|jpeg|png|webp|gif|bmp|svg|heic|heif)$/i.test(lowerUrl);

      const isPdf =
        type === "application/pdf" ||
        /\.pdf$/i.test(lowerName) ||
        /\.pdf$/i.test(lowerUrl);

      const isVideo =
        type.startsWith("video/") ||
        /\.(mp4|mov|avi|mkv|webm|3gp|mpeg|mpg)$/i.test(lowerName) ||
        /\.(mp4|mov|avi|mkv|webm|3gp|mpeg|mpg)$/i.test(lowerUrl);

      return {
        file,
        url,
        type,
        fileName,
        isImage,
        isPdf,
        isVideo,
      };
    });
  }, [files]);

  // Cleanup ONLY the object URLs created above
  useEffect(() => {
    return () => {
      previews.forEach((item) => {
        if (item.file instanceof File || item.file instanceof Blob) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [previews]);

  // {
  //   previews.map((item, index) => (
  //     <div
  //       key={`${item.url}-${index}`}
  //       className="relative w-28 flex flex-col items-center"
  //     >
  //       {/* IMAGE */}
  //       {item.isImage && (
  //         <>
  //           <div className="relative w-24 h-24">
  //             {loadingImages[index] && (
  //               <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 rounded-lg border">
  //                 <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  //               </div>
  //             )}

  //             <img
  //               src={item.url}
  //               alt="preview"
  //               onLoad={() =>
  //                 setLoadingImages((prev) => ({
  //                   ...prev,
  //                   [index]: false,
  //                 }))
  //               }
  //               onLoadStart={() =>
  //                 setLoadingImages((prev) => ({
  //                   ...prev,
  //                   [index]: true,
  //                 }))
  //               }
  //               onClick={() => openPreview(item.url, "image")}
  //               className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
  //             />
  //           </div>

  //           <button
  //             type="button"
  //             onClick={() => onRemoveNew?.(index)}
  //             className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
  //           >
  //             <X size={14} />
  //           </button>
  //         </>
  //       )}
  //       {/* PDF */}
  //       {item.isPdf && (
  //         <>
  //           <div
  //             onClick={() => openPreview(item.url, "pdf")}
  //             className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
  //           >
  //             <FileText size={28} className="text-red-500" />
  //             <span className="text-[10px] mt-1">PDF</span>
  //           </div>

  //           <button
  //             type="button"
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               onRemoveNew?.(index);
  //             }}
  //             className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
  //           >
  //             <X size={14} />
  //           </button>
  //         </>
  //       )}

  //       {/* VIDEO */}
  //       {item.isVideo && (
  //         <>
  //           <video
  //             src={item.url}
  //             muted
  //             playsInline
  //             onClick={() => openPreview(item.url, "video")}
  //             className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
  //           />

  //           <button
  //             type="button"
  //             onClick={() => onRemoveNew?.(index)}
  //             className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
  //           >
  //             <X size={14} />
  //           </button>
  //         </>
  //       )}

  //       <div className="mt-2 text-center text-[10px] leading-4 text-blue-600 w-full">
  //         <div className="font-semibold">New Attachment</div>

  //         <div className="truncate w-full px-1">
  //           {item.fileName || "Attachment"}
  //         </div>
  //       </div>
  //     </div>
  //   ));
  // }

  const openPreview = (url, type) => {
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  if (previews.length === 0 && existing.length === 0 && !isCompressing) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-3 items-start">
        {/* {isCompressing && (
          <div className="relative w-28 flex flex-col items-center">
            <div className="w-24 h-24 border rounded-lg bg-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />

                <span className="text-[10px] text-blue-600 font-medium">
                  Processing...
                </span>
              </div>
            </div>

            <div className="mt-2 text-center text-[10px] leading-4 text-blue-600 w-full">
              <div className="font-semibold">Compressing</div>
              <div className="truncate w-full px-1">Please wait...</div>
            </div>
          </div>
        )} */}

        {isCompressing && (
          <div className="relative w-28 flex flex-col items-center">
            <div className="w-24 h-24 border rounded-lg bg-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 w-full px-2">
                {/* Circular Loader */}
                <div className="relative w-12 h-12">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    {/* Background */}
                    <path
                      d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />

                    {/* Progress */}
                    <path
                      d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${compressionProgress}, 100`}
                    />
                  </svg>

                  {/* Percentage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-blue-600">
                      {compressionProgress}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-2 text-center text-[10px] leading-4 text-blue-600 w-full">
              <div className="font-semibold">Compressing</div>

              <div className="truncate w-full px-1" title={compressionFileName}>
                {compressionFileName || "Please wait..."}
              </div>
            </div>
          </div>
        )}
        {/* NEW FILES */}
        {previews.map((item, index) => (
          <div key={index} className="relative w-28 flex flex-col items-center">
            {/* IMAGE */}
            {item.isImage && (
              <>
                <img
                  src={item.url}
                  alt="preview"
                  onClick={() => openPreview(item.url, "image")}
                  className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => onRemoveNew?.(index)}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </>
            )}

            {/* PDF */}
            {item.isPdf && (
              <>
                <div
                  onClick={() => openPreview(item.url, "pdf")}
                  className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
                >
                  <FileText size={28} className="text-red-500" />

                  <span className="text-[10px] mt-1">PDF</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveNew?.(index);
                  }}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </>
            )}

            {/* VIDEO */}
            {item.isVideo && (
              <>
                <video
                  src={item.url}
                  muted
                  onClick={() => openPreview(item.url, "video")}
                  className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                />

                <button
                  type="button"
                  onClick={() => onRemoveNew?.(index)}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </>
            )}

            {/* New File Details */}
            <div className="mt-2 text-center text-[10px] leading-4 text-blue-600 w-full">
              <div className="font-semibold">New Attachment</div>

              <div className="truncate w-full px-1">{item.file?.name}</div>
            </div>
          </div>
        ))}
        {/* EXISTING FILES */}
        {/* EXISTING FILES */}
        {existing.map((file, index) => {
          const fileUrl = file.url;
          const uploadedBy = file.uploadedBy;
          const role = file.role;
          const uploadedAt = formatDateAndTime(file.uploadedAt);

          const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);
          const isPdf = /\.pdf(\?|$)/i.test(fileUrl);
          const isVideo = /\.(mp4|mov|avi|mkv|webm|3gp|mpeg)(\?|$)/i.test(
            fileUrl,
          );

          return (
            <div
              key={index}
              className="relative w-28 flex flex-col items-center"
            >
              {isImage && (
                <>
                  <img
                    src={fileUrl}
                    alt="existing"
                    onClick={() => openPreview(fileUrl, "image")}
                    className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                  />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onRemoveExisting?.(index)}
                      className="absolute -top-2 -right-2 z-20 bg-black text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </>
              )}

              {isPdf && (
                <>
                  <div
                    onClick={() => openPreview(fileUrl, "pdf")}
                    className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
                  >
                    <FileText size={28} className="text-red-500" />

                    <span className="text-[10px] mt-1">PDF</span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveExisting?.(index);
                      }}
                      className="absolute -top-2 -right-2 z-20 bg-black text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </>
              )}

              {isVideo && (
                <>
                  <video
                    src={fileUrl}
                    muted
                    onClick={() => openPreview(fileUrl, "video")}
                    className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                  />
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onRemoveExisting?.(index)}
                      className="absolute -top-2 -right-2 z-20 bg-black text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </>
              )}

              {(uploadedBy || uploadedAt) && (
                <div className="mt-2 text-center text-[10px] leading-4 text-gray-600 w-full">
                  {uploadedBy && (
                    <div className="font-semibold truncate">
                      {uploadedBy} | {role}
                    </div>
                  )}
                  {uploadedAt && <div>{uploadedAt}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 🔥 MODAL */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative inline-block">
            <button
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
              onClick={closePreview}
            >
              X
            </button>

            {previewType === "image" && (
              <img
                src={previewUrl}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded"
              />
            )}

            {previewType === "pdf" && (
              <iframe src={previewUrl} className="w-[80vw] h-[90vh] rounded" />
            )}
            {previewType === "video" && (
              <video
                src={previewUrl}
                controls
                autoPlay
                className="max-w-[90vw] max-h-[90vh] object-contain rounded"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default FilePreview;

export const TableFilePreview = ({ files }) => {
  const [preview, setPreview] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const fileArray = useMemo(() => {
    if (!files) return [];

    // Already Array
    if (Array.isArray(files)) {
      return files.map((file) => {
        if (typeof file === "string") {
          return {
            url: file,
            uploadedBy: "",
            uploadedAt: "",
          };
        }

        return {
          url: file?.url || "",
          uploadedBy: file?.uploadedBy || "",
          uploadedAt: file?.uploadedAt || "",
        };
      });
    }

    // Old comma separated string
    return String(files)
      .split(",")
      .map((url) => ({
        url: url.trim(),
        uploadedBy: "",
        uploadedAt: "",
      }))
      .filter((x) => x.url);
  }, [files]);

  const getType = (url) => {
    if (/\.pdf($|\?)/i.test(url)) return "pdf";
    if (/\.(mp4|mov|avi|mkv|webm|3gp|mpeg)($|\?)/i.test(url)) return "video";

    return "image";
  };

  const visibleFiles = showAll ? fileArray : fileArray.slice(0, 2);

  return (
    <>
      <div className="flex items-center gap-2 overflow-auto p-2 rounded-md">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {visibleFiles.map((file, index) => {
            const type = getType(file.url);

            if (type === "image") {
              return (
                <img
                  key={index}
                  src={file.url}
                  alt=""
                  onClick={() =>
                    setPreview({
                      ...file,
                      type,
                    })
                  }
                  className="w-10 h-10 rounded border bg-gray-100 object-cover cursor-pointer hover:scale-105 transition"
                />
              );
            }

            if (type === "pdf") {
              return (
                <div
                  key={index}
                  onClick={() =>
                    setPreview({
                      ...file,
                      type,
                    })
                  }
                  className="w-10 h-10 border rounded bg-gray-100 flex items-center justify-center cursor-pointer hover:scale-105 transition"
                >
                  <FileText size={20} className="text-red-600" />
                </div>
              );
            }

            return (
              <video
                key={index}
                src={file.url}
                muted
                onClick={() =>
                  setPreview({
                    ...file,
                    type,
                  })
                }
                className="w-10 h-10 rounded border bg-gray-100 object-cover cursor-pointer"
              />
            );
          })}
        </div>

        {fileArray.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 text-xs hover:underline"
          >
            {showAll ? "See Less" : `See More (${fileArray.length - 2})`}
          </button>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg p-4 max-w-[90vw] max-h-[90vh] overflow-visible">
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-4 -right-4 z-[9999] w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg  "
            >
              <X size={20} />
            </button>

            {(preview.uploadedBy || preview.uploadedAt) && (
              <div className="mb-4 text-sm border-b pb-3">
                {preview.uploadedBy && (
                  <div>
                    <strong>Uploaded By:</strong> {preview.uploadedBy}
                  </div>
                )}

                {preview.uploadedAt && (
                  <div>
                    <strong>Uploaded At:</strong>{" "}
                    {formatDateAndTime(preview.uploadedAt)}
                  </div>
                )}
              </div>
            )}

            {preview.type === "image" && (
              <img
                src={preview.url}
                alt=""
                className="max-w-[80vw] max-h-[75vh] object-contain rounded"
              />
            )}

            {preview.type === "video" && (
              <video
                src={preview.url}
                controls
                autoPlay
                className="max-w-[80vw] max-h-[75vh] object-contain rounded"
              />
            )}

            {preview.type === "pdf" && (
              <iframe
                src={preview.url}
                title="PDF Preview"
                className="w-[80vw] h-[80vh] rounded"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};


// import React, { useMemo, useEffect, useState } from "react";
// import { X, FileText } from "lucide-react";
// import { formatDateAndTime } from "../../utils/dateFormatter";
// import { useAuth } from "../../context/authContext";
// const FilePreview = ({
//   files,
//   existingFiles,
//   onRemoveNew,
//   onRemoveExisting,
// }) => {
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [previewType, setPreviewType] = useState(null);
//   const { user } = useAuth();
//   const isAdmin = user?.role?.toLowerCase() === "admin";
 
//   const selectedFiles = files ? Array.from(files) : [];

//   const existing = useMemo(() => {
//     if (!existingFiles) return [];

//     if (Array.isArray(existingFiles)) {
//       return existingFiles.map((file) => {
//         if (typeof file === "string") {
//           return {
//             url: file,
//             uploadedBy: "",
//             uploadedAt: "",
//             role: "",
//           };
//         }

//         return {
//           url: file?.url || "",
//           uploadedBy: file?.uploadedBy || "",
//           uploadedAt: file?.uploadedAt || "",
//           role: file?.role || "",
//         };
//       });
//     }

//     return String(existingFiles)
//       .split(",")
//       .map((url) => ({
//         url: url.trim(),
//         uploadedBy: "",
//         uploadedAt: "",
//         role: "",
//       }))
//       .filter((x) => x.url);
//   }, [existingFiles]);

//   // 🚀 SAFE PREVIEWS
//   const previews = useMemo(() => {
//     return selectedFiles.map((file) => {
//       const url =
//         file instanceof File
//           ? URL.createObjectURL(file)
//           : typeof file === "string"
//             ? file
//             : file.url;

//       const isPdf =
//         file.type === "application/pdf" ||
//         (typeof file === "string" && file.endsWith(".pdf"));

//       const isImage =
//         file.type?.startsWith("image/") ||
//         (typeof file === "string" && /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

//       const isVideo =
//         file.type?.startsWith("video/") ||
//         (typeof file === "string" &&
//           /\.(mp4|mov|avi|mkv|webm|3gp|mpeg)$/i.test(file));

//       return {
//         file,
//         url,
//         isImage,
//         isPdf,
//         isVideo,
//       };
//     });
//   }, [files]);

//   // 🚀 CLEANUP (FIXED)
//   useEffect(() => {
//     return () => {
//       selectedFiles.forEach((file) => {
//         if (file instanceof File) {
//           URL.revokeObjectURL(file);
//         }
//       });
//     };
//   }, [files]);

//   const openPreview = (url, type) => {
//     setPreviewUrl(url);
//     setPreviewType(type);
//   };

//   const closePreview = () => {
//     setPreviewUrl(null);
//     setPreviewType(null);
//   };

//   if (previews.length === 0 && existing.length === 0) return null;

//   return (
//     <>
//       <div className="flex flex-wrap gap-3 mt-3 items-start ">
//         {/* NEW FILES */}
//         {/* NEW FILES */}
//         {previews.map((item, index) => (
//           <div key={index} className="relative w-28 flex flex-col items-center">
//             {/* IMAGE */}
//             {item.isImage && (
//               <>
//                 <img
//                   src={item.url}
//                   alt="preview"
//                   onClick={() => openPreview(item.url, "image")}
//                   className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => onRemoveNew?.(index)}
//                   className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
//                 >
//                   <X size={14} />
//                 </button>
//               </>
//             )}

//             {/* PDF */}
//             {item.isPdf && (
//               <>
//                 <div
//                   onClick={() => openPreview(item.url, "pdf")}
//                   className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
//                 >
//                   <FileText size={28} className="text-red-500" />

//                   <span className="text-[10px] mt-1">PDF</span>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onRemoveNew?.(index);
//                   }}
//                   className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
//                 >
//                   <X size={14} />
//                 </button>
//               </>
//             )}

//             {/* VIDEO */}
//             {item.isVideo && (
//               <>
//                 <video
//                   src={item.url}
//                   muted
//                   onClick={() => openPreview(item.url, "video")}
//                   className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => onRemoveNew?.(index)}
//                   className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
//                 >
//                   <X size={14} />
//                 </button>
//               </>
//             )}

//             {/* New File Details */}
//             <div className="mt-2 text-center text-[10px] leading-4 text-blue-600 w-full">
//               <div className="font-semibold">New Attachment</div>

//               <div className="truncate w-full px-1">{item.file?.name}</div>
//             </div>
//           </div>
//         ))}

//         {/* EXISTING FILES */}
//         {/* EXISTING FILES */}
//         {existing.map((file, index) => {
//           const fileUrl = file.url;
//           const uploadedBy = file.uploadedBy;
//           const role = file.role;
//           const uploadedAt = formatDateAndTime(file.uploadedAt);

//           const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);
//           const isPdf = /\.pdf(\?|$)/i.test(fileUrl);
//           const isVideo = /\.(mp4|mov|avi|mkv|webm|3gp|mpeg)(\?|$)/i.test(
//             fileUrl,
//           );

//           return (
//             <div
//               key={index}
//               className="relative w-28 flex flex-col items-center"
//             >
//               {isImage && (
//                 <>
//                   <img
//                     src={fileUrl}
//                     alt="existing"
//                     onClick={() => openPreview(fileUrl, "image")}
//                     className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
//                   />
//                   {isAdmin && (
//                     <button
//                       type="button"
//                       onClick={() => onRemoveExisting?.(index)}
//                       className="absolute -top-2 -right-2 z-20 bg-black text-white rounded-full p-1 hover:bg-red-600"
//                     >
//                       <X size={14} />
//                     </button>
//                   )}
//                 </>
//               )}

//               {isPdf && (
//                 <>
//                   <div
//                     onClick={() => openPreview(fileUrl, "pdf")}
//                     className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
//                   >
//                     <FileText size={28} className="text-red-500" />

//                     <span className="text-[10px] mt-1">PDF</span>
//                   </div>
//                   {isAdmin && (
//                     <button
//                       type="button"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onRemoveExisting?.(index);
//                       }}
//                       className="absolute -top-2 -right-2 z-20 bg-black text-white rounded-full p-1 hover:bg-red-600"
//                     >
//                       <X size={14} />
//                     </button>
//                   )}
//                 </>
//               )}

//               {isVideo && (
//                 <>
//                   <video
//                     src={fileUrl}
//                     muted
//                     onClick={() => openPreview(fileUrl, "video")}
//                     className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
//                   />
//                   {isAdmin && (
//                     <button
//                       type="button"
//                       onClick={() => onRemoveExisting?.(index)}
//                       className="absolute -top-2 -right-2 z-20 bg-black text-white rounded-full p-1 hover:bg-red-600"
//                     >
//                       <X size={14} />
//                     </button>
//                   )}
//                 </>
//               )}

//               {(uploadedBy || uploadedAt) && (
//                 <div className="mt-2 text-center text-[10px] leading-4 text-gray-600 w-full">
//                   {uploadedBy && (
//                     <div className="font-semibold truncate">
//                       {uploadedBy} | {role}
//                     </div>
//                   )}
//                   {uploadedAt && <div>{uploadedAt}</div>}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* 🔥 MODAL */}
//       {previewUrl && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
//           <div className="relative inline-block">
//             <button
//               className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
//               onClick={closePreview}
//             >
//               X
//             </button>

//             {previewType === "image" && (
//               <img
//                 src={previewUrl}
//                 className="max-w-[90vw] max-h-[90vh] object-contain rounded"
//               />
//             )}

//             {previewType === "pdf" && (
//               <iframe src={previewUrl} className="w-[80vw] h-[90vh] rounded" />
//             )}
//             {previewType === "video" && (
//               <video
//                 src={previewUrl}
//                 controls
//                 autoPlay
//                 className="max-w-[90vw] max-h-[90vh] object-contain rounded"
//               />
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };
// export default FilePreview;

// export const TableFilePreview = ({ files }) => {
//   const [preview, setPreview] = useState(null);
//   const [showAll, setShowAll] = useState(false);

//   const fileArray = useMemo(() => {
//     if (!files) return [];

//     // Already Array
//     if (Array.isArray(files)) {
//       return files.map((file) => {
//         if (typeof file === "string") {
//           return {
//             url: file,
//             uploadedBy: "",
//             uploadedAt: "",
//           };
//         }

//         return {
//           url: file?.url || "",
//           uploadedBy: file?.uploadedBy || "",
//           uploadedAt: file?.uploadedAt || "",
//         };
//       });
//     }

//     // Old comma separated string
//     return String(files)
//       .split(",")
//       .map((url) => ({
//         url: url.trim(),
//         uploadedBy: "",
//         uploadedAt: "",
//       }))
//       .filter((x) => x.url);
//   }, [files]);

//   const getType = (url) => {
//     if (/\.pdf($|\?)/i.test(url)) return "pdf";
//     if (/\.(mp4|mov|avi|mkv|webm|3gp|mpeg)($|\?)/i.test(url)) return "video";

//     return "image";
//   };

//   const visibleFiles = showAll ? fileArray : fileArray.slice(0, 2);

//   return (
//     <>
//       <div className="flex items-center gap-2 overflow-auto p-2 rounded-md">
//         <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
//           {visibleFiles.map((file, index) => {
//             const type = getType(file.url);

//             if (type === "image") {
//               return (
//                 <img
//                   key={index}
//                   src={file.url}
//                   alt=""
//                   onClick={() =>
//                     setPreview({
//                       ...file,
//                       type,
//                     })
//                   }
//                   className="w-10 h-10 rounded border bg-gray-100 object-cover cursor-pointer hover:scale-105 transition"
//                 />
//               );
//             }

//             if (type === "pdf") {
//               return (
//                 <div
//                   key={index}
//                   onClick={() =>
//                     setPreview({
//                       ...file,
//                       type,
//                     })
//                   }
//                   className="w-10 h-10 border rounded bg-gray-100 flex items-center justify-center cursor-pointer hover:scale-105 transition"
//                 >
//                   <FileText size={20} className="text-red-600" />
//                 </div>
//               );
//             }

//             return (
//               <video
//                 key={index}
//                 src={file.url}
//                 muted
//                 onClick={() =>
//                   setPreview({
//                     ...file,
//                     type,
//                   })
//                 }
//                 className="w-10 h-10 rounded border bg-gray-100 object-cover cursor-pointer"
//               />
//             );
//           })}
//         </div>

//         {fileArray.length > 2 && (
//           <button
//             onClick={() => setShowAll(!showAll)}
//             className="text-blue-600 text-xs hover:underline"
//           >
//             {showAll ? "See Less" : `See More (${fileArray.length - 2})`}
//           </button>
//         )}
//       </div>

//       {preview && (
//         <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
//           <div className="relative bg-white rounded-lg p-4 max-w-[90vw] max-h-[90vh] overflow-visible">
//             <button
//               onClick={() => setPreview(null)}
//               className="absolute -top-4 -right-4 z-[9999] w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg  "
//             >
//               <X size={20} />
//             </button>

//             {(preview.uploadedBy || preview.uploadedAt) && (
//               <div className="mb-4 text-sm border-b pb-3">
//                 {preview.uploadedBy && (
//                   <div>
//                     <strong>Uploaded By:</strong> {preview.uploadedBy}
//                   </div>
//                 )}

//                 {preview.uploadedAt && (
//                   <div>
//                     <strong>Uploaded At:</strong>{" "}
//                     {formatDateAndTime(preview.uploadedAt)}
//                   </div>
//                 )}
//               </div>
//             )}

//             {preview.type === "image" && (
//               <img
//                 src={preview.url}
//                 alt=""
//                 className="max-w-[80vw] max-h-[75vh] object-contain rounded"
//               />
//             )}

//             {preview.type === "video" && (
//               <video
//                 src={preview.url}
//                 controls
//                 autoPlay
//                 className="max-w-[80vw] max-h-[75vh] object-contain rounded"
//               />
//             )}

//             {preview.type === "pdf" && (
//               <iframe
//                 src={preview.url}
//                 title="PDF Preview"
//                 className="w-[80vw] h-[80vh] rounded"
//               />
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };