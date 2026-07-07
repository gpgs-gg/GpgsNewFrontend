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




export const TableFilePreview = ({ files }) => {
    const [preview, setPreview] = useState(null);

    if (!files) return null;

    const urlArray = Array.isArray(files)
        ? files
        : files
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean);

    const getType = (url) => {
        if (/\.pdf$/i.test(url)) return "pdf";
        if (/\.(mp4|mov|avi|mkv|webm|3gp|mpeg)$/i.test(url)) return "video";
        return "image";
    };

    return (
        <>
            <div className="flex gap-2 justify-center">
                {urlArray.map((url, index) => {
                    const type = getType(url);

                    if (type === "image") {
                        return (
                            <img
                                key={index}
                                src={url}
                                alt=""
                                onClick={() => setPreview({ url, type })}
                                className="w-10 h-10 rounded-md border bg-gray-100 object-contain p-1 cursor-pointer hover:scale-105 transition"
                            />
                        );
                    }

                    if (type === "pdf") {
                        return (
                            <div
                                key={index}
                                onClick={() => setPreview({ url, type })}
                                className="w-10 h-10 border rounded-md bg-gray-100 flex items-center justify-center cursor-pointer hover:scale-105 transition"
                            >
                                <FileText size={22} className="text-red-600" />
                            </div>
                        );
                    }

                    return (
                        <video
                            key={index}
                            src={url}
                            className="w-10 h-10 rounded-md border bg-gray-100 object-contain p-1 cursor-pointer"
                            muted
                            onClick={() => setPreview({ url, type })}
                        />
                    );
                })}
            </div>

            {preview && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="relative inline-block">

                        <button
                            onClick={() => setPreview(null)}
                            className="absolute -top-3 -right-3 z-50 bg-red-500 text-white p-2 rounded-full"
                        >
                            <X size={18} />
                        </button>

                        {preview.type === "image" && (
                            <img
                                src={preview.url}
                                alt=""
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded"
                            />
                        )}

                        {preview.type === "video" && (
                            <video
                                src={preview.url}
                                controls
                                autoPlay
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded"
                            />
                        )}

                        {preview.type === "pdf" && (
                            <iframe
                                src={preview.url}
                                title="PDF Preview"
                                className="w-[80vw] h-[90vh] rounded"
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
};