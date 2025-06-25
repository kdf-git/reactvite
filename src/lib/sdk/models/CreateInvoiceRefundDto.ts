/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateInvoiceRefundDto = {
    /**
     * Refund date
     */
    refundDate: string;
    /**
     * Refund amount
     */
    refundAmount: number;
    /**
     * Refund method
     */
    refundMethod: string;
    /**
     * Payment mode ID for refund
     */
    paymentModeId?: string;
    /**
     * Reason for refund
     */
    reason: string;
    /**
     * Refund notes
     */
    notes?: string;
};

