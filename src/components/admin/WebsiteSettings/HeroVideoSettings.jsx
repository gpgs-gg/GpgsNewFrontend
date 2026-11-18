import React, { useEffect, useRef, useState } from "react";
import { Upload, Video, RefreshCw, CheckCircle, Clock, X } from "lucide-react";

import { toast } from "react-toastify";

import {
  useHeroVideo,
  useUpdateHeroVideo,
} from "../services/index.js";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const HeroVideoSettings = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fileRef = useRef(null);

  // =====================================
  // REACT QUERY - FETCH HERO VIDEO
  // =====================================

  const {
    data: heroVideoData,
    isLoading: loading,
    isError,
    error,
  } = useHeroVideo();

  // =====================================
  // REACT QUERY - UPDATE HERO VIDEO
  // =====================================

  const updateMutation = useUpdateHeroVideo();

  const currentVideo = heroVideoData?.videoUrl || "";
  const updatedAt = heroVideoData?.updatedAt || null;
  const uploading = updateMutation.isPending;

  // =====================================
  // FETCH ERROR
  // =====================================

  useEffect(() => {
    if (isError) {
      toast.error(
        error?.response?.data?.message || "Unable to load current hero video.",
      );
    }
  }, [isError, error]);

  // =====================================
  // SELECT VIDEO
  // =====================================

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.type !== "video/mp4") {
      toast.error("Only MP4 videos are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      toast.error("Maximum video size is 100 MB.");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
  };

  // =====================================
  // UPLOAD / REPLACE VIDEO
  // =====================================

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a video first.");
      return;
    }

    try {
      const data = await updateMutation.mutateAsync(selectedFile);

      if (data.success) {
        setSelectedFile(null);
        setPreviewUrl("");

        if (fileRef.current) {
          fileRef.current.value = "";
        }

        toast.success("Hero video updated successfully!");
      }
    } catch (error) {
      console.error("Hero Video Upload Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to upload hero video.",
      );
    }
  };

  // =====================================
  // REMOVE SELECTED VIDEO
  // =====================================

  const handleRemoveSelected = () => {
    setSelectedFile(null);
    setPreviewUrl("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // =====================================
  // CLEANUP PREVIEW URL
  // =====================================

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <RefreshCw className="animate-spin text-gray-500" />
      </div>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Hero Video Settings
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage the background video displayed on your website homepage.
        </p>
      </div>

      {/* CURRENT VIDEO */}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-800">Current Hero Video</h3>

            <p className="text-sm text-gray-500">
              Video currently displayed on homepage
            </p>
          </div>

          {currentVideo && (
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <CheckCircle size={14} />
              Active
            </span>
          )}
        </div>

        {currentVideo ? (
          <video
            key={currentVideo}
            src={currentVideo}
            controls
            playsInline
            className="max-h-[350px] w-full rounded-lg bg-black object-contain"
          />
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg bg-gray-100 text-gray-400">
            <Video size={36} />
            <p className="mt-2 text-sm">No hero video uploaded yet.</p>
          </div>
        )}

        {updatedAt && (
          <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <Clock size={14} />
            Last updated: {new Date(updatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* UPLOAD SECTION */}

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="font-semibold text-gray-800">Upload New Video</h3>

        <p className="mt-1 text-sm text-gray-500">
          Uploading a new video will replace the existing homepage background
          video.
        </p>

        {/* FILE INPUT */}

        <div
          onClick={() => {
            if (!uploading) fileRef.current?.click();
          }}
          className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center transition hover:border-gray-500 hover:bg-gray-100"
        >
          <Upload size={35} className="text-gray-500" />

          <p className="mt-3 font-medium text-gray-700">
            Click to upload MP4 video
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Maximum file size: 100 MB
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,.mp4"
            className="hidden"
            disabled={uploading}
            onChange={handleVideoChange}
          />
        </div>

        {/* SELECTED FILE */}

        {selectedFile && (
          <div className="mt-5 rounded-lg border border-gray-200 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">
                  {selectedFile.name}
                </p>

                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              <button
                type="button"
                disabled={uploading}
                onClick={handleRemoveSelected}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* PREVIEW */}

            <video
              src={previewUrl}
              controls
              playsInline
              className="max-h-[300px] w-full rounded-lg bg-black object-contain"
            />
          </div>
        )}

        {/* UPLOAD BUTTON */}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            disabled={!selectedFile || uploading}
            onClick={handleUpload}
            className="flex items-center gap-2 rounded-lg bg-[#1c1714] px-6 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                {currentVideo ? "Replace Hero Video" : "Upload Hero Video"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroVideoSettings;