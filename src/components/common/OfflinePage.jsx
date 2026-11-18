
import { WifiOff, RefreshCw, Wifi, Loader2 } from "lucide-react";

const OfflinePage = ({ networkStatus = "offline" }) => {
  const handleRetry = () => {
    window.location.reload();
  };

  const isOffline = networkStatus === "offline";
  const isSlow = networkStatus === "slow";
  const isChecking = networkStatus === "checking";

  const config = isOffline
    ? {
        icon: WifiOff,
        title: "No Internet Connection",
        description:
          "It looks like you're not connected to the internet. Please check your network connection and try again.",
        button: "Try Again",
      }
    : isSlow
    ? {
        icon: Wifi,
        title: "Slow Internet Connection",
        description:
          "Your internet connection is very slow. Some features may take longer to load. Please check your network.",
        button: "Retry Connection",
      }
    : {
        icon: Loader2,
        title: "Checking Connection...",
        description:
          "Please wait while we check your internet connection.",
        button: "Check Again",
      };

  const Icon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <Icon
            size={38}
            className={`text-gray-600 ${
              isChecking ? "animate-spin" : ""
            }`}
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {config.title}
        </h1>

        <p className="text-sm text-gray-500 leading-6 mb-7">
          {config.description}
        </p>

        <button
          onClick={handleRetry}
          disabled={isChecking}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-700 transition disabled:opacity-50"
        >
          <RefreshCw size={17} />
          {config.button}
        </button>

        <p className="mt-6 text-xs text-gray-400">
          GPGS Management System
        </p>
      </div>
    </div>
  );
};

export default OfflinePage;
