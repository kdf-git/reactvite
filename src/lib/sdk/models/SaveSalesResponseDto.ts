/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SalesDataDto } from './SalesDataDto';
export type SaveSalesResponseDto = {
    /**
     * Result code (000=Success, 001=No results, 002=Device not registered, 003=Invalid request)
     */
    resultCd: string;
    /**
     * Success message or reason for failure
     */
    resultMsg: string;
    /**
     * Timestamp in yyyyMMddHHmmss format
     */
    resultDt: string;
    data?: SalesDataDto;
};

