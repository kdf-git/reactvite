/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InvoiceItemResponseDto = {
    /**
     * Invoice item ID
     */
    id: string;
    /**
     * Invoice ID
     */
    invoiceId: string;
    /**
     * Product ID
     */
    productId: string;
    /**
     * Product details
     */
    product?: Record<string, any>;
    /**
     * Item description
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
     * Total amount
     */
    totalAmount: number;
    /**
     * Tax amount
     */
    taxAmount: number;
    /**
     * Discount amount
     */
    discountAmount: number;
    /**
     * Currency code
     */
    currencyCode: string;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

