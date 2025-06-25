/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CategoryResponseDto = {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Merchant ID that owns this category
     */
    merchantId: string;
    /**
     * Name of the category
     */
    name: string;
    /**
     * Category description
     */
    description?: string;
    /**
     * Whether this category is active
     */
    isActive: boolean;
    /**
     * Number of products in this category
     */
    productCount: number;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

