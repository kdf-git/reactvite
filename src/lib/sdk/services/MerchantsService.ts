/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateMerchantDto } from '../models/CreateMerchantDto';
import type { MerchantResponseDto } from '../models/MerchantResponseDto';
import type { UpdateMerchantDto } from '../models/UpdateMerchantDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class MerchantsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new merchant
     * @param requestBody
     * @returns MerchantResponseDto The merchant has been successfully created.
     * @throws ApiError
     */
    public merchantControllerCreate(
        requestBody: CreateMerchantDto,
    ): CancelablePromise<MerchantResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/merchants',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all merchants
     * @returns MerchantResponseDto Returns all merchants
     * @throws ApiError
     */
    public merchantControllerFindAll(): CancelablePromise<Array<MerchantResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/merchants',
        });
    }
    /**
     * Get a merchant by id
     * @param id
     * @returns MerchantResponseDto Returns the merchant
     * @throws ApiError
     */
    public merchantControllerFindOne(
        id: string,
    ): CancelablePromise<MerchantResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/merchants/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Merchant not found`,
            },
        });
    }
    /**
     * Update a merchant
     * @param id
     * @param requestBody
     * @returns MerchantResponseDto The merchant has been successfully updated.
     * @throws ApiError
     */
    public merchantControllerUpdate(
        id: string,
        requestBody: UpdateMerchantDto,
    ): CancelablePromise<MerchantResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/merchants/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Merchant not found`,
            },
        });
    }
    /**
     * Delete a merchant
     * @param id
     * @returns MerchantResponseDto The merchant has been successfully deleted.
     * @throws ApiError
     */
    public merchantControllerRemove(
        id: string,
    ): CancelablePromise<MerchantResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/merchants/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Merchant not found`,
            },
        });
    }
    /**
     * Toggle merchant active status
     * @param id
     * @returns MerchantResponseDto The merchant status has been successfully updated.
     * @throws ApiError
     */
    public merchantControllerToggleStatus(
        id: string,
    ): CancelablePromise<MerchantResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/merchants/{id}/status',
            path: {
                'id': id,
            },
            errors: {
                404: `Merchant not found`,
            },
        });
    }
    /**
     * Update merchant tax integration type
     * @param id
     * @param requestBody
     * @returns MerchantResponseDto The tax integration type has been successfully updated.
     * @throws ApiError
     */
    public merchantControllerUpdateTaxIntegrationType(
        id: string,
        requestBody: {
            /**
             * Tax integration type
             */
            taxIntegrationType: 'NONE' | 'KRA' | 'MALAYSIA_EINVOICE';
        },
    ): CancelablePromise<MerchantResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/merchants/{id}/tax-integration',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Merchant not found`,
            },
        });
    }
}
