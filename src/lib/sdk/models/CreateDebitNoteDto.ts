/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDebitNoteItemDto } from './CreateDebitNoteItemDto';
export type CreateDebitNoteDto = {
    /**
     * Original invoice ID to debit
     */
    originalInvoiceId: string;
    /**
     * Debit note date
     */
    debitNoteDate: string;
    /**
     * Reason for debit note
     */
    reason: string;
    /**
     * Debit note notes
     */
    notes?: string;
    /**
     * Debit note items
     */
    items: Array<CreateDebitNoteItemDto>;
};

