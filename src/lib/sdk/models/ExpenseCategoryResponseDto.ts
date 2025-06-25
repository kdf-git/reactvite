/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ExpenseCategoryResponseDto = {
    /**
     * Category ID
     */
    id: string;
    /**
     * Category name
     */
    name: string;
    /**
     * Category description
     */
    description?: string;
    /**
     * Whether the category is active
     */
    isActive: boolean;
    /**
     * Number of expenses in this category
     */
    expenseCount: number;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

