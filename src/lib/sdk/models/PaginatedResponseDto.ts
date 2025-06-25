/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PaginatedResponseDto = {
    /**
     * Array of data items
     */
    data: Array<string>;
    /**
     * Total number of items
     */
    total: number;
    /**
     * Current page number
     */
    page: number;
    /**
     * Number of items per page
     */
    limit: number;
    /**
     * Total number of pages
     */
    totalPages: number;
    /**
     * Whether there is a next page
     */
    hasNext: boolean;
    /**
     * Whether there is a previous page
     */
    hasPrev: boolean;
};

