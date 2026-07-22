import { AlertTriangle, Loader2 } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  title = "Delete Item",
  message = "Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <h2 className="mt-4 text-center text-xl font-bold">{title}</h2>

          <p className="mt-2 text-center text-gray-500">{message}</p>

          <div className="mt-6 flex justify-center gap-3 cursor-pointer">
            <button
              onClick={onCancel}
              disabled={loading}
              className="rounded-lg border px-5 py-2 hover:bg-gray-100"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className="rounded-lg bg-red-600 px-5 cursor-pointer py-2 text-white hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;