/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodesResponseDto } from '../models/CodesResponseDto';
import type { InitVscuDto } from '../models/InitVscuDto';
import type { InitVscuResponseDto } from '../models/InitVscuResponseDto';
import type { SaveBranchCustomersDto } from '../models/SaveBranchCustomersDto';
import type { SaveBranchInsurancesDto } from '../models/SaveBranchInsurancesDto';
import type { SaveBranchUsersDto } from '../models/SaveBranchUsersDto';
import type { SaveItemCompositionDto } from '../models/SaveItemCompositionDto';
import type { SaveItemCompositionResponseDto } from '../models/SaveItemCompositionResponseDto';
import type { SaveItemResponseDto } from '../models/SaveItemResponseDto';
import type { SaveItemsDto } from '../models/SaveItemsDto';
import type { SavePurchaseDto } from '../models/SavePurchaseDto';
import type { SavePurchaseResponseDto } from '../models/SavePurchaseResponseDto';
import type { SaveSalesDto } from '../models/SaveSalesDto';
import type { SaveSalesResponseDto } from '../models/SaveSalesResponseDto';
import type { SaveStockItemsDto } from '../models/SaveStockItemsDto';
import type { SaveStockItemsResponseDto } from '../models/SaveStockItemsResponseDto';
import type { SaveStockMasterDto } from '../models/SaveStockMasterDto';
import type { SaveStockMasterResponseDto } from '../models/SaveStockMasterResponseDto';
import type { SelectBranchesDto } from '../models/SelectBranchesDto';
import type { SelectCustomerDto } from '../models/SelectCustomerDto';
import type { SelectItemClassDto } from '../models/SelectItemClassDto';
import type { SelectNoticesDto } from '../models/SelectNoticesDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class KraVscuService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Initialize VSCU device for KRA integration
     * @param requestBody
     * @returns InitVscuResponseDto VSCU device initialized successfully
     * @throws ApiError
     */
    public kraVscuControllerInitializeDevice(
        requestBody: InitVscuDto,
    ): CancelablePromise<InitVscuResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/initialize',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve classification and location codes from KRA
     * @returns CodesResponseDto Codes retrieved successfully
     * @throws ApiError
     */
    public kraVscuControllerGetCodes(): CancelablePromise<CodesResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/codes',
        });
    }
    /**
     * Submit sales transaction to KRA VSCU
     * @param requestBody
     * @returns SaveSalesResponseDto Sales transaction submitted successfully
     * @throws ApiError
     */
    public kraVscuControllerSubmitSalesTransaction(
        requestBody: SaveSalesDto,
    ): CancelablePromise<SaveSalesResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/sales',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Submit purchase transaction to KRA VSCU
     * @param requestBody
     * @returns SavePurchaseResponseDto Purchase transaction submitted successfully
     * @throws ApiError
     */
    public kraVscuControllerSubmitPurchaseTransaction(
        requestBody: SavePurchaseDto,
    ): CancelablePromise<SavePurchaseResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/purchases',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Register items with KRA VSCU
     * @param requestBody
     * @returns SaveItemResponseDto Items registered successfully
     * @throws ApiError
     */
    public kraVscuControllerRegisterItems(
        requestBody: SaveItemsDto,
    ): CancelablePromise<SaveItemResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/items',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Submit stock master data to KRA VSCU
     * @param requestBody
     * @returns SaveStockMasterResponseDto Stock master data submitted successfully
     * @throws ApiError
     */
    public kraVscuControllerSubmitStockMaster(
        requestBody: SaveStockMasterDto,
    ): CancelablePromise<SaveStockMasterResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/stock/master',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Submit stock items data to KRA VSCU
     * @param requestBody
     * @returns SaveStockItemsResponseDto Stock items data submitted successfully
     * @throws ApiError
     */
    public kraVscuControllerSubmitStockItems(
        requestBody: SaveStockItemsDto,
    ): CancelablePromise<SaveStockItemsResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/stock/items',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Submit item composition (BOM) data to KRA VSCU
     * @param requestBody
     * @returns SaveItemCompositionResponseDto Item composition data submitted successfully
     * @throws ApiError
     */
    public kraVscuControllerSubmitItemComposition(
        requestBody: SaveItemCompositionDto,
    ): CancelablePromise<SaveItemCompositionResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/items/composition',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get item classification codes from KRA
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public kraVscuControllerGetItemClass(
        requestBody: SelectItemClassDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/itemclass',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get customer information from KRA
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public kraVscuControllerGetCustomer(
        requestBody: SelectCustomerDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/customer',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get branch information from KRA
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public kraVscuControllerGetBranches(
        requestBody: SelectBranchesDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/branches',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get notices from KRA
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public kraVscuControllerGetNotices(
        requestBody: SelectNoticesDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/notices',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Save branch customers to KRA
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public kraVscuControllerSaveBranchCustomers(
        requestBody: SaveBranchCustomersDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/branches/customers',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Save branch users to KRA
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public kraVscuControllerSaveBranchUsers(
        requestBody: SaveBranchUsersDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/branches/users',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Save branch insurances to KRA
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public kraVscuControllerSaveBranchInsurances(
        requestBody: SaveBranchInsurancesDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/branches/insurances',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get KRA VSCU audit logs for the merchant
     * @param page Page number (default: 1)
     * @param limit Items per page (default: 50, max: 100)
     * @param deviceId Filter by device ID
     * @param branchId Filter by branch ID
     * @param operation Filter by operation type
     * @param success Filter by success status
     * @param startDate Start date (ISO string)
     * @param endDate End date (ISO string)
     * @returns any KRA audit logs retrieved successfully
     * @throws ApiError
     */
    public kraVscuControllerGetAuditLogs(
        page?: number,
        limit?: number,
        deviceId?: string,
        branchId?: string,
        operation?: string,
        success?: boolean,
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/kra/vscu/audit/logs',
            query: {
                'page': page,
                'limit': limit,
                'deviceId': deviceId,
                'branchId': branchId,
                'operation': operation,
                'success': success,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get KRA VSCU audit statistics for the merchant
     * @param days Number of days to analyze (default: 30)
     * @returns any KRA audit statistics retrieved successfully
     * @throws ApiError
     */
    public kraVscuControllerGetAuditStatistics(
        days?: number,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/kra/vscu/audit/statistics',
            query: {
                'days': days,
            },
        });
    }
    /**
     * Get detailed information for a specific KRA log entry
     * @param logId
     * @returns any KRA log details retrieved successfully
     * @throws ApiError
     */
    public kraVscuControllerGetLogDetails(
        logId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/kra/vscu/audit/logs/{logId}',
            path: {
                'logId': logId,
            },
            errors: {
                404: `Log entry not found`,
            },
        });
    }
    /**
     * Retry a failed KRA submission
     * Resends a previously failed KRA submission using the original payload and endpoint
     * @param logId
     * @returns any KRA submission retried successfully
     * @throws ApiError
     */
    public kraVscuControllerRetryKraSubmission(
        logId: string,
    ): CancelablePromise<{
        success?: boolean;
        message?: string;
        originalLogId?: string;
        newLogId?: string;
        kraResponse?: Record<string, any>;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/audit/logs/{logId}/retry',
            path: {
                'logId': logId,
            },
            errors: {
                400: `Cannot retry successful submissions or invalid log entry`,
                403: `Access denied or subscription required`,
                404: `Log entry not found`,
            },
        });
    }
    /**
     * Seed KRA item classifications from VSCU API
     * Fetches and seeds the KRA item classification table with data from KRA VSCU API
     * @returns any Item classifications seeded successfully
     * @throws ApiError
     */
    public kraVscuControllerSeedItemClassifications(): CancelablePromise<{
        success?: boolean;
        totalFetched?: number;
        totalInserted?: number;
        totalUpdated?: number;
        errors?: Array<string>;
    }> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/vscu/item-classifications/seed',
            errors: {
                403: `Access denied or subscription required`,
            },
        });
    }
    /**
     * Get KRA item classifications
     * Retrieve available KRA item classifications for the merchant
     * @param search Search term for filtering classifications
     * @param limit Maximum number of results (default: 50)
     * @returns any Item classifications retrieved successfully
     * @throws ApiError
     */
    public kraVscuControllerGetItemClassifications(
        search?: string,
        limit?: string,
    ): CancelablePromise<Array<{
        id?: string;
        itemClsCd?: string;
        itemClsNm?: string;
        itemClsLvl?: string;
        taxTyCd?: string;
        mjrTgYn?: string;
        useYn?: string;
    }>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/kra/vscu/item-classifications',
            query: {
                'search': search,
                'limit': limit,
            },
        });
    }
}
