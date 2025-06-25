/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreatePurchaseOrderItemDto = {
    /**
     * Stock item ID
     */
    stockItemId: string;
    /**
     * Item description override
     */
    description?: string;
    /**
     * Quantity to order
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
    taxRate?: number;
    /**
     * Tax amount
     */
    taxAmount?: number;
    /**
     * Discount rate percentage
     */
    discountRate?: number;
    /**
     * Discount amount
     */
    discountAmount?: number;
    /**
     * Item notes
     */
    notes?: string;
};

