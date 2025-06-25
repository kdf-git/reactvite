/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeDto } from './CodeDto';
export type CodeClassDto = {
    /**
     * Code Class
     */
    cdCls: string;
    /**
     * Code Class Name
     */
    cdClsNm: string;
    /**
     * Code Class Description
     */
    cdClsDesc: string;
    /**
     * User Define Name 1
     */
    userDfnNm1?: string;
    /**
     * User Define Name 2
     */
    userDfnNm2?: string;
    /**
     * User Define Name 3
     */
    userDfnNm3?: string;
    /**
     * Use Yes or No
     */
    useYn: string;
    /**
     * Codes in this classification
     */
    cdList: Array<CodeDto>;
};

