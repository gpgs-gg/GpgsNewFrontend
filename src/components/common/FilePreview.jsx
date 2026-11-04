import React, { useMemo, useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import { formatDateAndTime } from "../../utils/dateFormatter";
import { useAuth } from "../../context/authContext";
import { Play, Image as ImageIcon, File as FileIcon } from "lucide-react";

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
            thumbnailUrl: "",
            uploadedBy: "",
            uploadedAt: "",
            role: "",
            type: "",
          };
        }

        return {
          url: file?.url || file?.secure_url || file?.path || "",
          thumbnailUrl:
            file?.thumbnailUrl || file?.thumbnail || file?.thumb || "",
          uploadedBy: file?.uploadedBy || "",
          uploadedAt: file?.uploadedAt || "",
          role: file?.role || "",
          type: file?.type || file?.mimetype || file?.mimeType || "",
        };
      });
    }

    return String(existingFiles)
      .split(",")
      .map((url) => ({
        url: url.trim(),
        thumbnailUrl: "",
        uploadedBy: "",
        uploadedAt: "",
        role: "",
        type: "",
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
        const thumbnailUrl = file.thumbnailUrl;
          const uploadedBy = file.uploadedBy;
          const role = file.role;
          const uploadedAt = formatDateAndTime(file.uploadedAt);

          const lowerUrl = fileUrl.split("?")[0].toLowerCase();

          const isImage =
            file.type?.startsWith("image/") ||
            /\.(jpg|jpeg|png|gif|webp|bmp|avif|svg)$/i.test(lowerUrl);

          const isPdf = file.type?.includes("pdf") || /\.pdf$/i.test(lowerUrl);

          const isVideo =
            file.type?.startsWith("video/") ||
            /\.(mp4|mov|avi|mkv|webm|3gp|mpeg|mpg|m4v)$/i.test(lowerUrl);
          return (
            <div
              key={index}
              className="relative w-28 flex flex-col items-center"
            >
              {isImage && (
                <>
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Image thumbnail"
                      loading="lazy"
                      decoding="async"
                      onClick={() => openPreview(fileUrl, "image")}
                      className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                    />
                  ) : (
                    <div
                      onClick={() => openPreview(fileUrl, "image")}
                      className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
                    >
                      <ImageIcon size={28} className="text-gray-500" />
                      <span className="text-[10px] mt-1">IMAGE</span>
                    </div>
                  )}

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
                  <div
                    onClick={() => openPreview(fileUrl, "video")}
                    className="relative w-24 h-24 rounded-lg border overflow-hidden cursor-pointer bg-gray-50"
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt="Video thumbnail"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <Play size={24} className="text-blue-600" />
                        <span className="text-[10px] text-gray-500">VIDEO</span>
                      </div>
                    )}

                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play size={24} fill="white" className="text-white" />
                    </span>
                  </div>

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

  // Normalize attachments while retaining thumbnail and upload details
  const fileArray = useMemo(() => {
    if (!files) return [];

    const attachments = Array.isArray(files)
      ? files
      : typeof files === "string"
        ? files.split(",")
        : [];

    return attachments
      .map((file) => {
        if (typeof file === "string") {
          return {
            url: file.trim(),
            thumbnailUrl: "",
            type: "",
            uploadedBy: "",
            uploadedAt: "",
          };
        }

        return {
          url:
            file?.url || file?.secure_url || file?.path || file?.location || "",
          thumbnailUrl:
            file?.thumbnailUrl || file?.thumbnail || file?.thumb || "",
          type:
            file?.mimetype ||
            file?.mimeType ||
            file?.type ||
            file?.resource_type ||
            "",
          uploadedBy: file?.uploadedBy || "",
          uploadedAt: file?.uploadedAt || "",
        };
      })
      .filter((file) => file.url);
  }, [files]);

  const getType = (file) => {
    const url = file.url.split("?")[0].toLowerCase();
    const mime = file.type.toLowerCase();

    if (mime.includes("pdf") || /\.pdf$/i.test(url)) return "pdf";

    if (
      mime.startsWith("video/") ||
      /\.(mp4|mov|avi|mkv|webm|3gp|mpeg|m4v|ogg)$/i.test(url)
    ) {
      return "video";
    }

    if (
      mime.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|bmp|avif|svg)$/i.test(url)
    ) {
      return "image";
    }

    return "file";
  };

  const visibleFiles = showAll ? fileArray : fileArray.slice(0, 2);

  if (!fileArray.length) return null;

  return (
    <>
      <div className="flex items-center gap-2 p-1">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {visibleFiles.map((file, index) => {
          
            const type = getType(file);
                  
            return (
              <button
                key={`${file.url}-${index}`}
                type="button"
                onClick={() =>
                  setPreview({
                    ...file,
                    type,
                  })
                }
                title="Click to preview attachment"
                className="group relative w-12 h-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 hover:border-gray-500 hover:shadow-md transition-all flex items-center justify-center"
              >
                {type === "image" ? (
                  file.thumbnailUrl ? (
                    <img
                      src={file.thumbnailUrl}
                      alt="Image thumbnail"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <ImageIcon size={21} className="text-gray-500" />
                      <span className="text-[8px] text-gray-500">IMAGE</span>
                    </div>
                  )
                ) : type === "video" ? (
                  <>
                    {file.thumbnailUrl ? (
                      <img
                        src={file.thumbnailUrl}
                        alt="Video thumbnail"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <Play size={21} className="text-blue-600" />
                        <span className="text-[8px] text-gray-500">VIDEO</span>
                      </div>
                    )}

                    <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play size={16} fill="white" className="text-white" />
                    </span>
                  </>
                ) : type === "pdf" ? (
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <FileText size={22} className="text-red-600" />
                    <span className="text-[8px] font-semibold text-red-600">
                      PDF
                    </span>
                  </div>
                ) : (
                  <File size={22} className="text-gray-500" />
                )}

                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            );
          })}
        </div>

        {fileArray.length > 2 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="shrink-0 text-blue-600 text-xs font-medium hover:underline"
          >
            {showAll ? "See Less" : `+${fileArray.length - 2} More`}
          </button>
        )}
      </div>

      {/* ORIGINAL FILE PREVIEW */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-3 sm:p-5"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative bg-white rounded-xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b">
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-800">
                  Attachment Preview
                </h3>
                {(preview.uploadedBy || preview.uploadedAt) && (
                  <div className="text-xs text-gray-500 mt-1">
                    {preview.uploadedBy && (
                      <span>Uploaded by: {preview.uploadedBy}</span>
                    )}
                    {preview.uploadedBy && preview.uploadedAt && " • "}
                    {preview.uploadedAt && (
                      <span>{formatDateAndTime(preview.uploadedAt)}</span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreview(null)}
                className="shrink-0 p-2 rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 sm:p-4 flex items-center justify-center overflow-auto max-h-[80vh]">
              {preview.type === "image" && (
                <img
                  src={preview.url}
                  alt="Attachment preview"
                  className="max-w-full max-h-[75vh] object-contain rounded-lg"
                />
              )}

              {preview.type === "video" && (
                <video
                  src={preview.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-[75vh] rounded-lg"
                />
              )}

              {preview.type === "pdf" && (
                <iframe
                  src={preview.url}
                  title="PDF Preview"
                  className="w-full h-[75vh] rounded-lg"
                />
              )}

              {preview.type === "file" && (
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Open Attachment
                </a>
              )}
            </div>
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
//   isCompressing,
//   compressionProgress,
//   compressionFileName,
// }) => {
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [previewType, setPreviewType] = useState(null);
//   const [loadingImages, setLoadingImages] = useState({});
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
//       let url = "";
//       let type = "";
//       let fileName = "";

//       if (file instanceof File || file instanceof Blob) {
//         url = URL.createObjectURL(file);
//         type = file.type || "";
//         fileName = file.name || "";
//       } else if (typeof file === "string") {
//         url = file;
//         fileName = file;
//       } else if (file) {
//         url = file.url || "";
//         type = file.type || "";
//         fileName = file.name || file.url || "";
//       }

//       const lowerUrl = url.toLowerCase().split("?")[0];
//       const lowerName = fileName.toLowerCase().split("?")[0];

//       const isImage =
//         type.startsWith("image/") ||
//         /\.(jpg|jpeg|png|webp|gif|bmp|svg|heic|heif)$/i.test(lowerName) ||
//         /\.(jpg|jpeg|png|webp|gif|bmp|svg|heic|heif)$/i.test(lowerUrl);

//       const isPdf =
//         type === "application/pdf" ||
//         /\.pdf$/i.test(lowerName) ||
//         /\.pdf$/i.test(lowerUrl);

//       const isVideo =
//         type.startsWith("video/") ||
//         /\.(mp4|mov|avi|mkv|webm|3gp|mpeg|mpg)$/i.test(lowerName) ||
//         /\.(mp4|mov|avi|mkv|webm|3gp|mpeg|mpg)$/i.test(lowerUrl);

//       return {
//         file,
//         url,
//         type,
//         fileName,
//         isImage,
//         isPdf,
//         isVideo,
//       };
//     });
//   }, [files]);

//   // Cleanup ONLY the object URLs created above
//   useEffect(() => {
//     return () => {
//       previews.forEach((item) => {
//         if (item.file instanceof File || item.file instanceof Blob) {
//           URL.revokeObjectURL(item.url);
//         }
//       });
//     };
//   }, [previews]);

//   // {
//   //   previews.map((item, index) => (
//   //     <div
//   //       key={`${item.url}-${index}`}
//   //       className="relative w-28 flex flex-col items-center"
//   //     >
//   //       {/* IMAGE */}
//   //       {item.isImage && (
//   //         <>
//   //           <div className="relative w-24 h-24">
//   //             {loadingImages[index] && (
//   //               <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100 rounded-lg border">
//   //                 <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
//   //               </div>
//   //             )}

//   //             <img
//   //               src={item.url}
//   //               alt="preview"
//   //               onLoad={() =>
//   //                 setLoadingImages((prev) => ({
//   //                   ...prev,
//   //                   [index]: false,
//   //                 }))
//   //               }
//   //               onLoadStart={() =>
//   //                 setLoadingImages((prev) => ({
//   //                   ...prev,
//   //                   [index]: true,
//   //                 }))
//   //               }
//   //               onClick={() => openPreview(item.url, "image")}
//   //               className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
//   //             />
//   //           </div>

//   //           <button
//   //             type="button"
//   //             onClick={() => onRemoveNew?.(index)}
//   //             className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
//   //           >
//   //             <X size={14} />
//   //           </button>
//   //         </>
//   //       )}
//   //       {/* PDF */}
//   //       {item.isPdf && (
//   //         <>
//   //           <div
//   //             onClick={() => openPreview(item.url, "pdf")}
//   //             className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
//   //           >
//   //             <FileText size={28} className="text-red-500" />
//   //             <span className="text-[10px] mt-1">PDF</span>
//   //           </div>

//   //           <button
//   //             type="button"
//   //             onClick={(e) => {
//   //               e.stopPropagation();
//   //               onRemoveNew?.(index);
//   //             }}
//   //             className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
//   //           >
//   //             <X size={14} />
//   //           </button>
//   //         </>
//   //       )}

//   //       {/* VIDEO */}
//   //       {item.isVideo && (
//   //         <>
//   //           <video
//   //             src={item.url}
//   //             muted
//   //             playsInline
//   //             onClick={() => openPreview(item.url, "video")}
//   //             className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
//   //           />

//   //           <button
//   //             type="button"
//   //             onClick={() => onRemoveNew?.(index)}
//   //             className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
//   //           >
//   //             <X size={14} />
//   //           </button>
//   //         </>
//   //       )}

//   //       <div className="mt-2 text-center text-[10px] leading-4 text-blue-600 w-full">
//   //         <div className="font-semibold">New Attachment</div>

//   //         <div className="truncate w-full px-1">
//   //           {item.fileName || "Attachment"}
//   //         </div>
//   //       </div>
//   //     </div>
//   //   ));
//   // }

//   const openPreview = (url, type) => {
//     setPreviewUrl(url);
//     setPreviewType(type);
//   };

//   const closePreview = () => {
//     setPreviewUrl(null);
//     setPreviewType(null);
//   };

//   if (previews.length === 0 && existing.length === 0 && !isCompressing) {
//     return null;
//   }

//   return (
//     <>
//       <div className="flex flex-wrap gap-3 mt-3 items-start">
//         {/* {isCompressing && (
//           <div className="relative w-28 flex flex-col items-center">
//             <div className="w-24 h-24 border rounded-lg bg-gray-100 flex items-center justify-center">
//               <div className="flex flex-col items-center gap-2">
//                 <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />

//                 <span className="text-[10px] text-blue-600 font-medium">
//                   Processing...
//                 </span>
//               </div>
//             </div>

//             <div className="mt-2 text-center text-[10px] leading-4 text-blue-600 w-full">
//               <div className="font-semibold">Compressing</div>
//               <div className="truncate w-full px-1">Please wait...</div>
//             </div>
//           </div>
//         )} */}

//         {isCompressing && (
//           <div className="relative w-28 flex flex-col items-center">
//             <div className="w-24 h-24 border rounded-lg bg-gray-100 flex items-center justify-center">
//               <div className="flex flex-col items-center gap-2 w-full px-2">
//                 {/* Circular Loader */}
//                 <div className="relative w-12 h-12">
//                   <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
//                     {/* Background */}
//                     <path
//                       d="M18 2.0845
//                 a 15.9155 15.9155 0 0 1 0 31.831
//                 a 15.9155 15.9155 0 0 1 0 -31.831"
//                       fill="none"
//                       stroke="#e5e7eb"
//                       strokeWidth="3"
//                     />

//                     {/* Progress */}
//                     <path
//                       d="M18 2.0845
//                 a 15.9155 15.9155 0 0 1 0 31.831
//                 a 15.9155 15.9155 0 0 1 0 -31.831"
//                       fill="none"
//                       stroke="#2563eb"
//                       strokeWidth="3"
//                       strokeLinecap="round"
//                       strokeDasharray={`${compressionProgress}, 100`}
//                     />
//                   </svg>

//                   {/* Percentage */}
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <span className="text-[11px] font-bold text-blue-600">
//                       {compressionProgress}%
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-2 text-center text-[10px] leading-4 text-blue-600 w-full">
//               <div className="font-semibold">Compressing</div>

//               <div className="truncate w-full px-1" title={compressionFileName}>
//                 {compressionFileName || "Please wait..."}
//               </div>
//             </div>
//           </div>
//         )}
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

