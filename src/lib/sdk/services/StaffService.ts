/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateStaffDto } from '../models/CreateStaffDto';
import type { DepartmentResponseDto } from '../models/DepartmentResponseDto';
import type { KraStaffSubmissionResponseDto } from '../models/KraStaffSubmissionResponseDto';
import type { PositionResponseDto } from '../models/PositionResponseDto';
import type { StaffResponseDto } from '../models/StaffResponseDto';
import type { UpdateStaffDto } from '../models/UpdateStaffDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class StaffService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new staff member
     * @param requestBody
     * @returns StaffResponseDto Staff member created successfully
     * @throws ApiError
     */
    public staffControllerCreateStaff(
        requestBody: CreateStaffDto,
    ): CancelablePromise<StaffResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/staff',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all staff members for a merchant
     * @param branchId
     * @returns StaffResponseDto Returns list of staff members
     * @throws ApiError
     */
    public staffControllerFindAllStaff(
        branchId: string,
    ): CancelablePromise<Array<StaffResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/staff',
            query: {
                'branchId': branchId,
            },
        });
    }
    /**
     * Get all available positions
     * @returns PositionResponseDto Returns list of positions
     * @throws ApiError
     */
    public staffControllerFindAllPositions(): CancelablePromise<Array<PositionResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/staff/positions',
        });
    }
    /**
     * Get all available departments
     * @returns DepartmentResponseDto Returns list of departments
     * @throws ApiError
     */
    public staffControllerFindAllDepartments(): CancelablePromise<Array<DepartmentResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/staff/departments',
        });
    }
    /**
     * Get staff member by card number
     * @param cardNo
     * @returns StaffResponseDto Returns staff member details
     * @throws ApiError
     */
    public staffControllerFindStaffByCardNo(
        cardNo: string,
    ): CancelablePromise<StaffResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/staff/card/{cardNo}',
            path: {
                'cardNo': cardNo,
            },
        });
    }
    /**
     * Get staff member by ID
     * @param id
     * @returns StaffResponseDto Returns staff member details
     * @throws ApiError
     */
    public staffControllerFindStaffById(
        id: string,
    ): CancelablePromise<StaffResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/staff/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update staff member
     * @param id
     * @param requestBody
     * @returns StaffResponseDto Staff member updated successfully
     * @throws ApiError
     */
    public staffControllerUpdateStaff(
        id: string,
        requestBody: UpdateStaffDto,
    ): CancelablePromise<StaffResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/staff/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete staff member
     * @param id
     * @returns void
     * @throws ApiError
     */
    public staffControllerDeleteStaff(
        id: string,
    ): CancelablePromise<void> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/staff/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle staff member active status
     * @param id
     * @returns StaffResponseDto Staff status updated successfully
     * @throws ApiError
     */
    public staffControllerToggleStaffStatus(
        id: string,
    ): CancelablePromise<StaffResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/staff/{id}/status',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Submit staff member to KRA VSCU
     * @param id
     * @returns KraStaffSubmissionResponseDto Staff member submitted to KRA successfully
     * @throws ApiError
     */
    public staffControllerSubmitStaffToKra(
        id: string,
    ): CancelablePromise<KraStaffSubmissionResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/staff/{id}/submit-to-kra',
            path: {
                'id': id,
            },
        });
    }
}
