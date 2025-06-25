/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePaymentModeDto } from '../models/CreatePaymentModeDto';
import type { PaymentModeResponseDto } from '../models/PaymentModeResponseDto';
import type { UpdatePaymentModeDto } from '../models/UpdatePaymentModeDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class PaymentModesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new payment mode
     * @param requestBody
     * @returns PaymentModeResponseDto Payment mode created successfully
     * @throws ApiError
     */
    public paymentModeControllerCreate(
        requestBody: CreatePaymentModeDto,
    ): CancelablePromise<PaymentModeResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/payment-modes',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Payment mode with same name already exists`,
            },
        });
    }
    /**
     * Get all payment modes for a merchant
     * @param merchantId Merchant ID
     * @param isActive Filter by active status
     * @returns PaymentModeResponseDto Payment modes retrieved successfully
     * @throws ApiError
     */
    public paymentModeControllerFindAll(
        merchantId: string,
        isActive?: boolean,
    ): CancelablePromise<Array<PaymentModeResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/payment-modes',
            query: {
                'merchantId': merchantId,
                'isActive': isActive,
            },
        });
    }
    /**
     * Get a payment mode by ID
     * @param id
     * @returns PaymentModeResponseDto Payment mode retrieved successfully
     * @throws ApiError
     */
    public paymentModeControllerFindOne(
        id: string,
    ): CancelablePromise<PaymentModeResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/payment-modes/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Payment mode not found`,
            },
        });
    }
    /**
     * Update a payment mode
     * @param id
     * @param requestBody
     * @returns PaymentModeResponseDto Payment mode updated successfully
     * @throws ApiError
     */
    public paymentModeControllerUpdate(
        id: string,
        requestBody: UpdatePaymentModeDto,
    ): CancelablePromise<PaymentModeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/payment-modes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Payment mode not found`,
                409: `Payment mode with same name already exists`,
            },
        });
    }
    /**
     * Delete a payment mode
     * @param id
     * @returns any Payment mode deleted successfully
     * @throws ApiError
     */
    public paymentModeControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/payment-modes/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Cannot delete default payment modes or payment modes in use`,
                404: `Payment mode not found`,
            },
        });
    }
    /**
     * Activate a payment mode
     * @param id
     * @returns PaymentModeResponseDto Payment mode activated successfully
     * @throws ApiError
     */
    public paymentModeControllerActivate(
        id: string,
    ): CancelablePromise<PaymentModeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/payment-modes/{id}/activate',
            path: {
                'id': id,
            },
            errors: {
                404: `Payment mode not found`,
            },
        });
    }
    /**
     * Deactivate a payment mode
     * @param id
     * @returns PaymentModeResponseDto Payment mode deactivated successfully
     * @throws ApiError
     */
    public paymentModeControllerDeactivate(
        id: string,
    ): CancelablePromise<PaymentModeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/payment-modes/{id}/deactivate',
            path: {
                'id': id,
            },
            errors: {
                404: `Payment mode not found`,
            },
        });
    }
    /**
     * Set a payment mode as the default
     * @param id
     * @returns PaymentModeResponseDto Payment mode set as default successfully
     * @throws ApiError
     */
    public paymentModeControllerSetAsDefault(
        id: string,
    ): CancelablePromise<PaymentModeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/payment-modes/{id}/set-default',
            path: {
                'id': id,
            },
            errors: {
                404: `Payment mode not found`,
            },
        });
    }
    /**
     * Seed default payment modes for a merchant
     * @param merchantId
     * @returns PaymentModeResponseDto Default payment modes seeded successfully
     * @throws ApiError
     */
    public paymentModeControllerSeedDefaultPaymentModes(
        merchantId: string,
    ): CancelablePromise<Array<PaymentModeResponseDto>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/payment-modes/seed/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
        });
    }
}
