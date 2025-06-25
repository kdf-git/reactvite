/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateExpenseDto = {
    /**
     * Branch ID
     */
    branchId?: string;
    /**
     * Expense category ID
     */
    categoryId?: string;
    /**
     * Vendor ID
     */
    vendorId?: string;
    /**
     * Expense title
     */
    title?: string;
    /**
     * Expense description
     */
    description?: string;
    /**
     * Expense amount (before tax)
     */
    amount?: number;
    /**
     * Tax amount
     */
    taxAmount?: number;
    /**
     * Total amount (amount + tax)
     */
    totalAmount?: number;
    /**
     * Expense date
     */
    expenseDate?: string;
    /**
     * Due date for payment
     */
    dueDate?: string;
    /**
     * Payment mode ID
     */
    paymentModeId?: string;
    /**
     * Payment reference number
     */
    referenceNumber?: string;
    /**
     * Receipt number
     */
    receiptNumber?: string;
    /**
     * Expense status
     */
    status?: UpdateExpenseDto.status;
    /**
     * Whether this is a recurring expense
     */
    isRecurring?: boolean;
    /**
     * Recurring type
     */
    recurringType?: UpdateExpenseDto.recurringType;
    /**
     * Recurring interval (e.g., every 2 months)
     */
    recurringInterval?: number;
    /**
     * Next due date for recurring expense
     */
    nextDueDate?: string;
    /**
     * Attachment file URLs
     */
    attachments?: Array<string>;
    /**
     * Additional notes
     */
    notes?: string;
};
export namespace UpdateExpenseDto {
    /**
     * Expense status
     */
    export enum status {
        DRAFT = 'DRAFT',
        PENDING = 'PENDING',
        APPROVED = 'APPROVED',
        REJECTED = 'REJECTED',
        PAID = 'PAID',
        CANCELLED = 'CANCELLED',
    }
    /**
     * Recurring type
     */
    export enum recurringType {
        DAILY = 'DAILY',
        WEEKLY = 'WEEKLY',
        MONTHLY = 'MONTHLY',
        QUARTERLY = 'QUARTERLY',
        YEARLY = 'YEARLY',
    }
}

