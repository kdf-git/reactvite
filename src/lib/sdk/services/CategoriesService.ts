/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CategoryResponseDto } from '../models/CategoryResponseDto';
import type { CreateCategoryDto } from '../models/CreateCategoryDto';
import type { UpdateCategoryDto } from '../models/UpdateCategoryDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class CategoriesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new category
     * @param requestBody
     * @returns CategoryResponseDto The category has been successfully created.
     * @throws ApiError
     */
    public categoryControllerCreate(
        requestBody: CreateCategoryDto,
    ): CancelablePromise<CategoryResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/categories',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all categories with optional filtering
     * @param merchantId
     * @param search
     * @returns CategoryResponseDto Returns all categories
     * @throws ApiError
     */
    public categoryControllerFindAll(
        merchantId: string,
        search: string,
    ): CancelablePromise<Array<CategoryResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/categories',
            query: {
                'merchantId': merchantId,
                'search': search,
            },
        });
    }
    /**
     * Get a category by id
     * @param id
     * @returns CategoryResponseDto Returns the category
     * @throws ApiError
     */
    public categoryControllerFindOne(
        id: string,
    ): CancelablePromise<CategoryResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Category not found`,
            },
        });
    }
    /**
     * Update a category
     * @param id
     * @param requestBody
     * @returns CategoryResponseDto The category has been successfully updated.
     * @throws ApiError
     */
    public categoryControllerUpdate(
        id: string,
        requestBody: UpdateCategoryDto,
    ): CancelablePromise<CategoryResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Category not found`,
            },
        });
    }
    /**
     * Delete a category
     * @param id
     * @returns CategoryResponseDto The category has been successfully deleted.
     * @throws ApiError
     */
    public categoryControllerRemove(
        id: string,
    ): CancelablePromise<CategoryResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Category not found`,
                409: `Category has products and cannot be deleted`,
            },
        });
    }
    /**
     * Toggle category active status
     * @param id
     * @returns CategoryResponseDto The category status has been successfully updated.
     * @throws ApiError
     */
    public categoryControllerToggleStatus(
        id: string,
    ): CancelablePromise<CategoryResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/categories/{id}/status',
            path: {
                'id': id,
            },
            errors: {
                404: `Category not found`,
            },
        });
    }
}
