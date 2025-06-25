/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaleItemDto = {
    /**
     * Item Sequence
     */
    itemSeq: number;
    itemCd: string;
    /**
     * Item Name
     */
    itemNm: string;
    /**
     * Bar Code
     */
    bcd?: string;
    /**
     * Item Classification Code
     */
    itemClsCd: string;
    /**
     * Package Unit Code
     */
    pkgUnitCd: string;
    qty: number;
    prc: number;
    splyAmt: number;
    /**
     * Discount Yes or No
     */
    dcRt: string;
    /**
     * Discount Rate
     */
    dcAmt: number;
    /**
     * Tax Type Code
     */
    taxTyCd: string;
    taxblAmt: number;
    /**
     * Tax Code
     */
    taxAmt: number;
    totAmt: number;
};

