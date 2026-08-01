import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCurrentUser } from "../auth/services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const {
    data,
    isLoading,
    refetch,
  } = useCurrentUser();

  const [user, setUser] = useState(null);

  // Query se state sync karo
  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  }, [data]);

  const value = {
    loading: isLoading,
    isAuthenticated: !!user,
    user,
    setUser,
    refetchUser: refetch,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};