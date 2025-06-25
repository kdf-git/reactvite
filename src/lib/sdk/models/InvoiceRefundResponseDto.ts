/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InvoiceRefundResponseDto = {
    id: string;
    merchantId: string;
    invoiceId: string;
    refundNumber: string;
    refundDate: string;
    refundAmount: number;
    refundMethod: string;
    reason: string;
    status: InvoiceRefundResponseDto.status;
    notes?: string;
    processedAt?: string;
    processedBy?: string;
    createdAt: string;
    updatedAt: string;
    paymentModeId?: string;
    invoice?: Record<string, any>;
    paymentMode?: Record<string, any>;
};
export namespace InvoiceRefundResponseDto {
    export enum status {
        PENDING = 'PENDING',
        APPROVED = 'APPROVED',
        PROCESSED = 'PROCESSED',
        REJECTED = 'REJECTED',
        CANCELLED = 'CANCELLED',
    }
}

