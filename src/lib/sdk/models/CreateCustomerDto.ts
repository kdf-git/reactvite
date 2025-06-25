/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateCustomerDto = {
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
    type: CreateCustomerDto.type;
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
};
export namespace CreateCustomerDto {
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

