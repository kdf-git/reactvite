/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateVendorDto } from '../models/CreateVendorDto';
import type { UpdateVendorDto } from '../models/UpdateVendorDto';
import type { VendorResponseDto } from '../models/VendorResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class VendorsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new vendor
     * @param requestBody
     * @returns VendorResponseDto Vendor created successfully
     * @throws ApiError
     */
    public vendorControllerCreate(
        requestBody: CreateVendorDto,
    ): CancelablePromise<VendorResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/vendors',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                409: `Vendor with same name already exists`,
            },
        });
    }
    /**
     * Get all vendors for a merchant
     * @param merchantId Merchant ID
     * @returns VendorResponseDto Vendors retrieved successfully
     * @throws ApiError
     */
    public vendorControllerFindAll(
        merchantId: string,
    ): CancelablePromise<Array<VendorResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/vendors',
            query: {
                'merchantId': merchantId,
            },
        });
    }
    /**
     * Search vendors by name, contact person, email, or phone
     * @param merchantId
     * @param searchTerm
     * @returns VendorResponseDto Vendors found
     * @throws ApiError
     */
    public vendorControllerSearch(
        merchantId: string,
        searchTerm: string,
    ): CancelablePromise<Array<VendorResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/vendors/search/{merchantId}/{searchTerm}',
            path: {
                'merchantId': merchantId,
                'searchTerm': searchTerm,
            },
        });
    }
    /**
     * Get vendors by merchant ID
     * @param merchantId
     * @returns VendorResponseDto Vendors retrieved successfully
     * @throws ApiError
     */
    public vendorControllerFindByMerchant(
        merchantId: string,
    ): CancelablePromise<Array<VendorResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/vendors/merchant/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
        });
    }
    /**
     * Get a vendor by ID
     * @param id
     * @returns VendorResponseDto Vendor retrieved successfully
     * @throws ApiError
     */
    public vendorControllerFindOne(
        id: string,
    ): CancelablePromise<VendorResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/vendors/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Vendor not found`,
            },
        });
    }
    /**
     * Update a vendor
     * @param id
     * @param requestBody
     * @returns VendorResponseDto Vendor updated successfully
     * @throws ApiError
     */
    public vendorControllerUpdate(
        id: string,
        requestBody: UpdateVendorDto,
    ): CancelablePromise<VendorResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/vendors/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Vendor not found`,
                409: `Vendor with same name already exists`,
            },
        });
    }
    /**
     * Delete a vendor
     * @param id
     * @returns any Vendor deleted successfully
     * @throws ApiError
     */
    public vendorControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/vendors/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Vendor not found`,
                409: `Cannot delete vendor with existing purchases`,
            },
        });
    }
    /**
     * Activate a vendor
     * @param id
     * @returns VendorResponseDto Vendor activated successfully
     * @throws ApiError
     */
    public vendorControllerActivate(
        id: string,
    ): CancelablePromise<VendorResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/vendors/{id}/activate',
            path: {
                'id': id,
            },
            errors: {
                404: `Vendor not found`,
            },
        });
    }
    /**
     * Deactivate a vendor
     * @param id
     * @returns VendorResponseDto Vendor deactivated successfully
     * @throws ApiError
     */
    public vendorControllerDeactivate(
        id: string,
    ): CancelablePromise<VendorResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/vendors/{id}/deactivate',
            path: {
                'id': id,
            },
            errors: {
                404: `Vendor not found`,
            },
        });
    }
}
