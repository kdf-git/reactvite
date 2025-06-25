/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CurrencyResponseDto = {
    /**
     * Currency ID
     */
    id: string;
    /**
     * ISO currency code (3 letters)
     */
    currencyCode: string;
    /**
     * Currency name
     */
    currencyName: string;
    /**
     * Currency symbol
     */
    symbol: string;
    /**
     * Country ID this currency belongs to
     */
    countryId: string;
    /**
     * Whether the currency is active
     */
    isActive: boolean;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
    /**
     * Associated country information
     */
    country: Record<string, any>;
};

