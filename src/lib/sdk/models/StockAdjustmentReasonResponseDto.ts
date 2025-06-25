/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StockAdjustmentReasonResponseDto = {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Reason code (e.g., STOCK_TAKE, DAMAGE)
     */
    code: string;
    /**
     * Display name of the reason
     */
    name: string;
    /**
     * Description of the reason
     */
    description: Record<string, any>;
    /**
     * Whether the reason is active
     */
    isActive: boolean;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

