/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SaveItemsDto = {
    /**
     * Taxpayer Identification Number
     */
    tin: string;
    /**
     * Branch ID
     */
    bhfId: string;
    /**
     * Item Code
     */
    itemCd: string;
    /**
     * Item Classification Code
     */
    itemClsCd: string;
    /**
     * Item Type Code
     */
    itemTyCd: string;
    /**
     * Item Name
     */
    itemNm: string;
    /**
     * Item Standard Name
     */
    itemStdNm?: string;
    /**
     * Origin Nation Code
     */
    orgnNatCd: string;
    /**
     * Package Unit Code
     */
    pkgUnitCd: string;
    /**
     * Quantity Unit Code
     */
    qtyUnitCd: string;
    /**
     * Tax Type Code
     */
    taxTyCd: string;
    /**
     * Batch Number
     */
    btchNo?: string;
    /**
     * Bar Code
     */
    bcd?: string;
    /**
     * Default Price
     */
    dftPrc: number;
    /**
     * Group Price Level 1
     */
    grpPrcL1: number;
    /**
     * Group Price Level 2
     */
    grpPrcL2: number;
    /**
     * Group Price Level 3
     */
    grpPrcL3: number;
    /**
     * Group Price Level 4
     */
    grpPrcL4: number;
    /**
     * Group Price Level 5
     */
    grpPrcL5?: number;
    /**
     * Additional Information
     */
    addInfo?: string;
    /**
     * Safety Quantity
     */
    sftyQty?: number;
    /**
     * Insurance Applicable (Y/N)
     */
    isrcAplcbYn: string;
    /**
     * Use Yes or No
     */
    useYn: string;
    /**
     * Registrant Name
     */
    regrNm: string;
    /**
     * Registrant ID
     */
    regrId: string;
    /**
     * Modifier Name
     */
    modrNm: string;
    /**
     * Modifier ID
     */
    modrId: string;
};

