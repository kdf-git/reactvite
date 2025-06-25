/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PaymentModeResponseDto = {
    /**
     * Payment mode ID
     */
    id: string;
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
    type: PaymentModeResponseDto.type;
    /**
     * KRA payment method code
     */
    paymentMethodCode?: string;
    /**
     * Payment mode description
     */
    description?: string;
    /**
     * Whether the payment mode is active
     */
    isActive: boolean;
    /**
     * Whether this payment mode requires a reference number
     */
    requiresReference: boolean;
    /**
     * Whether partial payments are allowed
     */
    allowPartialPayments: boolean;
    /**
     * Whether this is a default seeded payment mode
     */
    isDefault: boolean;
    /**
     * Whether this is a system seeded payment mode (non-editable)
     */
    isSystemDefault: boolean;
    /**
     * Number of transactions using this payment mode
     */
    transactionCount?: number;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};
export namespace PaymentModeResponseDto {
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

