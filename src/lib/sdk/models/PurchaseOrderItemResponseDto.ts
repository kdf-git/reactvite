/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PurchaseOrderItemResponseDto = {
    /**
     * Purchase order item ID
     */
    id: string;
    /**
     * Purchase order ID
     */
    purchaseOrderId: string;
    /**
     * Stock item ID
     */
    stockItemId: string;
    /**
     * Stock item details
     */
    stockItem?: Record<string, any>;
    /**
     * Item description override
     */
    description?: string;
    /**
     * Quantity ordered
     */
    quantity: number;
    /**
     * Unit cost
     */
    unitCost: number;
    /**
     * Total amount for this item
     */
    totalAmount: number;
    /**
     * Tax rate percentage
     */
    taxRate: number;
    /**
     * Tax amount
     */
    taxAmount: number;
    /**
     * Discount rate percentage
     */
    discountRate: number;
    /**
     * Discount amount
     */
    discountAmount: number;
    /**
     * Item notes
     */
    notes?: string;
    /**
     * Quantity received so far
     */
    receivedQuantity: number;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

