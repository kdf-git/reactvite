/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterKraCustomerDto = {
    /**
     * Merchant PIN
     */
    tin: string;
    /**
     * Branch ID
     */
    bhfId: string;
    /**
     * Customer PIN to register with KRA
     */
    customerPin: string;
    /**
     * Customer Name
     */
    customerName: string;
    /**
     * Customer Address
     */
    customerAddress?: string;
    /**
     * Customer Phone Number
     */
    customerPhone?: string;
    /**
     * Customer Email
     */
    customerEmail?: string;
};

