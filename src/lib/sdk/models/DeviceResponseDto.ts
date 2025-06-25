/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type DeviceResponseDto = {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Merchant ID that owns the device
     */
    merchantId: string;
    /**
     * Branch ID where the device is located
     */
    branchId: string;
    /**
     * Name of the device
     */
    name: string;
    /**
     * Serial number of the device
     */
    serialNumber: string;
    /**
     * Device type ID
     */
    deviceTypeId: string;
    /**
     * Device type information
     */
    deviceType: Record<string, any>;
    /**
     * Device model
     */
    model?: string;
    /**
     * Device manufacturer
     */
    manufacturer?: string;
    /**
     * Whether this device is active
     */
    isActive: boolean;
    /**
     * Last time the device was synced
     */
    lastSyncedAt?: string;
    /**
     * KRA VSCU TIN
     */
    kraVscuTin?: string;
    /**
     * KRA VSCU Branch ID
     */
    kraVscuBhfId?: string;
    /**
     * KRA VSCU Device Serial Number
     */
    kraVscuDvcSrlNo?: string;
    /**
     * KRA VSCU Device ID
     */
    kraVscuDvcId?: string;
    /**
     * KRA VSCU SDC ID
     */
    kraVscuSdcId?: string;
    /**
     * KRA VSCU MRC Number
     */
    kraVscuMrcNo?: string;
    /**
     * Whether device is initialized with KRA VSCU
     */
    kraVscuInitialized: boolean;
    /**
     * Full KRA VSCU initialization response
     */
    kraVscuInitResponse?: Record<string, any>;
    /**
     * Last sync with KRA VSCU
     */
    kraVscuLastSyncAt?: string;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

