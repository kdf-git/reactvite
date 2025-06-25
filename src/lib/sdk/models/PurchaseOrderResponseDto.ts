/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseOrderItemResponseDto } from './PurchaseOrderItemResponseDto';
export type PurchaseOrderResponseDto = {
    /**
     * Purchase order ID
     */
    id: string;
    /**
     * Merchant ID
     */
    merchantId: string;
    /**
     * Merchant details
     */
    merchant?: Record<string, any>;
    /**
     * Branch ID
     */
    branchId: string;
    /**
     * Branch details
     */
    branch?: Record<string, any>;
    /**
     * Vendor ID
     */
    vendorId: string;
    /**
     * Vendor details
     */
    vendor?: Record<string, any>;
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
    status: PurchaseOrderResponseDto.status;
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
    taxAmount: number;
    /**
     * Discount amount
     */
    discountAmount: number;
    /**
     * Shipping amount
     */
    shippingAmount: number;
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
     * Delivery address
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
    items?: Array<PurchaseOrderItemResponseDto>;
    /**
     * User who created the PO
     */
    createdBy?: string;
    /**
     * User who approved the PO
     */
    approvedBy?: string;
    /**
     * Approval timestamp
     */
    approvedAt?: string;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};
export namespace PurchaseOrderResponseDto {
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

