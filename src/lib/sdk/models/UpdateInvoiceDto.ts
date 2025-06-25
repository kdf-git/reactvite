/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateInvoiceItemDto } from './CreateInvoiceItemDto';
export type UpdateInvoiceDto = {
    /**
     * Branch ID
     */
    branchId?: string;
    /**
     * Customer ID
     */
    customerId?: string;
    /**
     * Invoice date
     */
    invoiceDate?: string;
    /**
     * Due date
     */
    dueDate?: string;
    /**
     * Invoice notes
     */
    notes?: string;
    /**
     * Invoice items
     */
    items?: Array<CreateInvoiceItemDto>;
    /**
     * Invoice status
     */
    status?: UpdateInvoiceDto.status;
    /**
     * Payment status
     */
    paymentStatus?: UpdateInvoiceDto.paymentStatus;
};
export namespace UpdateInvoiceDto {
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

