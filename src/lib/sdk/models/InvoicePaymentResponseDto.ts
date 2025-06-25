/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InvoicePaymentResponseDto = {
    /**
     * Payment ID
     */
    id: string;
    /**
     * Invoice ID
     */
    invoiceId: string;
    /**
     * Payment amount
     */
    amount: number;
    /**
     * Payment method (legacy field)
     */
    paymentMethod?: string;
    /**
     * Payment mode ID
     */
    paymentModeId?: string;
    /**
     * Payment mode details
     */
    paymentMode?: Record<string, any>;
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
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

