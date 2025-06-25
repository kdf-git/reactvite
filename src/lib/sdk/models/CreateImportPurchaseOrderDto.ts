/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePurchaseOrderItemDto } from './CreatePurchaseOrderItemDto';
export type CreateImportPurchaseOrderDto = {
    /**
     * Purchase order number
     */
    poNumber: string;
    /**
     * Branch ID
     */
    branchId: string;
    /**
     * Vendor ID
     */
    vendorId: string;
    /**
     * Order date
     */
    orderDate: string;
    /**
     * Expected delivery date
     */
    expectedDate?: string;
    /**
     * Import declaration number
     */
    importDeclarationNo: string;
    /**
     * Import entry date
     */
    importEntryDate: string;
    /**
     * Customs agent name
     */
    importCustomsAgent?: string;
    /**
     * Purchase order items
     */
    items: Array<CreatePurchaseOrderItemDto>;
    /**
     * Payment terms
     */
    paymentTerms?: string;
    /**
     * Payment method
     */
    paymentMethod?: string;
    /**
     * Delivery address
     */
    deliveryAddress?: string;
    /**
     * Contact person
     */
    contactPerson?: string;
    /**
     * Contact phone
     */
    contactPhone?: string;
    /**
     * Reference number
     */
    referenceNumber?: string;
    /**
     * Terms and conditions
     */
    terms?: string;
    /**
     * Additional notes
     */
    notes?: string;
    /**
     * Total amount
     */
    totalAmount: number;
    /**
     * Subtotal amount
     */
    subtotalAmount?: number;
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
};

