/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PurchaseItemDto } from './PurchaseItemDto';
export type SavePurchaseDto = {
    tin: string;
    bhfId: string;
    /**
     * Invoice Number
     */
    invcNo: number;
    /**
     * Original Invoice Number
     */
    orgInvcNo?: number;
    /**
     * Supplier PIN
     */
    spplrTin: string;
    /**
     * Supplier Name
     */
    spplrNm: string;
    /**
     * Supplier Branch ID
     */
    spplrBhfId?: string;
    /**
     * Supplier Invoice Number
     */
    spplrInvcNo: number;
    /**
     * Receipt Type Code
     */
    rcptTyCd: string;
    /**
     * Payment Type Code
     */
    pmtTyCd: string;
    /**
     * Purchase Date
     */
    pchsDt: string;
    /**
     * Remark
     */
    remark?: string;
    itemList: Array<PurchaseItemDto>;
};

