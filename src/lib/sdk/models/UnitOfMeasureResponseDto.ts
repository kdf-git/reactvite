/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UnitOfMeasureResponseDto = {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Unit code (e.g., PIECE, LITER, KG)
     */
    code: string;
    /**
     * Display name of the unit
     */
    name: string;
    /**
     * Unit symbol (e.g., pcs, L, kg)
     */
    symbol?: Record<string, any>;
    /**
     * Description of the unit
     */
    description?: Record<string, any>;
    /**
     * Unit category (e.g., WEIGHT, VOLUME, COUNT)
     */
    category?: Record<string, any>;
    /**
     * Whether the unit is active
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

