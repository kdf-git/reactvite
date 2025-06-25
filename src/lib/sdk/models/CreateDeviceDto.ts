/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateDeviceDto = {
    /**
     * Merchant ID that owns this device
     */
    merchantId: string;
    /**
     * Branch ID where device is located
     */
    branchId: string;
    /**
     * Device type ID
     */
    deviceTypeId: string;
    /**
     * Device name
     */
    name: string;
    /**
     * Device serial number
     */
    serialNumber: string;
    /**
     * Device model
     */
    model?: string;
    /**
     * Device manufacturer
     */
    manufacturer?: string;
    /**
     * Whether the device is active
     */
    isActive: boolean;
    /**
     * Last time the device was synced
     */
    lastSync?: string;
};

