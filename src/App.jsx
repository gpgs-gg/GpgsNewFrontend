import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
useEffect(() => {
  // Get all keys from localStorage
  const keys = Object.keys(localStorage);
  
  // Clear all keys except the agreement key
  keys.forEach(key => {
    if (key !== 'agreement_accepted_6a9c131a817a254c864ca445') {
      localStorage.removeItem(key);
    }
  });
}, []);
  return <AppRoutes />
}

export default App;