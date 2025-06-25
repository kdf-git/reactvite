/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdatePaymentModeDto = {
    /**
     * Payment mode name
     */
    name?: string;
    /**
     * KRA payment method code (only for custom payment modes)
     */
    paymentMethodCode?: string;
    /**
     * Payment mode description
     */
    description?: string;
    /**
     * Whether the payment mode is active
     */
    isActive?: boolean;
    /**
     * Whether this payment mode requires a reference number
     */
    requiresReference?: boolean;
    /**
     * Whether partial payments are allowed
     */
    allowPartialPayments?: boolean;
};

