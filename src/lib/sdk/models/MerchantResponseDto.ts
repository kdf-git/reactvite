/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type MerchantResponseDto = {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Name of the merchant
     */
    name: string;
    /**
     * Tax Identification Number (TIN)
     */
    taxIdentifier?: string;
    /**
     * Contact email address
     */
    contactEmail: string;
    /**
     * Contact phone number
     */
    contactPhone: string;
    /**
     * Physical address
     */
    address: string;
    /**
     * URL to merchant logo
     */
    logo?: string;
    /**
     * Whether the merchant is active
     */
    isActive: boolean;
    /**
     * Tax integration type for the merchant
     */
    taxIntegrationType: MerchantResponseDto.taxIntegrationType;
    /**
     * Timezone for the merchant
     */
    timezone: string;
    /**
     * ISO country code
     */
    country: string;
    /**
     * ISO currency code
     */
    currency: string;
    /**
     * Currency symbol for display
     */
    currencySymbol: string;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};
export namespace MerchantResponseDto {
    /**
     * Tax integration type for the merchant
     */
    export enum taxIntegrationType {
        NONE = 'NONE',
        KRA = 'KRA',
        MALAYSIA_EINVOICE = 'MALAYSIA_EINVOICE',
    }
}

