/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePurchaseOrderItemDto } from './CreatePurchaseOrderItemDto';
export type CreatePurchaseOrderDto = {
    /**
     * Branch ID where the purchase order is for
     */
    branchId: string;
    /**
     * Vendor ID
     */
    vendorId: string;
    /**
     * Purchase order number
     */
    poNumber: string;
    /**
     * External reference number
     */
    referenceNumber?: string;
    /**
     * Order date
     */
    orderDate: string;
    /**
     * Expected delivery date
     */
    expectedDate?: string;
    /**
     * Purchase order status
     */
    status?: CreatePurchaseOrderDto.status;
    /**
     * Payment terms description
     */
    paymentTerms?: string;
    /**
     * Payment method
     */
    paymentMethod?: string;
    /**
     * Subtotal amount
     */
    subtotalAmount: number;
    /**
     * Tax amount
     */
    taxAmount?: number;
    /**
     * Discount amount
     */
    discountAmount?: number;
    /**
     * Shipping amount
     */
    shippingAmount?: number;
    /**
     * Total amount
     */
    totalAmount: number;
    /**
     * Purchase order notes
     */
    notes?: string;
    /**
     * Terms and conditions
     */
    terms?: string;
    /**
     * Delivery address if different from branch
     */
    deliveryAddress?: string;
    /**
     * Contact person for this PO
     */
    contactPerson?: string;
    /**
     * Contact phone for this PO
     */
    contactPhone?: string;
    /**
     * Purchase order items
     */
    items: Array<CreatePurchaseOrderItemDto>;
    /**
     * User who created the PO
     */
    createdBy?: string;
};
export namespace CreatePurchaseOrderDto {
    /**
     * Purchase order status
     */
    export enum status {
        DRAFT = 'DRAFT',
        PENDING_APPROVAL = 'PENDING_APPROVAL',
        APPROVED = 'APPROVED',
        SENT_TO_VENDOR = 'SENT_TO_VENDOR',
        PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
        FULLY_RECEIVED = 'FULLY_RECEIVED',
        CANCELLED = 'CANCELLED',
        CLOSED = 'CLOSED',
    }
}

