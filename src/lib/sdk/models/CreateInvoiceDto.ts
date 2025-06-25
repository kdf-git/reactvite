/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateInvoiceItemDto } from './CreateInvoiceItemDto';
export type CreateInvoiceDto = {
    /**
     * Branch ID
     */
    branchId: string;
    /**
     * Customer ID
     */
    customerId?: string;
    /**
     * Invoice date
     */
    invoiceDate: string;
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
};

