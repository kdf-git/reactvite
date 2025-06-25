/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StaffResponseDto = {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Merchant ID that owns the staff
     */
    merchantId: string;
    /**
     * Branch ID where staff is assigned
     */
    branchId?: string;
    /**
     * Branch information
     */
    branch?: Record<string, any>;
    /**
     * Position ID for the staff
     */
    positionId: string;
    /**
     * Position information
     */
    position: Record<string, any>;
    /**
     * Department ID for the staff
     */
    departmentId: string;
    /**
     * Department information
     */
    department: Record<string, any>;
    /**
     * Full name of the staff member
     */
    name: string;
    /**
     * Mifare card number
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
    /**
     * Whether this staff member has been submitted to KRA VSCU
     */
    kraSubmitted: boolean;
    /**
     * Timestamp when staff was submitted to KRA VSCU
     */
    kraSubmittedAt?: string;
    /**
     * KRA user ID (usually same as card number)
     */
    kraUserId?: string;
    /**
     * KRA user name
     */
    kraUserName?: string;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

