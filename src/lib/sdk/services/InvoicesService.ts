/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCreditNoteDto } from '../models/CreateCreditNoteDto';
import type { CreateDebitNoteDto } from '../models/CreateDebitNoteDto';
import type { CreateInvoiceDto } from '../models/CreateInvoiceDto';
import type { CreateInvoiceItemDto } from '../models/CreateInvoiceItemDto';
import type { CreateInvoicePaymentDto } from '../models/CreateInvoicePaymentDto';
import type { CreateInvoiceRefundDto } from '../models/CreateInvoiceRefundDto';
import type { CreditNoteResponseDto } from '../models/CreditNoteResponseDto';
import type { DebitNoteResponseDto } from '../models/DebitNoteResponseDto';
import type { InvoiceItemResponseDto } from '../models/InvoiceItemResponseDto';
import type { InvoicePaymentResponseDto } from '../models/InvoicePaymentResponseDto';
import type { InvoiceRefundResponseDto } from '../models/InvoiceRefundResponseDto';
import type { InvoiceResponseDto } from '../models/InvoiceResponseDto';
import type { UpdateInvoiceDto } from '../models/UpdateInvoiceDto';
import type { UpdateInvoiceItemDto } from '../models/UpdateInvoiceItemDto';
import type { UpdateInvoicePaymentDto } from '../models/UpdateInvoicePaymentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class InvoicesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new invoice
     * @param requestBody
     * @returns InvoiceResponseDto Invoice created successfully
     * @throws ApiError
     */
    public invoiceControllerCreateInvoice(
        requestBody: CreateInvoiceDto,
    ): CancelablePromise<InvoiceResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/invoices',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all invoices
     * @param branchId
     * @param customerId
     * @param status
     * @param paymentStatus
     * @param startDate
     * @param endDate
     * @returns InvoiceResponseDto Invoices retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetInvoices(
        branchId?: string,
        customerId?: string,
        status?: 'DRAFT' | 'ISSUED' | 'VOID' | 'CANCELLED' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'REFUNDED',
        paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID',
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<InvoiceResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices',
            query: {
                'branchId': branchId,
                'customerId': customerId,
                'status': status,
                'paymentStatus': paymentStatus,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Create a new credit note
     * @param requestBody
     * @returns CreditNoteResponseDto Credit note created successfully
     * @throws ApiError
     */
    public invoiceControllerCreateCreditNote(
        requestBody: CreateCreditNoteDto,
    ): CancelablePromise<CreditNoteResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/invoices/credit-notes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all credit notes
     * @param branchId
     * @param customerId
     * @param originalInvoiceId
     * @param status
     * @param startDate
     * @param endDate
     * @returns CreditNoteResponseDto Credit notes retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetCreditNotes(
        branchId?: string,
        customerId?: string,
        originalInvoiceId?: string,
        status?: 'DRAFT' | 'ISSUED' | 'VOID' | 'CANCELLED' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'REFUNDED',
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<CreditNoteResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/credit-notes',
            query: {
                'branchId': branchId,
                'customerId': customerId,
                'originalInvoiceId': originalInvoiceId,
                'status': status,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get credit note by ID
     * @param id
     * @returns CreditNoteResponseDto Credit note retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetCreditNote(
        id: string,
    ): CancelablePromise<CreditNoteResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/credit-notes/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Issue credit note
     * @param id
     * @returns CreditNoteResponseDto Credit note issued successfully
     * @throws ApiError
     */
    public invoiceControllerIssueCreditNote(
        id: string,
    ): CancelablePromise<CreditNoteResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/invoices/credit-notes/{id}/issue',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Submit credit note to KRA VSCU
     * @param id
     * @returns CreditNoteResponseDto Credit note submitted to KRA successfully
     * @throws ApiError
     */
    public invoiceControllerSubmitCreditNoteToKra(
        id: string,
    ): CancelablePromise<CreditNoteResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/invoices/credit-notes/{id}/kra/submit',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid KRA data or merchant not eligible`,
                404: `Credit note not found`,
            },
        });
    }
    /**
     * Create a new debit note
     * @param requestBody
     * @returns DebitNoteResponseDto Debit note created successfully
     * @throws ApiError
     */
    public invoiceControllerCreateDebitNote(
        requestBody: CreateDebitNoteDto,
    ): CancelablePromise<DebitNoteResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/invoices/debit-notes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all debit notes
     * @param branchId
     * @param customerId
     * @param originalInvoiceId
     * @param status
     * @param startDate
     * @param endDate
     * @returns DebitNoteResponseDto Debit notes retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetDebitNotes(
        branchId?: string,
        customerId?: string,
        originalInvoiceId?: string,
        status?: 'DRAFT' | 'ISSUED' | 'VOID' | 'CANCELLED' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'REFUNDED',
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<DebitNoteResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/debit-notes',
            query: {
                'branchId': branchId,
                'customerId': customerId,
                'originalInvoiceId': originalInvoiceId,
                'status': status,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get debit note by ID
     * @param id
     * @returns DebitNoteResponseDto Debit note retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetDebitNote(
        id: string,
    ): CancelablePromise<DebitNoteResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/debit-notes/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Issue debit note
     * @param id
     * @returns DebitNoteResponseDto Debit note issued successfully
     * @throws ApiError
     */
    public invoiceControllerIssueDebitNote(
        id: string,
    ): CancelablePromise<DebitNoteResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/invoices/debit-notes/{id}/issue',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get all refunds
     * @param invoiceId
     * @param status
     * @param startDate
     * @param endDate
     * @returns InvoiceRefundResponseDto Refunds retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetRefunds(
        invoiceId?: string,
        status?: 'PENDING' | 'APPROVED' | 'PROCESSED' | 'REJECTED' | 'CANCELLED',
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<Array<InvoiceRefundResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/refunds',
            query: {
                'invoiceId': invoiceId,
                'status': status,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get refund by ID
     * @param id
     * @returns InvoiceRefundResponseDto Refund retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetRefund(
        id: string,
    ): CancelablePromise<InvoiceRefundResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/refunds/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Approve refund
     * @param id
     * @returns InvoiceRefundResponseDto Refund approved successfully
     * @throws ApiError
     */
    public invoiceControllerApproveRefund(
        id: string,
    ): CancelablePromise<InvoiceRefundResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/invoices/refunds/{id}/approve',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Process refund
     * @param id
     * @returns InvoiceRefundResponseDto Refund processed successfully
     * @throws ApiError
     */
    public invoiceControllerProcessRefund(
        id: string,
    ): CancelablePromise<InvoiceRefundResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/invoices/refunds/{id}/process',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Reject refund
     * @param id
     * @returns InvoiceRefundResponseDto Refund rejected successfully
     * @throws ApiError
     */
    public invoiceControllerRejectRefund(
        id: string,
    ): CancelablePromise<InvoiceRefundResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/invoices/refunds/{id}/reject',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get invoice by ID
     * @param id
     * @returns InvoiceResponseDto Invoice retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetInvoice(
        id: string,
    ): CancelablePromise<InvoiceResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update invoice
     * @param id
     * @param requestBody
     * @returns InvoiceResponseDto Invoice updated successfully
     * @throws ApiError
     */
    public invoiceControllerUpdateInvoice(
        id: string,
        requestBody: UpdateInvoiceDto,
    ): CancelablePromise<InvoiceResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/invoices/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get invoice by number
     * @param invoiceNumber
     * @returns InvoiceResponseDto Invoice retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetInvoiceByNumber(
        invoiceNumber: string,
    ): CancelablePromise<InvoiceResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/number/{invoiceNumber}',
            path: {
                'invoiceNumber': invoiceNumber,
            },
        });
    }
    /**
     * Update invoice status
     * @param id
     * @returns InvoiceResponseDto Invoice status updated successfully
     * @throws ApiError
     */
    public invoiceControllerUpdateInvoiceStatus(
        id: string,
    ): CancelablePromise<InvoiceResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/invoices/{id}/status',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Void invoice
     * @param id
     * @returns InvoiceResponseDto Invoice voided successfully
     * @throws ApiError
     */
    public invoiceControllerVoidInvoice(
        id: string,
    ): CancelablePromise<InvoiceResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/invoices/{id}/void',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Issue invoice
     * @param id
     * @returns InvoiceResponseDto Invoice issued successfully
     * @throws ApiError
     */
    public invoiceControllerIssueInvoice(
        id: string,
    ): CancelablePromise<InvoiceResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/invoices/{id}/issue',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Submit invoice to KRA VSCU
     * @param id
     * @returns InvoiceResponseDto Invoice submitted to KRA successfully
     * @throws ApiError
     */
    public invoiceControllerSubmitToKra(
        id: string,
    ): CancelablePromise<InvoiceResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/invoices/{id}/kra/submit',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid KRA data or merchant not eligible`,
                404: `Invoice not found`,
            },
        });
    }
    /**
     * Add item to invoice
     * @param id
     * @param requestBody
     * @returns InvoiceItemResponseDto Invoice item added successfully
     * @throws ApiError
     */
    public invoiceControllerAddInvoiceItem(
        id: string,
        requestBody: CreateInvoiceItemDto,
    ): CancelablePromise<InvoiceItemResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/invoices/{id}/items',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get invoice items
     * @param id
     * @returns InvoiceItemResponseDto Invoice items retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetInvoiceItems(
        id: string,
    ): CancelablePromise<Array<InvoiceItemResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/{id}/items',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get invoice item by ID
     * @param id
     * @returns InvoiceItemResponseDto Invoice item retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetInvoiceItem(
        id: string,
    ): CancelablePromise<InvoiceItemResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/items/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update invoice item
     * @param id
     * @param requestBody
     * @returns InvoiceItemResponseDto Invoice item updated successfully
     * @throws ApiError
     */
    public invoiceControllerUpdateInvoiceItem(
        id: string,
        requestBody: UpdateInvoiceItemDto,
    ): CancelablePromise<InvoiceItemResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/invoices/items/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Remove invoice item
     * @param id
     * @returns InvoiceItemResponseDto Invoice item removed successfully
     * @throws ApiError
     */
    public invoiceControllerRemoveInvoiceItem(
        id: string,
    ): CancelablePromise<InvoiceItemResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/invoices/items/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Record payment for invoice
     * @param id
     * @param requestBody
     * @returns InvoicePaymentResponseDto Payment recorded successfully
     * @throws ApiError
     */
    public invoiceControllerRecordPayment(
        id: string,
        requestBody: CreateInvoicePaymentDto,
    ): CancelablePromise<InvoicePaymentResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/invoices/{id}/payments',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get payments for invoice
     * @param id
     * @returns InvoicePaymentResponseDto Payments retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetPaymentsByInvoice(
        id: string,
    ): CancelablePromise<Array<InvoicePaymentResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/{id}/payments',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get payment by ID
     * @param id
     * @returns InvoicePaymentResponseDto Payment retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetPayment(
        id: string,
    ): CancelablePromise<InvoicePaymentResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/payments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update payment
     * @param id
     * @param requestBody
     * @returns InvoicePaymentResponseDto Payment updated successfully
     * @throws ApiError
     */
    public invoiceControllerUpdatePayment(
        id: string,
        requestBody: UpdateInvoicePaymentDto,
    ): CancelablePromise<InvoicePaymentResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/invoices/payments/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete payment
     * @param id
     * @returns InvoicePaymentResponseDto Payment deleted successfully
     * @throws ApiError
     */
    public invoiceControllerDeletePayment(
        id: string,
    ): CancelablePromise<InvoicePaymentResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/invoices/payments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get payment summary for invoice
     * @param id
     * @returns any Payment summary retrieved successfully
     * @throws ApiError
     */
    public invoiceControllerGetPaymentSummary(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/invoices/{id}/payment-summary',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Create a refund for invoice
     * @param id
     * @param requestBody
     * @returns InvoiceRefundResponseDto Refund created successfully
     * @throws ApiError
     */
    public invoiceControllerCreateRefund(
        id: string,
        requestBody: CreateInvoiceRefundDto,
    ): CancelablePromise<InvoiceRefundResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/invoices/{id}/refunds',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Process full refund for invoice
     * @param id
     * @returns InvoiceRefundResponseDto Full refund processed successfully
     * @throws ApiError
     */
    public invoiceControllerProcessFullRefund(
        id: string,
    ): CancelablePromise<InvoiceRefundResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/invoices/{id}/refunds/full',
            path: {
                'id': id,
            },
        });
    }
}
