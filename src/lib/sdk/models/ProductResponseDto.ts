/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProductResponseDto = {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Merchant ID that owns this product
     */
    merchantId: string;
    /**
     * Name of the product
     */
    name: string;
    /**
     * Unique product code
     */
    code: string;
    /**
     * Product description
     */
    description?: string;
    /**
     * Category ID for the product
     */
    categoryId: string;
    /**
     * Category details
     */
    category?: Record<string, any>;
    /**
     * Product type
     */
    productType: string;
    /**
     * Whether this product tracks inventory
     */
    trackInventory: boolean;
    /**
     * Vendor ID for this product
     */
    vendorId?: string;
    /**
     * Vendor details
     */
    vendor?: Record<string, any>;
    /**
     * Product subcategory
     */
    subcategory?: string;
    /**
     * Product barcode
     */
    barcode?: string;
    /**
     * Product SKU
     */
    sku?: string;
    /**
     * Unit of measure details
     */
    unitOfMeasure: Record<string, any>;
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
     * Whether this product is active
     */
    isActive: boolean;
    /**
     * KRA item code reference
     */
    kraItemCode?: string;
    /**
     * Current stock level
     */
    stockLevel: number;
    /**
     * Reorder point level
     */
    reorderLevel?: number;
    /**
     * Whether this product has a Bill of Materials
     */
    hasBom: boolean;
    /**
     * Bill of Materials details (for KIT products)
     */
    billOfMaterials?: Array<string>;
    /**
     * URL to product image
     */
    imageUrl?: string;
    /**
     * Whether this is an imported product
     */
    isImported?: boolean;
    /**
     * Import task code
     */
    importTaskCode?: string;
    /**
     * Import declaration date
     */
    importDeclarationDate?: string;
    /**
     * Import item sequence
     */
    importItemSequence?: number;
    /**
     * Import HS code
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
     * Import batch number
     */
    importBatchNumber?: string;
    /**
     * KRA Tax Type ID
     */
    kraTaxTypeId?: string;
    /**
     * KRA Tax Type details
     */
    kraTaxType?: Record<string, any>;
    /**
     * KRA Packaging Unit ID
     */
    kraPackagingUnitId?: string;
    /**
     * KRA Packaging Unit details
     */
    kraPackagingUnit?: Record<string, any>;
    /**
     * KRA Unit of Measurement ID
     */
    kraUnitOfMeasurementId?: string;
    /**
     * KRA Unit of Measurement details
     */
    kraUnitOfMeasurement?: Record<string, any>;
    /**
     * KRA Origin Nation Code
     */
    kraOriginNationCode?: string;
    /**
     * KRA Item Classification Code
     */
    kraItemClassificationCode?: string;
    /**
     * Whether product is submitted to KRA
     */
    kraSubmitted?: boolean;
    /**
     * When product was submitted to KRA
     */
    kraSubmittedAt?: string;
    /**
     * Full KRA submission response
     */
    kraSubmissionData?: Record<string, any>;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

