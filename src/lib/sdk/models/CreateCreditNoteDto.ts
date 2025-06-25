/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCreditNoteItemDto } from './CreateCreditNoteItemDto';
export type CreateCreditNoteDto = {
    /**
     * Original invoice ID to credit
     */
    originalInvoiceId: string;
    /**
     * Credit note date
     */
    creditNoteDate: string;
    /**
     * Reason for credit note
     */
    reason: string;
    /**
     * Credit note notes
     */
    notes?: string;
    /**
     * Credit note items
     */
    items: Array<CreateCreditNoteItemDto>;
};

