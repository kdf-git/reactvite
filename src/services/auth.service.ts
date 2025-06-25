import { storeAuthTokens, clearAuthTokens, refreshAccessToken } from './api-interceptor';
import { User } from '@/lib/sdk/models/User';
import { LoginDto } from '@/lib/sdk/models/LoginDto';
import { LoginResponseDto } from '@/lib/sdk/models/LoginResponseDto';
import { RegisterDto } from '@/lib/sdk/models/RegisterDto';
import { RegisterResponseDto } from '@/lib/sdk';
import { ForgotPasswordDto } from '@/lib/sdk/models/ForgotPasswordDto';
import { ForgotPasswordResponseDto } from '@/lib/sdk/models/ForgotPasswordResponseDto';
import { ResetPasswordDto } from '@/lib/sdk/models/ResetPasswordDto';
import { ResetPasswordResponseDto } from '@/lib/sdk/models/ResetPasswordResponseDto';
import { ChangePasswordDto } from '@/lib/sdk/models/ChangePasswordDto';
import { ChangePasswordResponseDto } from '@/lib/sdk/models/ChangePasswordResponseDto';
import { authService, usersService, secureApi } from './sdk';

// Authentication response types
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface LoginRequest extends LoginDto { }

export interface RegisterRequest extends RegisterDto {
  password_confirmation?: string;
}

export interface AuthError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

const AuthService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response: LoginResponseDto = await secureApi.auth.authControllerLogin(credentials);

      // Validate response
      if (!response.access_token) {
        console.error('Login failed: No access token received');
        throw new Error('Authentication failed');
      }

      if (!response.userId) {
        console.error('Login failed: No user ID received');
        throw new Error('Authentication failed');
      }

      // Store tokens
      storeAuthTokens(
        response.access_token,
        response.refresh_token || response.access_token, // Use refresh_token if available
        response.userId
      );

      // fetch the user profile
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('User ID not saved in localStorage after login');
        throw new Error('Authentication failed');
      }

      try {
        // Fetch user profile
        const user: User = await authService.authControllerGetProfile();

        if (!user) {
          console.error('No user profile received');
          throw new Error('Failed to fetch user profile');
        }

        return {
          access_token: response.access_token,
          refresh_token: response.refresh_token || response.access_token,
          user: user
        };
      } catch (profileError) {
        console.error('Error fetching user profile after login:', profileError);
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  register: async (userData: RegisterRequest): Promise<LoginResponse> => {
    try {
      // Convert from the frontend format to the SDK format
      const registerData: RegisterDto = {
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName
      };

      const response: RegisterResponseDto = await secureApi.auth.authControllerRegister(registerData);

      if (!response.id) {
        throw new Error('Failed to register user');
      }

      // login the user
      const loginResponse: LoginResponse = await AuthService.login({
        email: userData.email,
        password: userData.password
      });

      return loginResponse;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    try {
      //await secureApi.auth.authControllerLogout();
      clearAuthTokens();
    } catch (error) {
      console.error('Logout error:', error);
      // Always clear tokens even if API call fails
      clearAuthTokens();
      throw error;
    }
  },

  /**
   * Get the current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      return await authService.authControllerGetProfile();
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },

  /**
   * Refresh the access token using the refresh token
   */
  refreshToken: async (): Promise<boolean> => {
    return await refreshAccessToken();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const accessToken = localStorage.getItem('auth_token');
    const refreshToken = localStorage.getItem('refresh_token');
    return !!accessToken && !!refreshToken;
  },

  /**
   * Request a password reset email
   */
  forgotPassword: async (email: string): Promise<ForgotPasswordResponseDto> => {
    try {
      const response: ForgotPasswordResponseDto = await secureApi.auth.authControllerForgotPassword({
        email
      });

      return response;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  /**
   * Reset password using token
   */
  resetPassword: async (token: string, password: string): Promise<ResetPasswordResponseDto> => {
    try {
      const response: ResetPasswordResponseDto = await secureApi.auth.authControllerResetPassword({
        token,
        password: password
      });

      return response;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
};

export default AuthService;
