/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodesDataDto } from './CodesDataDto';
export type CodesResponseDto = {
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
    data: CodesDataDto;
};

