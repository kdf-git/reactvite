/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateStaffDto = {
    /**
     * Merchant ID that owns the staff
     */
    merchantId: string;
    /**
     * Branch ID where staff is assigned (optional)
     */
    branchId: string;
    /**
     * Position ID for the staff
     */
    positionId: string;
    /**
     * Department ID for the staff
     */
    departmentId: string;
    /**
     * Full name of the staff member
     */
    name: string;
    /**
     * Mifare card number (7-16 characters)
     */
    cardNo: string;
    /**
     * Phone number of the staff member
     */
    phoneNo?: string;
    /**
     * Email address of the staff member
     */
    email?: string;
    /**
     * Whether this staff member is active
     */
    isActive: boolean;
};

