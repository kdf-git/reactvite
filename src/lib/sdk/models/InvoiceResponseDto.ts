/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { InvoiceItemResponseDto } from './InvoiceItemResponseDto';
import type { InvoicePaymentResponseDto } from './InvoicePaymentResponseDto';
export type InvoiceResponseDto = {
    /**
     * Invoice ID
     */
    id: string;
    /**
     * Merchant ID
     */
    merchantId: string;
    /**
     * Merchant details
     */
    merchant?: Record<string, any>;
    /**
     * Branch ID
     */
    branchId: string;
    /**
     * Branch details
     */
    branch?: Record<string, any>;
    /**
     * Customer ID
     */
    customerId?: string;
    /**
     * Customer details
     */
    customer?: Record<string, any>;
    /**
     * Invoice number
     */
    invoiceNumber: string;
    /**
     * Invoice date
     */
    invoiceDate: string;
    /**
     * Due date
     */
    dueDate?: string;
    /**
     * Total amount
     */
    totalAmount: number;
    /**
     * Tax amount
     */
    taxAmount: number;
    /**
     * Discount amount
     */
    discountAmount: number;
    /**
     * Amount paid
     */
    amountPaid: number;
    /**
     * Invoice status
     */
    status: InvoiceResponseDto.status;
    /**
     * Payment status
     */
    paymentStatus: InvoiceResponseDto.paymentStatus;
    /**
     * Currency code
     */
    currencyCode: string;
    /**
     * Invoice notes
     */
    notes?: string;
    /**
     * Invoice items
     */
    items?: Array<InvoiceItemResponseDto>;
    /**
     * Invoice payments
     */
    payments?: Array<InvoicePaymentResponseDto>;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
    /**
     * KRA confirmation date
     */
    kraConfirmationDate?: string;
    /**
     * KRA internal data
     */
    kraInternalData?: string;
    /**
     * KRA invoice number
     */
    kraInvoiceNumber?: number;
    /**
     * KRA MRC number
     */
    kraMrcNumber?: string;
    /**
     * KRA payment method code
     */
    kraPaymentMethodCode?: string;
    /**
     * KRA purchaser acceptance
     */
    kraPurchaserAcceptance?: string;
    /**
     * KRA receipt number
     */
    kraReceiptNumber?: number;
    /**
     * KRA receipt signature
     */
    kraReceiptSignature?: string;
    /**
     * KRA receipt type code
     */
    kraReceiptTypeCode?: string;
    /**
     * KRA sales status code
     */
    kraSalesStatusCode?: string;
    /**
     * KRA sales type code
     */
    kraSalesTypeCode?: string;
    /**
     * KRA SDC ID
     */
    kraSdcId?: string;
    /**
     * KRA stock release date
     */
    kraStockReleaseDate?: string;
    /**
     * KRA submission data
     */
    kraSubmissionData?: Record<string, any>;
    /**
     * KRA submitted flag
     */
    kraSubmitted?: boolean;
    /**
     * KRA submitted at timestamp
     */
    kraSubmittedAt?: string;
    /**
     * KRA total receipt number
     */
    kraTotalReceiptNumber?: number;
    /**
     * KRA VSCU receipt date
     */
    kraVscuReceiptDate?: string;
};
export namespace InvoiceResponseDto {
    /**
     * Invoice status
     */
    export enum status {
        DRAFT = 'DRAFT',
        ISSUED = 'ISSUED',
        VOID = 'VOID',
        CANCELLED = 'CANCELLED',
        CREDIT_NOTE = 'CREDIT_NOTE',
        DEBIT_NOTE = 'DEBIT_NOTE',
        REFUNDED = 'REFUNDED',
    }
    /**
     * Payment status
     */
    export enum paymentStatus {
        UNPAID = 'UNPAID',
        PARTIAL = 'PARTIAL',
        PAID = 'PAID',
        OVERPAID = 'OVERPAID',
    }
}

