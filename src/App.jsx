import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes";

function App() {
  useEffect(() => {
    localStorage.clear();
  }, []);
  return <AppRoutes />;
}

export default App;