import React, { useMemo, useEffect, useState } from "react";
import { X, FileText } from "lucide-react";

const FilePreview = ({
    files,
    existingFiles,
    onRemoveNew,
    onRemoveExisting,
}) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [previewType, setPreviewType] = useState(null);

    const selectedFiles = files ? Array.from(files) : [];

    const existing = Array.isArray(existingFiles)
        ? existingFiles
        : existingFiles
            ? [existingFiles]
            : [];

    // 🚀 SAFE PREVIEWS
    const previews = useMemo(() => {
        return selectedFiles.map((file) => {
            const url =
                file instanceof File
                    ? URL.createObjectURL(file)
                    : file; // safety fallback

            const isPdf =
                file.type === "application/pdf" ||
                (typeof file === "string" && file.endsWith(".pdf"));

            const isImage =
                file.type?.startsWith("image/") ||
                (typeof file === "string" &&
                    /\.(jpg|jpeg|png|webp|gif)$/i.test(file));

            return {
                file,
                url,
                isImage,
                isPdf,
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
                {previews.map((item, index) => (
                    <div key={index} className="relative w-24 h-24 shrink-0">

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

                        {item.isPdf && (
                            <div
                                onClick={() => openPreview(item.url, "pdf")}
                                className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
                            >
                                <FileText size={28} className="text-red-500" />
                                <span className="text-[10px] text-center mt-1">
                                    PDF
                                </span>

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
                            </div>
                        )}
                    </div>
                ))}

                {/* EXISTING FILES */}
                {existing.map((url, index) => {
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                    const isPdf = /\.pdf$/i.test(url);

                    return (
                        <div key={index} className="relative w-24 h-24 shrink-0">

                            {isImage && (
                                <>
                                    <img
                                        src={url}
                                        alt="existing"
                                        onClick={() => openPreview(url, "image")}
                                        className="w-24 h-24 object-cover rounded-lg border cursor-pointer"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => onRemoveExisting?.(index)}
                                        className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>
                                </>
                            )}

                            {isPdf && (
                                <div className="relative w-24 h-24">

                                    <div
                                        onClick={() => openPreview(url, "pdf")}
                                        className="w-24 h-24 border rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer"
                                    >
                                        <FileText size={28} className="text-red-500" />
                                        <span className="text-[10px] text-center mt-1">
                                            PDF
                                        </span>
                                    </div>

                                    {/* ✅ CROSS BUTTON ADDED */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveExisting?.(index);
                                        }}
                                        className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={14} />
                                    </button>

                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 🔥 MODAL */}
            {previewUrl && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white w-[90%] h-[90%] rounded-lg relative">

                        <button
                            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
                            onClick={closePreview}
                        >
                            X
                        </button>

                        {previewType === "image" && (
                            <img
                                src={previewUrl}
                                className="w-full h-full object-contain"
                            />
                        )}

                        {previewType === "pdf" && (
                            <iframe
                                src={previewUrl}
                                className="w-full h-full"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default FilePreview;