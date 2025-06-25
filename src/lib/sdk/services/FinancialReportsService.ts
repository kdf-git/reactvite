/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class FinancialReportsService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Generate balance sheet for a merchant
     * @param merchantId
     * @param endDate
     * @param includeInactive
     * @returns any Balance sheet generated successfully
     * @throws ApiError
     */
    public financialReportsControllerGetBalanceSheet(
        merchantId: string,
        endDate: string,
        includeInactive: boolean,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/financial-reports/balance-sheet/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
            query: {
                'endDate': endDate,
                'includeInactive': includeInactive,
            },
        });
    }
    /**
     * Generate income statement for a merchant
     * @param merchantId
     * @param startDate
     * @param endDate
     * @param includeInactive
     * @returns any Income statement generated successfully
     * @throws ApiError
     */
    public financialReportsControllerGetIncomeStatement(
        merchantId: string,
        startDate: string,
        endDate: string,
        includeInactive: boolean,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/financial-reports/income-statement/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
            query: {
                'startDate': startDate,
                'endDate': endDate,
                'includeInactive': includeInactive,
            },
        });
    }
    /**
     * Generate trial balance for a merchant
     * @param merchantId
     * @param endDate
     * @param includeInactive
     * @returns any Trial balance generated successfully
     * @throws ApiError
     */
    public financialReportsControllerGetTrialBalance(
        merchantId: string,
        endDate: string,
        includeInactive: boolean,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/financial-reports/trial-balance/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
            query: {
                'endDate': endDate,
                'includeInactive': includeInactive,
            },
        });
    }
    /**
     * Generate cash flow statement for a merchant
     * @param merchantId
     * @param startDate
     * @param endDate
     * @returns any Cash flow statement generated successfully
     * @throws ApiError
     */
    public financialReportsControllerGetCashFlowStatement(
        merchantId: string,
        startDate: string,
        endDate: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/financial-reports/cash-flow/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
            query: {
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Generate comprehensive financial summary for a merchant
     * @param merchantId
     * @param startDate
     * @param endDate
     * @param includeInactive
     * @returns any Financial summary generated successfully
     * @throws ApiError
     */
    public financialReportsControllerGetFinancialSummary(
        merchantId: string,
        startDate: string,
        endDate: string,
        includeInactive: boolean,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/financial-reports/summary/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
            query: {
                'startDate': startDate,
                'endDate': endDate,
                'includeInactive': includeInactive,
            },
        });
    }
}
