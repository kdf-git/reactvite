/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateExpenseCategoryDto } from '../models/CreateExpenseCategoryDto';
import type { ExpenseCategoryResponseDto } from '../models/ExpenseCategoryResponseDto';
import type { UpdateExpenseCategoryDto } from '../models/UpdateExpenseCategoryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ExpenseCategoriesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new expense category
     * @param requestBody
     * @returns ExpenseCategoryResponseDto Category created successfully
     * @throws ApiError
     */
    public expenseCategoryControllerCreate(
        requestBody: CreateExpenseCategoryDto,
    ): CancelablePromise<ExpenseCategoryResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/expense-categories',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                409: `Category with this name already exists`,
            },
        });
    }
    /**
     * Get all expense categories
     * @param search Search term
     * @param isActive Filter by active status
     * @returns ExpenseCategoryResponseDto Categories retrieved successfully
     * @throws ApiError
     */
    public expenseCategoryControllerFindAll(
        search?: string,
        isActive?: string,
    ): CancelablePromise<Array<ExpenseCategoryResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/expense-categories',
            query: {
                'search': search,
                'isActive': isActive,
            },
        });
    }
    /**
     * Get expense category by ID
     * @param id
     * @returns ExpenseCategoryResponseDto Category retrieved successfully
     * @throws ApiError
     */
    public expenseCategoryControllerFindById(
        id: string,
    ): CancelablePromise<ExpenseCategoryResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/expense-categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Category not found`,
            },
        });
    }
    /**
     * Update expense category
     * @param id
     * @param requestBody
     * @returns ExpenseCategoryResponseDto Category updated successfully
     * @throws ApiError
     */
    public expenseCategoryControllerUpdate(
        id: string,
        requestBody: UpdateExpenseCategoryDto,
    ): CancelablePromise<ExpenseCategoryResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/expense-categories/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Category not found`,
                409: `Category with this name already exists`,
            },
        });
    }
    /**
     * Delete expense category
     * @param id
     * @returns void
     * @throws ApiError
     */
    public expenseCategoryControllerDelete(
        id: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/expense-categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Category not found`,
                409: `Cannot delete category with existing expenses`,
            },
        });
    }
    /**
     * Toggle category active status
     * @param id
     * @returns ExpenseCategoryResponseDto Category status toggled successfully
     * @throws ApiError
     */
    public expenseCategoryControllerToggleStatus(
        id: string,
    ): CancelablePromise<ExpenseCategoryResponseDto> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/expense-categories/{id}/toggle-status',
            path: {
                'id': id,
            },
            errors: {
                404: `Category not found`,
            },
        });
    }
}
