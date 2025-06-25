/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreditNoteResponseDto = {
    id: string;
    merchantId: string;
    branchId: string;
    customerId?: string;
    originalInvoiceId: string;
    creditNoteNumber: string;
    creditNoteDate: string;
    totalAmount: number;
    taxAmount: number;
    reason: string;
    status: CreditNoteResponseDto.status;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    currencyCode: string;
    /**
     * KRA submitted flag
     */
    kraSubmitted?: boolean;
    /**
     * KRA submitted at timestamp
     */
    kraSubmittedAt?: string;
    /**
     * KRA submission data
     */
    kraSubmissionData?: Record<string, any>;
    /**
     * KRA invoice number
     */
    kraInvoiceNumber?: number;
    /**
     * KRA receipt number
     */
    kraReceiptNumber?: number;
    /**
     * KRA receipt signature
     */
    kraReceiptSignature?: string;
    /**
     * KRA SDC ID
     */
    kraSdcId?: string;
    /**
     * KRA MRC number
     */
    kraMrcNumber?: string;
    items?: Array<string>;
    originalInvoice?: Record<string, any>;
    customer?: Record<string, any>;
    branch?: Record<string, any>;
    merchant?: Record<string, any>;
};
export namespace CreditNoteResponseDto {
    export enum status {
        DRAFT = 'DRAFT',
        ISSUED = 'ISSUED',
        VOID = 'VOID',
        CANCELLED = 'CANCELLED',
        CREDIT_NOTE = 'CREDIT_NOTE',
        DEBIT_NOTE = 'DEBIT_NOTE',
        REFUNDED = 'REFUNDED',
    }
}

