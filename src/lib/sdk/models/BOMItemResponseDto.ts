/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BOMItemResponseDto = {
    /**
     * Unique identifier of the BOM item
     */
    id: string;
    /**
     * ID of the BOM this item belongs to
     */
    bomId: string;
    /**
     * ID of the stock item
     */
    stockItemId: string;
    /**
     * Quantity of this stock item required in the BOM
     */
    quantity: number;
    /**
     * Date when the BOM item was created
     */
    createdAt: string;
    /**
     * Date when the BOM item was last updated
     */
    updatedAt: string;
    /**
     * ID of the merchant who owns this BOM item
     */
    merchantId: string;
    /**
     * Details of the stock item
     */
    stockItem?: Record<string, any>;
};

