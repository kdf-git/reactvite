/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateFuelTransactionDto = {
    /**
     * Customer PIN or identifier
     */
    customerPin?: string;
    /**
     * Pump transaction ID
     */
    pumpTransactionId: number;
    /**
     * PTS ID
     */
    ptsId: string;
    /**
     * Date time start
     */
    dateTimeStart: string;
    /**
     * Transaction date time
     */
    transactionDateTime: string;
    /**
     * Pump number
     */
    pumpNumber: number;
    /**
     * Nozzle number
     */
    nozzleNumber: number;
    /**
     * Transaction number
     */
    transactionNumber: number;
    /**
     * Volume
     */
    volume: number;
    /**
     * Amount
     */
    amount: number;
    /**
     * TC volume
     */
    tcVolume: number;
    /**
     * Price
     */
    price: number;
    /**
     * Total volume
     */
    totalVolume: number;
    /**
     * Total amount
     */
    totalAmount: number;
    /**
     * Pump name
     */
    pumpName: string;
    /**
     * Nozzle name
     */
    nozzleName: string;
    /**
     * Product name
     */
    productName: string;
    /**
     * Shift clock number
     */
    shiftClockNO: string;
    /**
     * Clock number
     */
    clockNO: string;
    /**
     * Shift number
     */
    shiftNO: string;
    /**
     * Tag number
     */
    tagNO: string;
    /**
     * Attendant name
     */
    attendantName: string;
    /**
     * Is loyalty
     */
    isLoyalty: number;
    /**
     * Is invoice
     */
    isInvoice: number;
    /**
     * Is close shift
     */
    isCloseShift: number;
    /**
     * Invoice customer name
     */
    invoiceCustomerName?: string;
    /**
     * Invoice customer asset name
     */
    invoiceCustomerAssetName?: string;
    /**
     * Loyalty customer name
     */
    loyaltyCustomerName?: string;
    /**
     * Loyalty customer asset name
     */
    loyaltyCustomerAssetName?: string;
    /**
     * Shift closing number
     */
    shiftClosingNO?: string;
    /**
     * Sale ID
     */
    saleID?: string;
};

