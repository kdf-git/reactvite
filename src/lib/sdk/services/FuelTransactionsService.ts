/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateFuelTransactionDto } from '../models/CreateFuelTransactionDto';
import type { FuelTransaction } from '../models/FuelTransaction';
import type { UpdateFuelTransactionDto } from '../models/UpdateFuelTransactionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FuelTransactionsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new fuel transaction
     * @param requestBody
     * @returns FuelTransaction The fuel transaction has been successfully created.
     * @throws ApiError
     */
    public fuelTransactionControllerCreate(
        requestBody: CreateFuelTransactionDto,
    ): CancelablePromise<FuelTransaction> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/fuel-transactions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all fuel transactions with filtering and pagination
     * @param customerPin Filter by customer PIN
     * @param startDate Filter by start date range
     * @param endDate Filter by end date range
     * @param pumpNumber Filter by pump number
     * @param productName Filter by product name
     * @param attendantName Filter by attendant name
     * @param page Page number (starts from 1)
     * @param limit Number of items per page
     * @param sortBy Field to sort by
     * @param sortOrder Sort order (asc or desc)
     * @returns FuelTransaction Return all fuel transactions.
     * @throws ApiError
     */
    public fuelTransactionControllerFindAll(
        customerPin?: string,
        startDate?: string,
        endDate?: string,
        pumpNumber?: number,
        productName?: string,
        attendantName?: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'transactionDateTime',
        sortOrder: 'asc' | 'desc' = 'desc',
    ): CancelablePromise<Array<FuelTransaction>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/fuel-transactions',
            query: {
                'customerPin': customerPin,
                'startDate': startDate,
                'endDate': endDate,
                'pumpNumber': pumpNumber,
                'productName': productName,
                'attendantName': attendantName,
                'page': page,
                'limit': limit,
                'sortBy': sortBy,
                'sortOrder': sortOrder,
            },
        });
    }
    /**
     * Get a fuel transaction by id
     * @param id
     * @returns FuelTransaction Return the fuel transaction.
     * @throws ApiError
     */
    public fuelTransactionControllerFindOne(
        id: string,
    ): CancelablePromise<FuelTransaction> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/fuel-transactions/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Fuel transaction not found.`,
            },
        });
    }
    /**
     * Update a fuel transaction
     * @param id
     * @param requestBody
     * @returns FuelTransaction The fuel transaction has been successfully updated.
     * @throws ApiError
     */
    public fuelTransactionControllerUpdate(
        id: string,
        requestBody: UpdateFuelTransactionDto,
    ): CancelablePromise<FuelTransaction> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/fuel-transactions/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Fuel transaction not found.`,
            },
        });
    }
    /**
     * Delete a fuel transaction
     * @param id
     * @returns any The fuel transaction has been successfully deleted.
     * @throws ApiError
     */
    public fuelTransactionControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/fuel-transactions/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Fuel transaction not found.`,
            },
        });
    }
}
