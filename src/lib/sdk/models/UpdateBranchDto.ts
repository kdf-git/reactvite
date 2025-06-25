/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateBranchDto = {
    /**
     * Merchant ID that owns this branch
     */
    merchantId?: string;
    /**
     * Name of the branch
     */
    name?: string;
    /**
     * Unique branch code
     */
    code?: string;
    /**
     * Physical address of the branch
     */
    address?: string;
    /**
     * Contact phone number
     */
    contactPhone?: string;
    /**
     * Contact email address
     */
    contactEmail?: string;
    /**
     * Whether this branch is active
     */
    isActive?: boolean;
    /**
     * Whether this is the head office branch
     */
    isHeadOffice?: boolean;
    /**
     * Latitude coordinates for map display
     */
    latitude?: number;
    /**
     * Longitude coordinates for map display
     */
    longitude?: number;
};

