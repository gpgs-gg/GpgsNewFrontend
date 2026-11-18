

import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";
import OfflinePage from "./components/common/OfflinePage";
import useNetworkStatus from "./components/hooks/useNetworkStatus";

function App() {
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);

    // Clear all keys except the agreement key
    keys.forEach((key) => {
      if (key !== "agreement_accepted") {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Internet completely disconnected
  if (networkStatus === "offline") {
    return <OfflinePage networkStatus="offline" />;
  }

  // Internet is very slow
  if (networkStatus === "slow") {
    return <OfflinePage networkStatus="slow" />;
  }

  // Show application while checking or online
  return <AppRoutes />;
}

export default App;

// import { useEffect } from "react";
// import AppRoutes from "./routes/AppRoutes";

// function App() {
// useEffect(() => {
//   // Get all keys from localStorage
//   const keys = Object.keys(localStorage);
  
//   // Clear all keys except the agreement key
//   keys.forEach(key => {
//     if (key !== 'agreement_accepted') {
//       localStorage.removeItem(key);
//     }
//   });
// }, []);

//   return <AppRoutes />
// }

// export default App;