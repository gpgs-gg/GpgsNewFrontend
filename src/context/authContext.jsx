import { createContext, useContext } from "react";
import { useCurrentUser } from "../auth/services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const {
    data,
    isLoading,
    refetch,
  } = useCurrentUser();

  const user = data?.user || null;

  const value = {
    loading: isLoading,
    isAuthenticated: !!user,
    user,
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