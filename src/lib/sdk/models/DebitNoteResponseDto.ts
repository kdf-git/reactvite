/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DebitNoteResponseDto = {
    id: string;
    merchantId: string;
    branchId: string;
    customerId?: string;
    originalInvoiceId: string;
    debitNoteNumber: string;
    debitNoteDate: string;
    totalAmount: number;
    taxAmount: number;
    reason: string;
    status: DebitNoteResponseDto.status;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    currencyCode: string;
    items?: Array<string>;
    originalInvoice?: Record<string, any>;
    customer?: Record<string, any>;
    branch?: Record<string, any>;
};
export namespace DebitNoteResponseDto {
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

