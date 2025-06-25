
import { useState, useEffect } from "react";
import { User } from "@/types";
import AuthService from "@/services/auth.service";
import { sdkUserToAppUser } from "@/utils/userAdapter";
import { startTokenRefreshChecker, stopTokenRefreshChecker } from "@/services/token-refresher";

/**
 * Hook that manages authentication state
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for saved authentication on mount and load user
  useEffect(() => {
    const loadUser = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          // Try to get current user
          const sdkUserData = await AuthService.getCurrentUser();
          const appUser = sdkUserToAppUser(sdkUserData);
          setUser(appUser);
          setIsAuthenticated(true);
          
          // Start the token refresh checker
          startTokenRefreshChecker();
        } catch (error) {
          console.error("Error loading user:", error);
          
          // If the error persists even after the automatic token refresh
          // attempt in getCurrentUser, then try to explicitly refresh the token
          try {
            const refreshed = await AuthService.refreshToken();
            if (refreshed) {
              // If refresh succeeded, try again to get user data
              const sdkUserData = await AuthService.getCurrentUser();
              const appUser = sdkUserToAppUser(sdkUserData);
              setUser(appUser);
              setIsAuthenticated(true);
              
              // Start the token refresh checker
              startTokenRefreshChecker();
            } else {
              // If refresh failed, clear authentication state
              setIsAuthenticated(false);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            setIsAuthenticated(false);
          }
        }
      }
      setIsLoading(false);
    };

    loadUser();
    
    // Cleanup: stop the token refresh checker when component unmounts
    return () => {
      stopTokenRefreshChecker();
    };
  }, []);

  return {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    setIsLoading
  };
};
