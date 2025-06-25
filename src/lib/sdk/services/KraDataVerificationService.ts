/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { KraCustomerVerificationDto } from '../models/KraCustomerVerificationDto';
import type { KraDataVerificationBaseDto } from '../models/KraDataVerificationBaseDto';
import type { KraPurchaseSalesVerificationDto } from '../models/KraPurchaseSalesVerificationDto';
import type { KraStockMovementsVerificationDto } from '../models/KraStockMovementsVerificationDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class KraDataVerificationService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Retrieve KRA common codes
     * Retrieves classification and location codes registered in the KRA server
     * @param requestBody
     * @returns any KRA codes retrieved successfully
     * @throws ApiError
     */
    public kraDataVerificationControllerGetCodes(
        requestBody: KraDataVerificationBaseDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/data-verification/codes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve KRA item classifications
     * Retrieves the list of item classifications registered in the KRA server
     * @param requestBody
     * @returns any Item classifications retrieved successfully
     * @throws ApiError
     */
    public kraDataVerificationControllerGetItemClassifications(
        requestBody: KraDataVerificationBaseDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/data-verification/item-classifications',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve KRA customer information
     * Retrieves taxpayer information for a specific customer PIN
     * @param requestBody
     * @returns any Customer information retrieved successfully
     * @throws ApiError
     */
    public kraDataVerificationControllerGetCustomer(
        requestBody: KraCustomerVerificationDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/data-verification/customer',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve KRA branch information
     * Retrieves the list of taxpayer branch information registered in the KRA server
     * @param requestBody
     * @returns any Branch information retrieved successfully
     * @throws ApiError
     */
    public kraDataVerificationControllerGetBranches(
        requestBody: KraDataVerificationBaseDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/data-verification/branches',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve KRA notices
     * Retrieves the list of notices for the taxpayer client
     * @param requestBody
     * @returns any Notices retrieved successfully
     * @throws ApiError
     */
    public kraDataVerificationControllerGetNotices(
        requestBody: KraDataVerificationBaseDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/data-verification/notices',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve KRA items
     * Retrieves the list of item (product) information from the KRA server
     * @param requestBody
     * @returns any Items retrieved successfully
     * @throws ApiError
     */
    public kraDataVerificationControllerGetItems(
        requestBody: KraDataVerificationBaseDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/data-verification/items',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve KRA imported items
     * Retrieves the list of taxpayer's imported items from the KRA server
     * @param requestBody
     * @returns any Import items retrieved successfully
     * @throws ApiError
     */
    public kraDataVerificationControllerGetImportItems(
        requestBody: KraDataVerificationBaseDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/data-verification/import-items',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve KRA purchase-sales transactions
     * Retrieves sales information to register purchases on the taxpayer's branch
     * @param requestBody
     * @returns any Purchase-sales transactions retrieved successfully
     * @throws ApiError
     */
    public kraDataVerificationControllerGetPurchaseSales(
        requestBody: KraPurchaseSalesVerificationDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/data-verification/purchase-sales',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Retrieve KRA stock movements
     * Retrieves the stock movement list from the KRA server
     * @param requestBody
     * @returns any Stock movements retrieved successfully
     * @throws ApiError
     */
    public kraDataVerificationControllerGetStockMovements(
        requestBody: KraStockMovementsVerificationDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/kra/data-verification/stock-movements',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
