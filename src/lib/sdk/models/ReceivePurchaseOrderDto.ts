/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReceiveItemDto } from './ReceiveItemDto';
export type ReceivePurchaseOrderDto = {
    /**
     * Items to receive with quantities
     */
    receivedItems: Array<ReceiveItemDto>;
    /**
     * Whether to create stock movements automatically. When enabled, stock movements will be automatically submitted to KRA VSCU for eligible merchants (Kenya merchants with proper KRA configuration).
     */
    createStockMovements?: boolean;
    /**
     * Device ID if operation performed on device
     */
    deviceId?: string;
    /**
     * Staff ID if operation performed by staff on device
     */
    staffId?: string;
    /**
     * User who performed the receiving operation
     */
    createdBy?: string;
};

