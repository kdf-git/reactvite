/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FuelTransaction = {
    /**
     * Unique identifier
     */
    id: string;
    /**
     * Customer PIN or identifier
     */
    customerPin?: Record<string, any>;
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
    invoiceCustomerName?: Record<string, any>;
    /**
     * Invoice customer asset name
     */
    invoiceCustomerAssetName?: Record<string, any>;
    /**
     * Loyalty customer name
     */
    loyaltyCustomerName?: Record<string, any>;
    /**
     * Loyalty customer asset name
     */
    loyaltyCustomerAssetName?: Record<string, any>;
    /**
     * Shift closing number
     */
    shiftClosingNO?: Record<string, any>;
    /**
     * Sale ID
     */
    saleID?: Record<string, any>;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};

