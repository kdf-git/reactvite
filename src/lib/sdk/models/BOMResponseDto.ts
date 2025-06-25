/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BOMResponseDto = {
    /**
     * Unique identifier of the BOM
     */
    id: string;
    /**
     * ID of the product this BOM belongs to
     */
    productId: string;
    /**
     * Name of the Bill of Materials
     */
    name: string;
    /**
     * Description of the Bill of Materials
     */
    description?: string;
    /**
     * Whether this BOM is active
     */
    isActive: boolean;
    /**
     * Date when the BOM was created
     */
    createdAt: string;
    /**
     * Date when the BOM was last updated
     */
    updatedAt: string;
    /**
     * ID of the merchant who owns this BOM
     */
    merchantId: string;
};

