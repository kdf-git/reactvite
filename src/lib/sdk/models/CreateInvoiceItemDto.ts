/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateInvoiceItemDto = {
    /**
     * Product ID
     */
    productId: string;
    /**
     * Item description override
     */
    description?: string;
    /**
     * Quantity
     */
    quantity: number;
    /**
     * Unit price
     */
    unitPrice: number;
    /**
     * Tax rate percentage
     */
    taxRate?: number;
    /**
     * Discount amount
     */
    discountAmount?: number;
};

