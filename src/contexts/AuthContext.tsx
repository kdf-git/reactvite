import { createContext } from "react";
import { User, AuthResult, ShippingAddress } from "@/types";

// Define the auth context type
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  addOrder: (orderData: any) => Promise<any>;
  addShippingAddress: (addressData: Omit<ShippingAddress, 'id'>) => Promise<ShippingAddress>;
  updateUserProfile: (userData: Partial<User>) => Promise<User | null>;
  deleteShippingAddress: (addressId: string) => Promise<boolean>;
  updateShippingAddress: (addressId: string, addressData: Partial<ShippingAddress>) => Promise<ShippingAddress | null>;
}

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
