/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateImportPurchaseOrderDto } from '../models/CreateImportPurchaseOrderDto';
import type { CreatePurchaseOrderDto } from '../models/CreatePurchaseOrderDto';
import type { PurchaseOrderResponseDto } from '../models/PurchaseOrderResponseDto';
import type { ReceivePurchaseOrderDto } from '../models/ReceivePurchaseOrderDto';
import type { UpdatePurchaseOrderDto } from '../models/UpdatePurchaseOrderDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PurchaseOrdersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new purchase order
     * @param requestBody
     * @returns PurchaseOrderResponseDto Purchase order created successfully
     * @throws ApiError
     */
    public purchaseOrderControllerCreate(
        requestBody: CreatePurchaseOrderDto,
    ): CancelablePromise<PurchaseOrderResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/purchase-orders',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all purchase orders for the merchant
     * @param branchId Filter by branch ID
     * @param vendorId Filter by vendor ID
     * @param status Filter by status
     * @param search Search in PO number, reference, vendor name, or notes
     * @param dateFrom Filter by order date from (YYYY-MM-DD)
     * @param dateTo Filter by order date to (YYYY-MM-DD)
     * @param limit Limit number of results
     * @param offset Offset for pagination
     * @returns PurchaseOrderResponseDto Purchase orders retrieved successfully
     * @throws ApiError
     */
    public purchaseOrderControllerFindAll(
        branchId?: string,
        vendorId?: string,
        status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT_TO_VENDOR' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'CANCELLED' | 'CLOSED',
        search?: string,
        dateFrom?: string,
        dateTo?: string,
        limit?: number,
        offset?: number,
    ): CancelablePromise<Array<PurchaseOrderResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/purchase-orders',
            query: {
                'branchId': branchId,
                'vendorId': vendorId,
                'status': status,
                'search': search,
                'dateFrom': dateFrom,
                'dateTo': dateTo,
                'limit': limit,
                'offset': offset,
            },
        });
    }
    /**
     * Create a new import purchase order
     * Creates a purchase order specifically for imported items. Requires additional import-related fields and only allows imported stock items.
     * @param requestBody
     * @returns PurchaseOrderResponseDto Import purchase order created successfully
     * @throws ApiError
     */
    public purchaseOrderControllerCreateImportPurchaseOrder(
        requestBody: CreateImportPurchaseOrderDto,
    ): CancelablePromise<PurchaseOrderResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/purchase-orders/import',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Submit imported items to KRA VSCU
     * Registers imported items with KRA VSCU and updates their import status. Only available for Kenyan merchants with proper KRA configuration.
     * @returns any Items submitted successfully
     * @throws ApiError
     */
    public purchaseOrderControllerSubmitImportedItems(): CancelablePromise<Array<{
        stockItemId?: string;
        itemRegistrationResponse?: Record<string, any>;
        importUpdateResponse?: Record<string, any>;
    }>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/purchase-orders/import-items/submit',
        });
    }
    /**
     * Generate a new PO number
     * @returns any PO number generated successfully
     * @throws ApiError
     */
    public purchaseOrderControllerGeneratePoNumber(): CancelablePromise<{
        poNumber?: string;
    }> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/purchase-orders/generate-po-number',
        });
    }
    /**
     * Get a purchase order by ID
     * @param id
     * @returns PurchaseOrderResponseDto Purchase order retrieved successfully
     * @throws ApiError
     */
    public purchaseOrderControllerFindOne(
        id: string,
    ): CancelablePromise<PurchaseOrderResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/purchase-orders/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update a purchase order
     * @param id
     * @param requestBody
     * @returns PurchaseOrderResponseDto Purchase order updated successfully
     * @throws ApiError
     */
    public purchaseOrderControllerUpdate(
        id: string,
        requestBody: UpdatePurchaseOrderDto,
    ): CancelablePromise<PurchaseOrderResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/purchase-orders/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a purchase order
     * @param id
     * @returns any Purchase order deleted successfully
     * @throws ApiError
     */
    public purchaseOrderControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/purchase-orders/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get a purchase order by PO number
     * @param poNumber
     * @returns PurchaseOrderResponseDto Purchase order retrieved successfully
     * @throws ApiError
     */
    public purchaseOrderControllerFindByPoNumber(
        poNumber: string,
    ): CancelablePromise<PurchaseOrderResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/purchase-orders/po-number/{poNumber}',
            path: {
                'poNumber': poNumber,
            },
        });
    }
    /**
     * Update purchase order status
     * @param id
     * @returns PurchaseOrderResponseDto Purchase order status updated successfully
     * @throws ApiError
     */
    public purchaseOrderControllerUpdateStatus(
        id: string,
    ): CancelablePromise<PurchaseOrderResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/purchase-orders/{id}/status',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Receive items from a purchase order
     * Receive items from a purchase order. Creates stock movements automatically if enabled. For eligible merchants (Kenya merchants with proper KRA configuration), stock movements and fully received purchase orders are automatically submitted to KRA VSCU.
     * @param id
     * @param requestBody
     * @returns PurchaseOrderResponseDto Purchase order items received successfully. Stock movements and KRA submissions processed automatically for eligible merchants.
     * @throws ApiError
     */
    public purchaseOrderControllerReceivePurchaseOrder(
        id: string,
        requestBody: ReceivePurchaseOrderDto,
    ): CancelablePromise<PurchaseOrderResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/purchase-orders/{id}/receive',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Submit purchase order to KRA VSCU
     * @param id
     * @returns any Purchase order submitted to KRA successfully
     * @throws ApiError
     */
    public purchaseOrderControllerSubmitToKra(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/purchase-orders/{id}/kra/submit',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid KRA data or merchant not eligible`,
                404: `Purchase order not found`,
            },
        });
    }
}
