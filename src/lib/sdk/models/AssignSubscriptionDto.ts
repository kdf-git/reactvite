/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AssignSubscriptionDto = {
    /**
     * ID of the merchant to assign the subscription to
     */
    merchantId: string;
    /**
     * ID of the subscription plan to assign
     */
    planId: string;
    /**
     * Billing cycle for the subscription
     */
    billingCycle: AssignSubscriptionDto.billingCycle;
    /**
     * Number of devices for this subscription
     */
    deviceCount?: number;
    /**
     * Custom trial end date (ISO string). If not provided, defaults to 30 days from start
     */
    trialEndDate?: string;
    /**
     * Trial period in days. Alternative to trialEndDate. Defaults to 30 days
     */
    trialPeriodDays?: number;
    /**
     * Skip trial and start as active subscription immediately
     */
    skipTrial?: boolean;
    /**
     * Custom pricing overrides for this specific subscription
     */
    customPricing?: Record<string, any>;
};
export namespace AssignSubscriptionDto {
    /**
     * Billing cycle for the subscription
     */
    export enum billingCycle {
        MONTHLY = 'MONTHLY',
        ANNUAL = 'ANNUAL',
    }
}

