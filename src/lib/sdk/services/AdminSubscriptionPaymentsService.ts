/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSubscriptionPaymentDto } from '../models/CreateSubscriptionPaymentDto';
import type { ReviewSubscriptionPaymentDto } from '../models/ReviewSubscriptionPaymentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminSubscriptionPaymentsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public adminSubscriptionPaymentsControllerCreateSubscriptionPayment(
        requestBody: CreateSubscriptionPaymentDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/subscription-payments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any
     * @throws ApiError
     */
    public adminSubscriptionPaymentsControllerGetAllSubscriptionPayments(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/subscription-payments',
        });
    }
    /**
     * @param merchantId
     * @param country
     * @returns any
     * @throws ApiError
     */
    public adminSubscriptionPaymentsControllerGetPaymentStatistics(
        merchantId: string,
        country: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/subscription-payments/statistics',
            query: {
                'merchantId': merchantId,
                'country': country,
            },
        });
    }
    /**
     * @param merchantId
     * @returns any
     * @throws ApiError
     */
    public adminSubscriptionPaymentsControllerGetMerchantPayments(
        merchantId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/subscription-payments/merchant/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
        });
    }
    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public adminSubscriptionPaymentsControllerGetSubscriptionPaymentById(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/subscription-payments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public adminSubscriptionPaymentsControllerReviewSubscriptionPayment(
        id: string,
        requestBody: ReviewSubscriptionPaymentDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/admin/subscription-payments/{id}/review',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param gatewayPaymentId
     * @returns any
     * @throws ApiError
     */
    public adminSubscriptionPaymentsControllerHandlePaymentWebhook(
        gatewayPaymentId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/subscription-payments/webhook/{gatewayPaymentId}',
            path: {
                'gatewayPaymentId': gatewayPaymentId,
            },
        });
    }
}
