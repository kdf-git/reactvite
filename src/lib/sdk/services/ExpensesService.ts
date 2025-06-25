/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateExpenseDto } from '../models/CreateExpenseDto';
import type { ExpenseResponseDto } from '../models/ExpenseResponseDto';
import type { UpdateExpenseDto } from '../models/UpdateExpenseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ExpensesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new expense
     * @param requestBody
     * @returns ExpenseResponseDto Expense created successfully
     * @throws ApiError
     */
    public expenseControllerCreate(
        requestBody: CreateExpenseDto,
    ): CancelablePromise<ExpenseResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/expenses',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
            },
        });
    }
    /**
     * Get all expenses for a merchant
     * @param merchantId Merchant ID
     * @param branchId Branch ID
     * @param categoryId Category ID
     * @param vendorId Vendor ID
     * @param status Expense status
     * @param paymentStatus Payment status
     * @param startDate Start date (ISO string)
     * @param endDate End date (ISO string)
     * @param search Search term
     * @returns ExpenseResponseDto Expenses retrieved successfully
     * @throws ApiError
     */
    public expenseControllerFindAll(
        merchantId: string,
        branchId?: string,
        categoryId?: string,
        vendorId?: string,
        status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED',
        paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERPAID',
        startDate?: string,
        endDate?: string,
        search?: string,
    ): CancelablePromise<Array<ExpenseResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/expenses',
            query: {
                'merchantId': merchantId,
                'branchId': branchId,
                'categoryId': categoryId,
                'vendorId': vendorId,
                'status': status,
                'paymentStatus': paymentStatus,
                'startDate': startDate,
                'endDate': endDate,
                'search': search,
            },
        });
    }
    /**
     * Get expense dashboard summary
     * @param merchantId Merchant ID
     * @param startDate Start date (ISO string)
     * @param endDate End date (ISO string)
     * @returns any Dashboard summary retrieved successfully
     * @throws ApiError
     */
    public expenseControllerGetDashboardSummary(
        merchantId: string,
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/expenses/dashboard-summary',
            query: {
                'merchantId': merchantId,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get expense by ID
     * @param id
     * @returns ExpenseResponseDto Expense retrieved successfully
     * @throws ApiError
     */
    public expenseControllerFindById(
        id: string,
    ): CancelablePromise<ExpenseResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/expenses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Expense not found`,
            },
        });
    }
    /**
     * Update expense
     * @param id
     * @param requestBody
     * @returns ExpenseResponseDto Expense updated successfully
     * @throws ApiError
     */
    public expenseControllerUpdate(
        id: string,
        requestBody: UpdateExpenseDto,
    ): CancelablePromise<ExpenseResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/expenses/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Expense not found`,
            },
        });
    }
    /**
     * Delete expense
     * @param id
     * @returns void
     * @throws ApiError
     */
    public expenseControllerDelete(
        id: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/expenses/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Cannot delete paid expenses`,
                404: `Expense not found`,
            },
        });
    }
    /**
     * Update expense status
     * @param id
     * @returns ExpenseResponseDto Expense status updated successfully
     * @throws ApiError
     */
    public expenseControllerUpdateStatus(
        id: string,
    ): CancelablePromise<ExpenseResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/expenses/{id}/status',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid status transition`,
                404: `Expense not found`,
            },
        });
    }
    /**
     * Mark expense as paid
     * @param id
     * @returns ExpenseResponseDto Expense marked as paid successfully
     * @throws ApiError
     */
    public expenseControllerMarkAsPaid(
        id: string,
    ): CancelablePromise<ExpenseResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/expenses/{id}/mark-as-paid',
            path: {
                'id': id,
            },
            errors: {
                400: `Expense is already paid`,
                404: `Expense not found`,
            },
        });
    }
}
