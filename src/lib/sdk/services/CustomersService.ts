/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateCustomerDto } from '../models/CreateCustomerDto';
import type { CustomerResponseDto } from '../models/CustomerResponseDto';
import type { RegisterKraCustomerDto } from '../models/RegisterKraCustomerDto';
import type { UpdateCustomerDto } from '../models/UpdateCustomerDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CustomersService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new customer
     * @param requestBody
     * @returns CustomerResponseDto The customer has been successfully created.
     * @throws ApiError
     */
    public customerControllerCreate(
        requestBody: CreateCustomerDto,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/customers',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid customer data or duplicate phone number`,
            },
        });
    }
    /**
     * Get all customers with optional filtering
     * @param merchantId Filter by merchant ID
     * @param type Filter by customer type
     * @param search Search by name, phone, email, etc.
     * @returns CustomerResponseDto Returns all customers
     * @throws ApiError
     */
    public customerControllerFindAll(
        merchantId?: string,
        type?: 'INDIVIDUAL' | 'BUSINESS' | 'GOVERNMENT' | 'FLEET',
        search?: string,
    ): CancelablePromise<Array<CustomerResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/customers',
            query: {
                'merchantId': merchantId,
                'type': type,
                'search': search,
            },
        });
    }
    /**
     * Get a customer by id
     * @param id
     * @returns CustomerResponseDto Returns the customer
     * @throws ApiError
     */
    public customerControllerFindOne(
        id: string,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/customers/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Customer not found`,
            },
        });
    }
    /**
     * Update a customer
     * @param id
     * @param requestBody
     * @returns CustomerResponseDto The customer has been successfully updated.
     * @throws ApiError
     */
    public customerControllerUpdate(
        id: string,
        requestBody: UpdateCustomerDto,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/customers/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid data or duplicate phone number`,
                404: `Customer not found`,
            },
        });
    }
    /**
     * Delete a customer
     * @param id
     * @returns CustomerResponseDto The customer has been successfully deleted.
     * @throws ApiError
     */
    public customerControllerRemove(
        id: string,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/customers/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Customer not found`,
            },
        });
    }
    /**
     * Get a customer by phone number for a specific merchant
     * @param phone
     * @param merchantId
     * @returns CustomerResponseDto Returns the customer
     * @throws ApiError
     */
    public customerControllerFindByPhone(
        phone: string,
        merchantId: string,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/customers/phone/{phone}/merchant/{merchantId}',
            path: {
                'phone': phone,
                'merchantId': merchantId,
            },
            errors: {
                404: `Customer not found`,
            },
        });
    }
    /**
     * Toggle customer active status
     * @param id
     * @returns CustomerResponseDto The customer status has been successfully updated.
     * @throws ApiError
     */
    public customerControllerToggleStatus(
        id: string,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/customers/{id}/status',
            path: {
                'id': id,
            },
            errors: {
                404: `Customer not found`,
            },
        });
    }
    /**
     * Update customer loyalty points
     * @param id
     * @returns CustomerResponseDto The customer loyalty points have been successfully updated.
     * @throws ApiError
     */
    public customerControllerUpdateLoyaltyPoints(
        id: string,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/customers/{id}/loyalty',
            path: {
                'id': id,
            },
            errors: {
                400: `Loyalty program not enabled for this customer`,
                404: `Customer not found`,
            },
        });
    }
    /**
     * Update customer credit balance
     * @param id
     * @returns CustomerResponseDto The customer credit balance has been successfully updated.
     * @throws ApiError
     */
    public customerControllerUpdateCreditBalance(
        id: string,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/customers/{id}/credit',
            path: {
                'id': id,
            },
            errors: {
                400: `Cannot reduce below 0 or exceed credit limit`,
                404: `Customer not found`,
            },
        });
    }
    /**
     * Record a customer purchase
     * @param id
     * @returns CustomerResponseDto The customer purchase has been successfully recorded.
     * @throws ApiError
     */
    public customerControllerRecordPurchase(
        id: string,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/customers/{id}/purchase',
            path: {
                'id': id,
            },
            errors: {
                404: `Customer not found`,
            },
        });
    }
    /**
     * Register customer with KRA VSCU
     * @param id
     * @param requestBody
     * @returns CustomerResponseDto Customer registered with KRA successfully
     * @throws ApiError
     */
    public customerControllerRegisterWithKra(
        id: string,
        requestBody: RegisterKraCustomerDto,
    ): CancelablePromise<CustomerResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/customers/{id}/kra/register',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Customer already registered with KRA or invalid data`,
                404: `Customer not found`,
            },
        });
    }
    /**
     * Get all KRA registered customers for a merchant
     * @param merchantId
     * @returns CustomerResponseDto Returns all KRA registered customers
     * @throws ApiError
     */
    public customerControllerGetKraRegisteredCustomers(
        merchantId: string,
    ): CancelablePromise<Array<CustomerResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/customers/kra/registered/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
        });
    }
}
