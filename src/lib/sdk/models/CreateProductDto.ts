/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateProductDto = {
    /**
     * Merchant ID that owns this product
     */
    merchantId: string;
    /**
     * Name of the product
     */
    name: string;
    /**
     * Unique product code (auto-generated for Kenyan merchants)
     */
    code?: string;
    /**
     * Product description
     */
    description?: string;
    /**
     * Product barcode
     */
    barcode?: string;
    /**
     * Product SKU
     */
    sku?: string;
    /**
     * Product subcategory
     */
    subcategory?: string;
    /**
     * KRA item code reference
     */
    kraItemCode?: string;
    /**
     * Category ID for the product
     */
    categoryId?: string;
    /**
     * Unit of measure ID (reference to UnitOfMeasure entity)
     */
    unitOfMeasureId: string;
    /**
     * Product type
     */
    productType?: CreateProductDto.productType;
    /**
     * Whether this product tracks inventory
     */
    trackInventory?: boolean;
    /**
     * Vendor ID for this product
     */
    vendorId?: string;
    /**
     * Cost price of the product
     */
    costPrice: number;
    /**
     * Selling price of the product
     */
    sellingPrice: number;
    /**
     * Tax rate for the product
     */
    taxRate: number;
    /**
     * Current stock level
     */
    stockLevel: number;
    /**
     * Reorder level for this product
     */
    reorderLevel: number;
    /**
     * Whether this product is active
     */
    isActive: boolean;
    /**
     * Whether this product has a Bill of Materials
     */
    hasBom: boolean;
    /**
     * URL to product image
     */
    imageUrl?: string;
    /**
     * Whether this is an imported product
     */
    isImported: boolean;
    /**
     * Task code for the import
     */
    importTaskCode?: string;
    /**
     * Declaration date for import
     */
    importDeclarationDate?: string;
    /**
     * Item sequence number for import
     */
    importItemSequence?: number;
    /**
     * HS code of the imported item
     */
    importHsCode?: string;
    /**
     * Import item status code
     */
    importItemStatusCode?: string;
    /**
     * Import remarks
     */
    importRemark?: string;
    /**
     * Batch number for import tracking
     */
    importBatchNumber?: string;
    /**
     * KRA Tax Type ID (for Kenya merchants)
     */
    kraTaxTypeId?: string;
    /**
     * KRA Packaging Unit ID (for Kenya merchants)
     */
    kraPackagingUnitId?: string;
    /**
     * KRA Unit of Measurement ID (for Kenya merchants)
     */
    kraUnitOfMeasurementId?: string;
    /**
     * KRA Origin Nation Code (for Kenya merchants)
     */
    kraOriginNationCode?: string;
    /**
     * KRA Item Classification Code (for Kenya merchants)
     */
    kraItemClassificationCode?: string;
    /**
     * KRA Product Type (for Kenya merchants)
     */
    kraProductType?: CreateProductDto.kraProductType;
};
export namespace CreateProductDto {
    /**
     * Product type
     */
    export enum productType {
        STORABLE_PRODUCT = 'STORABLE_PRODUCT',
        KIT = 'KIT',
        SERVICE = 'SERVICE',
    }
    /**
     * KRA Product Type (for Kenya merchants)
     */
    export enum kraProductType {
        RAW_MATERIAL = 'RAW_MATERIAL',
        FINISHED_PRODUCT = 'FINISHED_PRODUCT',
        SERVICE_NO_STOCK = 'SERVICE_NO_STOCK',
    }
}

