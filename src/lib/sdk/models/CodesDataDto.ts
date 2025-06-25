/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CodeClassDto } from './CodeClassDto';
import type { TaxTypeCodeDto } from './TaxTypeCodeDto';
import type { UnspscCodeDto } from './UnspscCodeDto';
export type CodesDataDto = {
    /**
     * Code Classifications
     */
    cdCls: Array<CodeClassDto>;
    /**
     * Tax Type Codes
     */
    taxTyCd: Array<TaxTypeCodeDto>;
    /**
     * UNSPSC Codes
     */
    unspscCd: Array<UnspscCodeDto>;
};

