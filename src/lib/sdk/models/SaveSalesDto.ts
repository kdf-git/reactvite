/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SaleItemDto } from './SaleItemDto';
export type SaveSalesDto = {
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
     * Receipt Type Code
     */
    rcptTyCd: string;
    /**
     * Payment Type Code
     */
    pmtTyCd: string;
    /**
     * Sales Type Code
     */
    salesTyCd: string;
    /**
     * Sales Date
     */
    salesDt: string;
    /**
     * Sales Report Number
     */
    stockRlsDt?: string;
    /**
     * Customer PIN
     */
    custTin?: string;
    /**
     * Customer Name
     */
    custNm?: string;
    /**
     * Customer Mobile Number
     */
    custMblNo?: string;
    /**
     * Remark
     */
    remark?: string;
    itemList: Array<SaleItemDto>;
};

