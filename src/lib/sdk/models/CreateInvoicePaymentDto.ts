/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateInvoicePaymentDto = {
    /**
     * Payment amount
     */
    amount: number;
    /**
     * Payment mode ID
     */
    paymentModeId: string;
    /**
     * Payment method (legacy field for backward compatibility)
     */
    paymentMethod?: string;
    /**
     * Payment date
     */
    paymentDate: string;
    /**
     * Reference number
     */
    referenceNumber?: string;
    /**
     * Payment notes
     */
    notes?: string;
};

