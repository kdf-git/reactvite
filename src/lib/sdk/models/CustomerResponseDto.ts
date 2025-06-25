/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CustomerResponseDto = {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Merchant ID that owns this customer
     */
    merchantId: string;
    /**
     * Branch ID where customer is registered
     */
    branchId?: string;
    /**
     * Type of customer
     */
    type: CustomerResponseDto.type;
    /**
     * Name of the customer or business
     */
    name: string;
    /**
     * Contact person name for business customers
     */
    contactPerson?: string;
    /**
     * Email address
     */
    email?: string;
    /**
     * Phone number
     */
    phone: string;
    /**
     * Tax identifier (VAT/PIN)
     */
    taxIdentifier?: string;
    /**
     * Physical address
     */
    address?: string;
    /**
     * City
     */
    city?: string;
    /**
     * Credit limit amount
     */
    creditLimit?: number;
    /**
     * Credit balance
     */
    creditBalance: number;
    /**
     * Loyalty points
     */
    loyaltyPoints: number;
    /**
     * Additional notes
     */
    notes?: string;
    /**
     * Whether this customer is active
     */
    isActive: boolean;
    /**
     * Date of last purchase
     */
    lastPurchase?: string;
    /**
     * Customer code for reference
     */
    customerCode?: string;
    /**
     * Whether loyalty program is enabled for this customer
     */
    isLoyaltyEnabled: boolean;
    /**
     * Whether customer is registered with KRA
     */
    kraRegistered: boolean;
    /**
     * KRA assigned customer number
     */
    kraCustomerNumber?: string;
    /**
     * KRA PIN (TIN) for the customer
     */
    kraPin?: string;
    /**
     * Official KRA customer name
     */
    kraCustomerName?: string;
    /**
     * KRA taxpayer status
     */
    kraStatus?: string;
    /**
     * KRA province name
     */
    kraProvince?: string;
    /**
     * KRA district name
     */
    kraDistrict?: string;
    /**
     * KRA sector name
     */
    kraSector?: string;
    /**
     * When customer was registered with KRA
     */
    kraRegisteredAt?: string;
    /**
     * Last time KRA data was synced
     */
    kraLastSync?: string;
    /**
     * Full KRA registration response
     */
    kraRegistrationData?: Record<string, any>;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};
export namespace CustomerResponseDto {
    /**
     * Type of customer
     */
    export enum type {
        INDIVIDUAL = 'INDIVIDUAL',
        BUSINESS = 'BUSINESS',
        GOVERNMENT = 'GOVERNMENT',
        FLEET = 'FLEET',
    }
}

