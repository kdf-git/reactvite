/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateVendorDto = {
    /**
     * Merchant ID
     */
    merchantId: string;
    /**
     * Vendor name
     */
    name: string;
    /**
     * Contact person name
     */
    contactPerson?: string;
    /**
     * Email address
     */
    email?: string;
    /**
     * Phone number
     */
    phone?: string;
    /**
     * Physical address
     */
    address?: string;
    /**
     * Tax identification number (TIN)
     */
    taxIdentifier?: string;
    /**
     * Whether the vendor is active
     */
    isActive?: boolean;
};

