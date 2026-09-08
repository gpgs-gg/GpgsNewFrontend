import React, { useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";

const PaymentScreenshotModal = ({
  isOpen,
  onClose,
  booking,
  onConfirm,
}) => {
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only images
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image.");
      return;
    }

    setPaymentScreenshot(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setPaymentScreenshot(null);
    setPreview(null);
    onClose();
  };

  const handleConfirm = async () => {
    if (!paymentScreenshot) {
      alert("Please upload payment screenshot first.");
      return;
    }

    try {
      setLoading(true);

      // Parent component ko file + booking bhejenge
      await onConfirm({
        booking,
        paymentScreenshot,
      });

      setPaymentScreenshot(null);
      setPreview(null);
    } catch (error) {
      console.error("Payment screenshot error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Payment Screenshot
            </h2>

            {booking && (
              <p className="mt-1 text-sm text-gray-500">
                {booking.name || booking.clientName || "Booking"}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">

          <div className="mb-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-700">
            Please upload the payment screenshot to mark this booking as
            <strong> Booked</strong>.
          </div>

          {/* Upload */}
          {!preview ? (
            <label
              htmlFor="payment-screenshot"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-5 py-10 transition hover:border-green-500 hover:bg-green-50"
            >
              <Upload
                size={35}
                className="mb-3 text-gray-400"
              />

              <p className="font-medium text-gray-700">
                Upload Payment Screenshot
              </p>

              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG or JPEG
              </p>

              <input
                id="payment-screenshot"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="relative overflow-hidden rounded-xl border">

              <img
                src={preview}
                alt="Payment Screenshot"
                className="max-h-80 w-full object-contain"
              />

              <button
                type="button"
                onClick={() => {
                  setPaymentScreenshot(null);
                  setPreview(null);
                }}
                disabled={loading}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Selected file */}
          {paymentScreenshot && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
              <ImageIcon
                size={18}
                className="text-green-600"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-700">
                  {paymentScreenshot.name}
                </p>

                <p className="text-xs text-gray-500">
                  {(paymentScreenshot.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-5 flex justify-end gap-3">

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!paymentScreenshot || loading}
              className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreenshotModal;