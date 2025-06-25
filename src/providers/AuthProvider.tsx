import React from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useAuthState } from "@/hooks/useAuthState";
import { useAuthMethods } from "@/hooks/useAuthMethods";

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading
  } = useAuthState();

  const {
    login,
    register,
    logout,
    addOrder,
    addShippingAddress,
    updateUserProfile,
    deleteShippingAddress,
    updateShippingAddress
  } = useAuthMethods(setUser, setIsAuthenticated, setIsLoading);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated,
      isLoading,
      addOrder,
      addShippingAddress,
      updateUserProfile,
      deleteShippingAddress,
      updateShippingAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
};
