/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type KraStaffSubmissionResponseDto = {
    /**
     * Taxpayer Identification Number
     */
    tin: string;
    /**
     * Branch ID
     */
    bhfId: string;
    /**
     * User ID
     */
    userId: string;
    /**
     * User Name
     */
    userNm: string;
    /**
     * Submission result
     */
    result: string;
    /**
     * Timestamp of submission
     */
    submittedAt: string;
    /**
     * Full KRA response data
     */
    kraResponse: Record<string, any>;
};

