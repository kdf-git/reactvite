/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateProductDto } from '../models/CreateProductDto';
import type { ProductResponseDto } from '../models/ProductResponseDto';
import type { UpdateProductDto } from '../models/UpdateProductDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ProductsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new product
     * @param requestBody
     * @returns ProductResponseDto The product has been successfully created.
     * @throws ApiError
     */
    public productControllerCreate(
        requestBody: CreateProductDto,
    ): CancelablePromise<ProductResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/products',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all products with optional filtering
     * @param merchantId Filter by merchant ID
     * @param categoryId Filter by category ID
     * @param productType Filter by product type
     * @param trackInventory Filter by inventory tracking
     * @param search Search products by name, code, or description
     * @returns ProductResponseDto Returns all products
     * @throws ApiError
     */
    public productControllerFindAll(
        merchantId?: string,
        categoryId?: string,
        productType?: 'STORABLE_PRODUCT' | 'KIT' | 'SERVICE',
        trackInventory?: boolean,
        search?: string,
    ): CancelablePromise<Array<ProductResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/products',
            query: {
                'merchantId': merchantId,
                'categoryId': categoryId,
                'productType': productType,
                'trackInventory': trackInventory,
                'search': search,
            },
        });
    }
    /**
     * Get products by type
     * @param productType
     * @param merchantId
     * @returns ProductResponseDto Returns products of specified type
     * @throws ApiError
     */
    public productControllerFindByProductType(
        productType: string,
        merchantId: string,
    ): CancelablePromise<Array<ProductResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/products/types/{productType}',
            path: {
                'productType': productType,
            },
            query: {
                'merchantId': merchantId,
            },
        });
    }
    /**
     * Get all inventory-tracked products
     * @param merchantId Filter by merchant ID
     * @returns ProductResponseDto Returns inventory-tracked products
     * @throws ApiError
     */
    public productControllerFindInventoryTracked(
        merchantId?: string,
    ): CancelablePromise<Array<ProductResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/products/inventory-tracked',
            query: {
                'merchantId': merchantId,
            },
        });
    }
    /**
     * Get products suitable for BOM components
     * @param merchantId
     * @returns ProductResponseDto Returns storable products that can be used as BOM components
     * @throws ApiError
     */
    public productControllerFindBomComponentCandidates(
        merchantId: string,
    ): CancelablePromise<Array<ProductResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/products/bom-components/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
        });
    }
    /**
     * Get a product by id
     * @param id
     * @returns ProductResponseDto Returns the product
     * @throws ApiError
     */
    public productControllerFindOne(
        id: string,
    ): CancelablePromise<ProductResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/products/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Product not found`,
            },
        });
    }
    /**
     * Update a product
     * @param id
     * @param requestBody
     * @returns ProductResponseDto The product has been successfully updated.
     * @throws ApiError
     */
    public productControllerUpdate(
        id: string,
        requestBody: UpdateProductDto,
    ): CancelablePromise<ProductResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/products/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Product not found`,
            },
        });
    }
    /**
     * Delete a product
     * @param id
     * @returns ProductResponseDto The product has been successfully deleted.
     * @throws ApiError
     */
    public productControllerRemove(
        id: string,
    ): CancelablePromise<ProductResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/products/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Product not found`,
            },
        });
    }
    /**
     * Toggle product active status
     * @param id
     * @returns ProductResponseDto The product status has been successfully updated.
     * @throws ApiError
     */
    public productControllerToggleStatus(
        id: string,
    ): CancelablePromise<ProductResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/products/{id}/status',
            path: {
                'id': id,
            },
            errors: {
                404: `Product not found`,
            },
        });
    }
    /**
     * Update product stock based on BOM or inventory movements
     * @param id
     * @returns any Product stock has been updated successfully
     * @throws ApiError
     */
    public productControllerUpdateStock(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/products/{id}/stock/update',
            path: {
                'id': id,
            },
            errors: {
                404: `Product not found`,
            },
        });
    }
    /**
     * Submit product to KRA VSCU
     * @param id
     * @returns ProductResponseDto Product submitted to KRA successfully
     * @throws ApiError
     */
    public productControllerSubmitToKra(
        id: string,
    ): CancelablePromise<ProductResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/products/{id}/kra/submit',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid KRA data or merchant not eligible`,
                404: `Product not found`,
            },
        });
    }
}
