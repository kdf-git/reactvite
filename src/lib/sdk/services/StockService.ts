/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BOMItemResponseDto } from '../models/BOMItemResponseDto';
import type { BOMResponseDto } from '../models/BOMResponseDto';
import type { CreateBOMDto } from '../models/CreateBOMDto';
import type { CreateBOMItemDto } from '../models/CreateBOMItemDto';
import type { StockAdjustmentReasonResponseDto } from '../models/StockAdjustmentReasonResponseDto';
import type { UnitOfMeasureResponseDto } from '../models/UnitOfMeasureResponseDto';
import type { UpdateBOMDto } from '../models/UpdateBOMDto';
import type { UpdateBOMItemDto } from '../models/UpdateBOMItemDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class StockService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get active stock adjustment reasons
     * @returns StockAdjustmentReasonResponseDto Returns active stock adjustment reasons
     * @throws ApiError
     */
    public stockControllerGetStockAdjustmentReasons(): CancelablePromise<Array<StockAdjustmentReasonResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/stock/adjustment-reasons',
        });
    }
    /**
     * Get active units of measure
     * @returns UnitOfMeasureResponseDto Returns active units of measure
     * @throws ApiError
     */
    public stockControllerGetUnitsOfMeasure(): CancelablePromise<Array<UnitOfMeasureResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/stock/units-of-measure',
        });
    }
    /**
     * Search units of measure
     * @param searchTerm
     * @param limit
     * @returns UnitOfMeasureResponseDto Returns matching units of measure
     * @throws ApiError
     */
    public stockControllerSearchUnitsOfMeasure(
        searchTerm: string,
        limit: string,
    ): CancelablePromise<Array<UnitOfMeasureResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/stock/units-of-measure/search/{searchTerm}',
            path: {
                'searchTerm': searchTerm,
            },
            query: {
                'limit': limit,
            },
        });
    }
    /**
     * Generate a unique stock code
     * @returns any
     * @throws ApiError
     */
    public stockControllerGenerateStockCode(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/stock/codes/generate',
        });
    }
    /**
     * Create a new Bill of Materials
     * @param requestBody
     * @returns BOMResponseDto BOM created successfully
     * @throws ApiError
     */
    public stockControllerCreateBom(
        requestBody: CreateBOMDto,
    ): CancelablePromise<BOMResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/stock/bom',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid BOM data`,
            },
        });
    }
    /**
     * Get all BOMs for a product
     * @param productId
     * @returns BOMResponseDto Returns BOMs for the product
     * @throws ApiError
     */
    public stockControllerGetBoMsByProduct(
        productId: string,
    ): CancelablePromise<Array<BOMResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/stock/bom',
            query: {
                'productId': productId,
            },
        });
    }
    /**
     * Get a Bill of Materials by ID
     * @param id
     * @returns BOMResponseDto Returns the BOM
     * @throws ApiError
     */
    public stockControllerGetBom(
        id: string,
    ): CancelablePromise<BOMResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/stock/bom/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `BOM not found`,
            },
        });
    }
    /**
     * Update a Bill of Materials
     * @param id
     * @param requestBody
     * @returns BOMResponseDto BOM updated successfully
     * @throws ApiError
     */
    public stockControllerUpdateBom(
        id: string,
        requestBody: UpdateBOMDto,
    ): CancelablePromise<BOMResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/stock/bom/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `BOM not found`,
            },
        });
    }
    /**
     * Delete a Bill of Materials
     * @param id
     * @returns BOMResponseDto BOM deleted successfully
     * @throws ApiError
     */
    public stockControllerDeleteBom(
        id: string,
    ): CancelablePromise<BOMResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/stock/bom/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `BOM not found`,
            },
        });
    }
    /**
     * Add an item to a Bill of Materials
     * @param bomId
     * @param requestBody
     * @returns BOMItemResponseDto BOM item added successfully
     * @throws ApiError
     */
    public stockControllerAddBomItem(
        bomId: string,
        requestBody: CreateBOMItemDto,
    ): CancelablePromise<BOMItemResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/stock/bom/{bomId}/items',
            path: {
                'bomId': bomId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `BOM or product not found`,
            },
        });
    }
    /**
     * Get all items in a Bill of Materials
     * @param bomId
     * @returns BOMItemResponseDto Returns BOM items
     * @throws ApiError
     */
    public stockControllerGetBomItems(
        bomId: string,
    ): CancelablePromise<Array<BOMItemResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/stock/bom/{bomId}/items',
            path: {
                'bomId': bomId,
            },
            errors: {
                404: `BOM not found`,
            },
        });
    }
    /**
     * Update a BOM item quantity
     * @param id
     * @param requestBody
     * @returns BOMItemResponseDto BOM item updated successfully
     * @throws ApiError
     */
    public stockControllerUpdateBomItem(
        id: string,
        requestBody: UpdateBOMItemDto,
    ): CancelablePromise<BOMItemResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/stock/bom/items/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `BOM item not found`,
            },
        });
    }
    /**
     * Delete a BOM item
     * @param id
     * @returns BOMItemResponseDto BOM item deleted successfully
     * @throws ApiError
     */
    public stockControllerDeleteBomItem(
        id: string,
    ): CancelablePromise<BOMItemResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/stock/bom/items/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `BOM item not found`,
            },
        });
    }
    /**
     * Submit product stock movement to KRA VSCU
     * @param id
     * @returns any Product stock movement submitted to KRA successfully
     * @throws ApiError
     */
    public stockControllerSubmitProductStockMovementToKra(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/stock/movements/{id}/submit-to-kra',
            path: {
                'id': id,
            },
        });
    }
}
