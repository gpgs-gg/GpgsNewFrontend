// import { useEffect, useState } from "react";

// const useNetworkStatus = () => {
//   const [isOnline, setIsOnline] = useState(() => navigator.onLine);

//   useEffect(() => {
//     let isChecking = false;
//     let isMounted = true;
//     let controller = null;

//     const checkInternet = async () => {
//       if (!navigator.onLine) {
//         if (isMounted) setIsOnline(false);
//         return;
//       }

//       if (isChecking) return;

//       isChecking = true;
//       controller = new AbortController();

//       const timeout = setTimeout(() => {
//         controller?.abort();
//       }, 4000);

//       try {
//         await fetch("https://www.gstatic.com/generate_204", {
//           method: "GET",
//           mode: "no-cors",
//           cache: "no-store",
//           signal: controller.signal,
//         });

//         if (isMounted) {
//           setIsOnline(true);
//         }
//       } catch (error) {
//         if (isMounted) {
//           setIsOnline(false);
//         }
//       } finally {
//         clearTimeout(timeout);
//         isChecking = false;
//         controller = null;
//       }
//     };

//     const handleOnline = () => {
//       checkInternet();
//     };

//     const handleOffline = () => {
//       setIsOnline(false);
//       controller?.abort();
//     };

//     window.addEventListener("online", handleOnline);
//     window.addEventListener("offline", handleOffline);

//     // Check immediately when application starts
//     checkInternet();

//     // Recheck internet every 5 seconds
//     const interval = setInterval(checkInternet, 5000);

//     return () => {
//       isMounted = false;
//       clearInterval(interval);
//       clearTimeout(timeout);
//       controller?.abort();

//       window.removeEventListener("online", handleOnline);
//       window.removeEventListener("offline", handleOffline);
//     };
//   }, []);

//   return isOnline;
// };

// export default useNetworkStatus;


import { useEffect, useState } from "react";

const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState("checking");

  useEffect(() => {
    let isChecking = false;
    let isMounted = true;
    let controller = null;

    const checkInternet = async () => {
      if (!navigator.onLine) {
        if (isMounted) setNetworkStatus("offline");
        return;
      }

      if (isChecking) return;

      isChecking = true;
      controller = new AbortController();

      const timeout = setTimeout(() => {
        controller?.abort();
      }, 4000);

      try {
        const startTime = Date.now();

        await fetch("https://www.gstatic.com/generate_204", {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        });

        const responseTime = Date.now() - startTime;

        if (isMounted) {
          setNetworkStatus(
            responseTime > 2000 ? "slow" : "online"
          );
        }
      } catch (error) {
        if (isMounted) {
          setNetworkStatus(
            navigator.onLine ? "slow" : "offline"
          );
        }
      } finally {
        clearTimeout(timeout);
        isChecking = false;
        controller = null;
      }
    };

    const handleOnline = () => checkInternet();

    const handleOffline = () => {
      setNetworkStatus("offline");
      controller?.abort();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    checkInternet();

    const interval = setInterval(checkInternet, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(timeout);
      controller?.abort();

      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return networkStatus;
};

export default useNetworkStatus;
