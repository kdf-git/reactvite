import { useState } from "react";
import { User, AuthResult, Order, ShippingAddress } from "@/types";
import AuthService, { LoginRequest, RegisterRequest } from "@/services/auth.service";
import { startTokenRefreshChecker } from "@/services/token-refresher";
import { sdkUserToAppUser } from "@/utils/userAdapter";
import { toast } from "sonner";
import { usersService } from "@/services/sdk";
import { UpdateProfileDto } from "@/lib/sdk";
import { api } from "@/services/api";

/**
 * Hook that provides authentication methods
 */
export const useAuthMethods = (
  setUser: (user: User | null) => void,
  setIsAuthenticated: (isAuth: boolean) => void,
  setIsLoading: (isLoading: boolean) => void
) => {
  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      const response = await AuthService.login({ email, password });

      const appUser = sdkUserToAppUser(response.user);
      setUser(appUser);
      setIsAuthenticated(true);

      startTokenRefreshChecker();

      return {
        success: true,
        message: "Login successful!",
        user: appUser
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.message || "Invalid credentials"
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      const registerData: RegisterRequest = {
        displayName: name,
        email,
        password,
        password_confirmation: password
      };

      const response = await AuthService.register(registerData);

      const appUser = sdkUserToAppUser(response.user);
      setUser(appUser);
      setIsAuthenticated(true);

      startTokenRefreshChecker();

      return {
        success: true,
        message: "Registration successful!",
        user: appUser
      };
    } catch (error: any) {
      console.error("Registration error:", error);

      let errorMessage = error.message || "Registration failed";
      if (error.errors) {
        const firstError = Object.values(error.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);

      import("@/services/token-refresher").then(({ stopTokenRefreshChecker }) => {
        stopTokenRefreshChecker();
      });
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    toast.info("Order functionality will be implemented in the next phase");
    throw new Error("Not implemented yet");
  };


  // Helper method to refresh the user profile
  const refreshUserProfile = async (): Promise<void> => {
    try {
      const sdkUserData = await AuthService.getCurrentUser();
      const appUser = sdkUserToAppUser(sdkUserData);
      setUser(appUser);
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  };

  const updateUserProfile = async (userData: Partial<User>): Promise<User | null> => {
    try {
      setIsLoading(true);

      const updateData: UpdateProfileDto = {
        displayName: userData.displayName,
      };

      // get user id from 

      const updatedSdkUser = await usersService.usersControllerUpdateProfile(updateData);
      const updatedAppUser = sdkUserToAppUser(updatedSdkUser);

      setUser(updatedAppUser);

      return updatedAppUser;
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(error.message || "Failed to update profile");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    addOrder,
    updateUserProfile,
  };
};
