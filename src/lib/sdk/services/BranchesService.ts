/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BranchResponseDto } from '../models/BranchResponseDto';
import type { CreateBranchDto } from '../models/CreateBranchDto';
import type { UpdateBranchDto } from '../models/UpdateBranchDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class BranchesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new branch
     * @param requestBody
     * @returns BranchResponseDto The branch has been successfully created.
     * @throws ApiError
     */
    public branchControllerCreate(
        requestBody: CreateBranchDto,
    ): CancelablePromise<BranchResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/branches',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all branches or filter by merchant
     * @param merchantId
     * @returns BranchResponseDto Returns all branches
     * @throws ApiError
     */
    public branchControllerFindAll(
        merchantId: string,
    ): CancelablePromise<Array<BranchResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/branches',
            query: {
                'merchantId': merchantId,
            },
        });
    }
    /**
     * Get a branch by id
     * @param id
     * @returns BranchResponseDto Returns the branch
     * @throws ApiError
     */
    public branchControllerFindOne(
        id: string,
    ): CancelablePromise<BranchResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/branches/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Branch not found`,
            },
        });
    }
    /**
     * Update a branch
     * @param id
     * @param requestBody
     * @returns BranchResponseDto The branch has been successfully updated.
     * @throws ApiError
     */
    public branchControllerUpdate(
        id: string,
        requestBody: UpdateBranchDto,
    ): CancelablePromise<BranchResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/branches/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Branch not found`,
            },
        });
    }
    /**
     * Delete a branch
     * @param id
     * @returns BranchResponseDto The branch has been successfully deleted.
     * @throws ApiError
     */
    public branchControllerRemove(
        id: string,
    ): CancelablePromise<BranchResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/branches/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Branch not found`,
            },
        });
    }
    /**
     * Toggle branch active status
     * @param id
     * @returns BranchResponseDto The branch status has been successfully updated.
     * @throws ApiError
     */
    public branchControllerToggleStatus(
        id: string,
    ): CancelablePromise<BranchResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/branches/{id}/status',
            path: {
                'id': id,
            },
            errors: {
                404: `Branch not found`,
            },
        });
    }
}
