/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateSubscriptionPaymentDto } from '../models/CreateSubscriptionPaymentDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class MerchantSubscriptionsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Get current merchant subscription details
     * @returns any Merchant subscription retrieved successfully
     * @throws ApiError
     */
    public merchantSubscriptionControllerGetMySubscription(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/merchant-subscriptions/my-subscription',
            errors: {
                404: `Merchant subscription not found`,
            },
        });
    }
    /**
     * Get my subscription payments history
     * @returns any Subscription payments retrieved successfully
     * @throws ApiError
     */
    public merchantSubscriptionControllerGetMyPayments(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/merchant-subscriptions/my-payments',
        });
    }
    /**
     * Create a new subscription payment
     * @param requestBody
     * @returns any Subscription payment created successfully
     * @throws ApiError
     */
    public merchantSubscriptionControllerCreatePayment(
        requestBody: CreateSubscriptionPaymentDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/merchant-subscriptions/create-payment',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid payment data`,
            },
        });
    }
}
