import React, { useMemo, useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import { formatDateAndTime } from "../../utils/dateFormatter";

const FilePreview = ({
    files,
    existingFiles,
    onRemoveNew,
    onRemoveExisting,
}) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState(null);

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
                    };
                }

                return {
                    url: file?.url || "",
                    uploadedBy: file?.uploadedBy || "",
                    uploadedAt: file?.uploadedAt || "",
                };
            });
        }

        return String(existingFiles)
            .split(",")
            .map((url) => ({
                url: url.trim(),
                uploadedBy: "",
                uploadedAt: "",
            }))
            .filter((x) => x.url);
    }, [existingFiles]);

    // 🚀 SAFE PREVIEWS
    const previews = useMemo(() => {
        return selectedFiles.map((file) => {
            const url =
                file instanceof File
                    ? URL.createObjectURL(file)
                    : typeof file === "string"
                        ? file
                        : file.url;

            const isPdf =
                file.type === "application/pdf" ||
                (typeof file === "string" && file.endsWith(".pdf"));

            const isImage =
                file.type?.startsWith("image/") ||
                (typeof file === "string" &&
                    /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

            const isVideo =
                file.type?.startsWith("video/") ||
                (typeof file === "string" &&
                    /\.(mp4|mov|avi|mkv|webm|3gp|mpeg)$/i.test(file));

            return {
                file,
                url,
                isImage,
                isPdf,
                isVideo
            };
        });
    }, [files]);

    // 🚀 CLEANUP (FIXED)
    useEffect(() => {
        return () => {
            selectedFiles.forEach((file) => {
                if (file instanceof File) {
                    URL.revokeObjectURL(file);
                }
            });
        };
    }, [files]);

    const openPreview = (url, type) => {
        setPreviewUrl(url);
        setPreviewType(type);
    };

    const closePreview = () => {
        setPreviewUrl(null);
        setPreviewType(null);
    };

    if (previews.length === 0 && existing.length === 0) return null;

    return (
        <>
            <div className="flex flex-wrap gap-3 mt-3 items-start">

                {/* NEW FILES */}
                {/* NEW FILES */}
                {previews.map((item, index) => (
                    <div
                        key={index}
                        className="relative w-28 flex flex-col items-center"
                    >

                        {/* IMAGE */}
                        {item.isImage && (
                            <>
                                <img
                                    src={item.url}
                                    alt="preview"
                                    onClick={() =>
                                        openPreview(item.url, "image")
                                    }
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
                                    onClick={() =>
                                        openPreview(item.url, "pdf")
                                    }
                                    className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
                                >
                                    <FileText
                                        size={28}
                                        className="text-red-500"
                                    />

                                    <span className="text-[10px] mt-1">
                                        PDF
                                    </span>
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
                                    onClick={() =>
                                        openPreview(item.url, "video")
                                    }
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
                            <div className="font-semibold">
                                New Attachment
                            </div>

                            <div className="truncate w-full px-1">
                                {item.file?.name}
                            </div>
                        </div>

                    </div>
                ))}

                {/* EXISTING FILES */}
                {/* EXISTING FILES */}
                {existing.map((file, index) => {
                    const fileUrl = file.url;
                    const uploadedBy = file.uploadedBy;
                    const uploadedAt = formatDateAndTime(file.uploadedAt);

                    const isImage = /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(fileUrl);
                    const isPdf = /\.pdf(\?|$)/i.test(fileUrl);
                    const isVideo =
                        /\.(mp4|mov|avi|mkv|webm|3gp|mpeg)(\?|$)/i.test(fileUrl);

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
                                        onClick={() =>
                                            openPreview(fileUrl, "image")
                                        }
                                        className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onRemoveExisting?.(index)
                                        }
                                        className="absolute -top-2 -right-2 z-20 bg-black text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            )}

                            {isPdf && (
                                <>
                                    <div
                                        onClick={() =>
                                            openPreview(fileUrl, "pdf")
                                        }
                                        className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
                                    >
                                        <FileText
                                            size={28}
                                            className="text-red-500"
                                        />

                                        <span className="text-[10px] mt-1">
                                            PDF
                                        </span>
                                    </div>

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
                                </>
                            )}

                            {isVideo && (
                                <>
                                    <video
                                        src={fileUrl}
                                        muted
                                        onClick={() =>
                                            openPreview(fileUrl, "video")
                                        }
                                        className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onRemoveExisting?.(index)
                                        }
                                        className="absolute -top-2 -right-2 z-20 bg-black text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            )}

                            {(uploadedBy || uploadedAt) && (
                                <div className="mt-2 text-center text-[10px] leading-4 text-gray-600 w-full">
                                    {uploadedBy && (
                                        <div className="font-semibold truncate">
                                            {uploadedBy}
                                        </div>
                                    )}

                                    {uploadedAt && (
                                        <div>
                                            {uploadedAt}
                                        </div>
                                    )}
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
                            <iframe
                                src={previewUrl}
                                className="w-[80vw] h-[90vh] rounded"
                            />
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
        if (/\.(mp4|mov|avi|mkv|webm|3gp|mpeg)($|\?)/i.test(url))
            return "video";

        return "image";
    };

    const visibleFiles = showAll
        ? fileArray
        : fileArray.slice(0, 2);

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
                                    <FileText
                                        size={20}
                                        className="text-red-600"
                                    />
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
                        {showAll
                            ? "See Less"
                            : `See More (${fileArray.length - 2})`}
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
                                        <strong>Uploaded By:</strong>{" "}
                                        {preview.uploadedBy}
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