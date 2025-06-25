/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AccountResponseDto } from '../models/AccountResponseDto';
import type { CreateAccountDto } from '../models/CreateAccountDto';
import type { UpdateAccountDto } from '../models/UpdateAccountDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AccountsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new account
     * @param requestBody
     * @returns AccountResponseDto Account created successfully
     * @throws ApiError
     */
    public accountControllerCreate(
        requestBody: CreateAccountDto,
    ): CancelablePromise<AccountResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/accounts',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all accounts for a merchant
     * @param merchantId
     * @param accountType
     * @param isActive
     * @returns AccountResponseDto Accounts retrieved successfully
     * @throws ApiError
     */
    public accountControllerFindAll(
        merchantId: string,
        accountType: string,
        isActive: boolean,
    ): CancelablePromise<Array<AccountResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/accounts',
            query: {
                'merchantId': merchantId,
                'accountType': accountType,
                'isActive': isActive,
            },
        });
    }
    /**
     * Get account hierarchy for a merchant
     * @param merchantId
     * @returns AccountResponseDto Account hierarchy retrieved successfully
     * @throws ApiError
     */
    public accountControllerGetHierarchy(
        merchantId: string,
    ): CancelablePromise<Array<AccountResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/accounts/hierarchy/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
        });
    }
    /**
     * Get trial balance for a merchant
     * @param merchantId
     * @param asOfDate
     * @returns any Trial balance retrieved successfully
     * @throws ApiError
     */
    public accountControllerGetTrialBalance(
        merchantId: string,
        asOfDate: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/accounts/trial-balance/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
            query: {
                'asOfDate': asOfDate,
            },
        });
    }
    /**
     * Get accounts by type for a merchant
     * @param merchantId
     * @param accountType
     * @returns AccountResponseDto Accounts retrieved successfully
     * @throws ApiError
     */
    public accountControllerGetByType(
        merchantId: string,
        accountType: string,
    ): CancelablePromise<Array<AccountResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/accounts/by-type/{merchantId}/{accountType}',
            path: {
                'merchantId': merchantId,
                'accountType': accountType,
            },
        });
    }
    /**
     * Get account by code
     * @param merchantId
     * @param accountCode
     * @returns AccountResponseDto Account retrieved successfully
     * @throws ApiError
     */
    public accountControllerFindByCode(
        merchantId: string,
        accountCode: string,
    ): CancelablePromise<AccountResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/accounts/code/{merchantId}/{accountCode}',
            path: {
                'merchantId': merchantId,
                'accountCode': accountCode,
            },
        });
    }
    /**
     * Get account by ID
     * @param id
     * @returns AccountResponseDto Account retrieved successfully
     * @throws ApiError
     */
    public accountControllerFindById(
        id: string,
    ): CancelablePromise<AccountResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/accounts/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update an account
     * @param id
     * @param requestBody
     * @returns AccountResponseDto Account updated successfully
     * @throws ApiError
     */
    public accountControllerUpdate(
        id: string,
        requestBody: UpdateAccountDto,
    ): CancelablePromise<AccountResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/accounts/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete an account
     * @param id
     * @returns any Account deleted successfully
     * @throws ApiError
     */
    public accountControllerDelete(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/accounts/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Seed default accounts for a merchant
     * @param merchantId
     * @returns AccountResponseDto Default accounts seeded successfully
     * @throws ApiError
     */
    public accountControllerSeedDefaultAccounts(
        merchantId: string,
    ): CancelablePromise<Array<AccountResponseDto>> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/accounts/seed/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
        });
    }
}
