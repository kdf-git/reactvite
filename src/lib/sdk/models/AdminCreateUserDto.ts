/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdminCreateUserDto = {
    /**
     * User email address
     */
    email: string;
    /**
     * User password
     */
    password: string;
    /**
     * User display name
     */
    displayName?: string;
    /**
     * URL to user avatar image
     */
    avatar?: string;
    /**
     * Whether user account is active
     */
    isActive?: boolean;
    /**
     * Whether user email is verified
     */
    emailVerified?: boolean;
    /**
     * Authentication provider
     */
    provider?: string;
    /**
     * User roles
     */
    roles?: Array<string>;
    /**
     * Merchant ID to associate user with
     */
    merchantId?: string;
};

