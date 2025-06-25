/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FileDto } from './FileDto';
import type { MerchantResponseDto } from './MerchantResponseDto';
export type RegisterResponseDto = {
    /**
     * User ID
     */
    id: string;
    /**
     * User email address
     */
    email: string;
    /**
     * User display name
     */
    displayName?: Record<string, any>;
    /**
     * URL to user avatar image
     */
    avatar?: Record<string, any>;
    /**
     * Whether user account is active
     */
    isActive: boolean;
    /**
     * Whether user email is verified
     */
    emailVerified: boolean;
    /**
     * Authentication provider (local, google, github)
     */
    provider?: Record<string, any>;
    /**
     * ID from auth provider
     */
    providerId?: Record<string, any>;
    /**
     * User roles
     */
    roles: Array<string>;
    /**
     * Merchant ID associated with the user
     */
    merchantId?: Record<string, any>;
    /**
     * Merchant details associated with the user
     */
    merchant?: MerchantResponseDto;
    /**
     * Files owned by user
     */
    files?: Array<FileDto>;
    /**
     * Account creation date
     */
    createdAt: string;
    /**
     * Account last updated date
     */
    updatedAt: string;
};

