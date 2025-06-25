/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateDeviceDto } from '../models/CreateDeviceDto';
import type { CreateDeviceTypeDto } from '../models/CreateDeviceTypeDto';
import type { DeviceResponseDto } from '../models/DeviceResponseDto';
import type { DeviceTypeResponseDto } from '../models/DeviceTypeResponseDto';
import type { KraVscuInitDeviceDto } from '../models/KraVscuInitDeviceDto';
import type { UpdateDeviceDto } from '../models/UpdateDeviceDto';
import type { UpdateDeviceTypeDto } from '../models/UpdateDeviceTypeDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class DevicesService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new device
     * @param requestBody
     * @returns DeviceResponseDto The device has been successfully created.
     * @throws ApiError
     */
    public deviceControllerCreate(
        requestBody: CreateDeviceDto,
    ): CancelablePromise<DeviceResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/devices',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get all devices or filter by merchant/branch
     * @param merchantId
     * @param branchId
     * @returns DeviceResponseDto Returns all devices
     * @throws ApiError
     */
    public deviceControllerFindAll(
        merchantId: string,
        branchId: string,
    ): CancelablePromise<Array<DeviceResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/devices',
            query: {
                'merchantId': merchantId,
                'branchId': branchId,
            },
        });
    }
    /**
     * Get a device by id
     * @param id
     * @returns DeviceResponseDto Returns the device
     * @throws ApiError
     */
    public deviceControllerFindOne(
        id: string,
    ): CancelablePromise<DeviceResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/devices/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Update a device
     * @param id
     * @param requestBody
     * @returns DeviceResponseDto The device has been successfully updated.
     * @throws ApiError
     */
    public deviceControllerUpdate(
        id: string,
        requestBody: UpdateDeviceDto,
    ): CancelablePromise<DeviceResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/devices/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Delete a device
     * @param id
     * @returns DeviceResponseDto The device has been successfully deleted.
     * @throws ApiError
     */
    public deviceControllerRemove(
        id: string,
    ): CancelablePromise<DeviceResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/devices/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Toggle device active status
     * @param id
     * @returns DeviceResponseDto The device status has been successfully updated.
     * @throws ApiError
     */
    public deviceControllerToggleStatus(
        id: string,
    ): CancelablePromise<DeviceResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/devices/{id}/status',
            path: {
                'id': id,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Mark device as synced
     * @param id
     * @returns DeviceResponseDto The device sync time has been successfully updated.
     * @throws ApiError
     */
    public deviceControllerMarkSynced(
        id: string,
    ): CancelablePromise<DeviceResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/devices/{id}/sync',
            path: {
                'id': id,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Initialize device with KRA VSCU
     * @param id
     * @param requestBody
     * @returns DeviceResponseDto Device successfully initialized with KRA VSCU.
     * @throws ApiError
     */
    public deviceControllerInitializeKraVscu(
        id: string,
        requestBody: KraVscuInitDeviceDto,
    ): CancelablePromise<DeviceResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/devices/{id}/kra-vscu/initialize',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `KRA integration not available for this merchant`,
                404: `Device not found`,
            },
        });
    }
    /**
     * Get KRA VSCU status for device
     * @param id
     * @returns any Returns KRA VSCU status
     * @throws ApiError
     */
    public deviceControllerGetKraVscuStatus(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/devices/{id}/kra-vscu/status',
            path: {
                'id': id,
            },
            errors: {
                404: `Device not found`,
            },
        });
    }
    /**
     * Check if merchant is eligible for KRA VSCU integration
     * @returns any Returns eligibility status
     * @throws ApiError
     */
    public deviceControllerCheckKraEligibility(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/devices/kra-vscu/eligibility',
        });
    }
    /**
     * Create a new device type (Admin only)
     * @param requestBody
     * @returns DeviceTypeResponseDto The device type has been successfully created.
     * @throws ApiError
     */
    public deviceControllerCreateDeviceType(
        requestBody: CreateDeviceTypeDto,
    ): CancelablePromise<DeviceTypeResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/devices/types',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Device type with this name already exists`,
            },
        });
    }
    /**
     * Get all device types (Admin only)
     * @returns DeviceTypeResponseDto Returns all device types
     * @throws ApiError
     */
    public deviceControllerFindAllDeviceTypes(): CancelablePromise<Array<DeviceTypeResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/devices/types',
        });
    }
    /**
     * Get active device types (Public)
     * @returns DeviceTypeResponseDto Returns active device types
     * @throws ApiError
     */
    public deviceControllerFindActiveDeviceTypes(): CancelablePromise<Array<DeviceTypeResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/devices/types/active',
        });
    }
    /**
     * Get a device type by id
     * @param id
     * @returns DeviceTypeResponseDto Returns the device type
     * @throws ApiError
     */
    public deviceControllerFindOneDeviceType(
        id: string,
    ): CancelablePromise<DeviceTypeResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/devices/types/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Device type not found`,
            },
        });
    }
    /**
     * Update a device type (Admin only)
     * @param id
     * @param requestBody
     * @returns DeviceTypeResponseDto The device type has been successfully updated.
     * @throws ApiError
     */
    public deviceControllerUpdateDeviceType(
        id: string,
        requestBody: UpdateDeviceTypeDto,
    ): CancelablePromise<DeviceTypeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/devices/types/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Device type not found`,
                409: `Device type with this name already exists`,
            },
        });
    }
    /**
     * Delete a device type (Admin only)
     * @param id
     * @returns any The device type has been successfully deleted.
     * @throws ApiError
     */
    public deviceControllerRemoveDeviceType(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/devices/types/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Device type not found`,
            },
        });
    }
    /**
     * Activate a device type (Admin only)
     * @param id
     * @returns DeviceTypeResponseDto The device type has been successfully activated.
     * @throws ApiError
     */
    public deviceControllerActivateDeviceType(
        id: string,
    ): CancelablePromise<DeviceTypeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/devices/types/{id}/activate',
            path: {
                'id': id,
            },
            errors: {
                404: `Device type not found`,
            },
        });
    }
    /**
     * Deactivate a device type (Admin only)
     * @param id
     * @returns DeviceTypeResponseDto The device type has been successfully deactivated.
     * @throws ApiError
     */
    public deviceControllerDeactivateDeviceType(
        id: string,
    ): CancelablePromise<DeviceTypeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/devices/types/{id}/deactivate',
            path: {
                'id': id,
            },
            errors: {
                404: `Device type not found`,
            },
        });
    }
}
