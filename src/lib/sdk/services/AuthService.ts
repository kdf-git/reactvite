/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChangePasswordDto } from '../models/ChangePasswordDto';
import type { ChangePasswordResponseDto } from '../models/ChangePasswordResponseDto';
import type { ForgotPasswordDto } from '../models/ForgotPasswordDto';
import type { ForgotPasswordResponseDto } from '../models/ForgotPasswordResponseDto';
import type { LoginDto } from '../models/LoginDto';
import type { LoginResponseDto } from '../models/LoginResponseDto';
import type { ProfileResponseDto } from '../models/ProfileResponseDto';
import type { RefreshTokenDto } from '../models/RefreshTokenDto';
import type { RefreshTokenResponseDto } from '../models/RefreshTokenResponseDto';
import type { RegisterDto } from '../models/RegisterDto';
import type { RegisterResponseDto } from '../models/RegisterResponseDto';
import type { ResetPasswordDto } from '../models/ResetPasswordDto';
import type { ResetPasswordResponseDto } from '../models/ResetPasswordResponseDto';
import type { SuccessResponseDto } from '../models/SuccessResponseDto';
import type { VerifyEmailResponseDto } from '../models/VerifyEmailResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AuthService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Login with email and password
     * @param requestBody
     * @returns LoginResponseDto Returns JWT tokens
     * @throws ApiError
     */
    public authControllerLogin(
        requestBody: LoginDto,
    ): CancelablePromise<LoginResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Register a new user
     * @param requestBody
     * @returns RegisterResponseDto User created successfully
     * @throws ApiError
     */
    public authControllerRegister(
        requestBody: RegisterDto,
    ): CancelablePromise<RegisterResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Refresh an access token using a refresh token
     * @param requestBody
     * @returns RefreshTokenResponseDto Returns a new access token
     * @throws ApiError
     */
    public authControllerRefreshToken(
        requestBody: RefreshTokenDto,
    ): CancelablePromise<RefreshTokenResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Logout the current user
     * @returns SuccessResponseDto Logout successful
     * @throws ApiError
     */
    public authControllerLogout(): CancelablePromise<SuccessResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/logout',
        });
    }
    /**
     * Get the current user profile
     * @returns ProfileResponseDto Returns user profile
     * @throws ApiError
     */
    public authControllerGetProfile(): CancelablePromise<ProfileResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/auth/profile',
        });
    }
    /**
     * Verify user email address
     * @param token
     * @returns VerifyEmailResponseDto Email verified successfully
     * @throws ApiError
     */
    public authControllerVerifyEmail(
        token: string,
    ): CancelablePromise<VerifyEmailResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/auth/verify-email',
            query: {
                'token': token,
            },
            errors: {
                400: `Invalid verification token`,
            },
        });
    }
    /**
     * Request a password reset
     * @param requestBody
     * @returns ForgotPasswordResponseDto Password reset email sent
     * @throws ApiError
     */
    public authControllerForgotPassword(
        requestBody: ForgotPasswordDto,
    ): CancelablePromise<ForgotPasswordResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Reset password using token
     * @param requestBody
     * @returns ResetPasswordResponseDto Password reset successful
     * @throws ApiError
     */
    public authControllerResetPassword(
        requestBody: ResetPasswordDto,
    ): CancelablePromise<ResetPasswordResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid or expired token`,
            },
        });
    }
    /**
     * Change user password
     * @param requestBody
     * @returns ChangePasswordResponseDto Password changed successfully
     * @throws ApiError
     */
    public authControllerChangePassword(
        requestBody: ChangePasswordDto,
    ): CancelablePromise<ChangePasswordResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/auth/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid current password`,
            },
        });
    }
}
