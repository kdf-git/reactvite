/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatePaymentModeDto = {
    /**
     * Merchant ID
     */
    merchantId: string;
    /**
     * Payment mode name
     */
    name: string;
    /**
     * Payment type
     */
    type: CreatePaymentModeDto.type;
    /**
     * KRA payment method code (e.g., "01" for Cash)
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
export namespace CreatePaymentModeDto {
    /**
     * Payment type
     */
    export enum type {
        CASH = 'CASH',
        CHEQUE = 'CHEQUE',
        CREDIT_CARD = 'CREDIT_CARD',
        DEBIT_CARD = 'DEBIT_CARD',
        BANK_TRANSFER = 'BANK_TRANSFER',
        MOBILE_MONEY = 'MOBILE_MONEY',
        DIGITAL_WALLET = 'DIGITAL_WALLET',
        CRYPTOCURRENCY = 'CRYPTOCURRENCY',
        STORE_CREDIT = 'STORE_CREDIT',
        OTHER = 'OTHER',
    }
}

