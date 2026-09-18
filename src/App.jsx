import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
useEffect(() => {
  // Get all keys from localStorage
  const keys = Object.keys(localStorage);
  
  // Clear all keys except the agreement key
  keys.forEach(key => {
    if (key !== 'agreement_accepted') {
      localStorage.removeItem(key);
    }
  });
}, []);

  return <AppRoutes />
}

export default App;