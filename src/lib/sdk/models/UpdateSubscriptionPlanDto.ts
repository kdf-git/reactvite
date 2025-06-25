/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateSubscriptionPlanDto = {
    /**
     * Unique name for the subscription plan
     */
    name?: string;
    /**
     * Detailed description of the plan features
     */
    description?: string;
    /**
     * ISO country code - plans are country-specific
     */
    country?: string;
    /**
     * ISO currency code - plans are priced in specific currency
     */
    currency?: string;
    /**
     * Monthly base price for the ERP account
     */
    basePrice?: number;
    /**
     * Number of devices included for free in this plan
     */
    freeDevices?: number;
    /**
     * Price per device per month (for devices beyond free limit)
     */
    devicePrice?: number;
    /**
     * Type of tax integration supported by this plan
     */
    taxIntegrationType?: UpdateSubscriptionPlanDto.taxIntegrationType;
    /**
     * Additional monthly price for tax integration features
     */
    taxIntegrationPrice?: number;
    /**
     * Maximum number of devices allowed (null for unlimited)
     */
    maxDevices?: number;
    /**
     * Array of features included in this plan
     */
    features?: Array<string>;
    /**
     * Whether the plan is active and available for subscription
     */
    isActive?: boolean;
};
export namespace UpdateSubscriptionPlanDto {
    /**
     * Type of tax integration supported by this plan
     */
    export enum taxIntegrationType {
        NONE = 'NONE',
        KRA = 'KRA',
        MALAYSIA_EINVOICE = 'MALAYSIA_EINVOICE',
    }
}

