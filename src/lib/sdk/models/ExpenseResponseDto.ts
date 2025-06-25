/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ExpenseResponseDto = {
    /**
     * Expense ID
     */
    id: string;
    /**
     * Merchant ID
     */
    merchantId: string;
    /**
     * Branch ID
     */
    branchId?: string;
    /**
     * Category ID
     */
    categoryId: string;
    /**
     * Vendor ID
     */
    vendorId?: string;
    /**
     * Expense number
     */
    expenseNumber: string;
    /**
     * Expense title
     */
    title: string;
    /**
     * Expense description
     */
    description?: string;
    /**
     * Expense amount (before tax)
     */
    amount: number;
    /**
     * Tax amount
     */
    taxAmount: number;
    /**
     * Total amount (amount + tax)
     */
    totalAmount: number;
    /**
     * Expense date
     */
    expenseDate: string;
    /**
     * Due date for payment
     */
    dueDate?: string;
    /**
     * Payment date
     */
    paymentDate?: string;
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
    status: ExpenseResponseDto.status;
    /**
     * Payment status
     */
    paymentStatus: ExpenseResponseDto.paymentStatus;
    /**
     * Whether this is a recurring expense
     */
    isRecurring: boolean;
    /**
     * Recurring type
     */
    recurringType?: ExpenseResponseDto.recurringType;
    /**
     * Recurring interval
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
    /**
     * User ID who approved the expense
     */
    approvedBy?: string;
    /**
     * Approval timestamp
     */
    approvedAt?: string;
    /**
     * User ID who created the expense
     */
    createdBy: string;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
    /**
     * Branch information
     */
    branch?: Record<string, any>;
    /**
     * Category information
     */
    category?: Record<string, any>;
    /**
     * Vendor information
     */
    vendor?: Record<string, any>;
    /**
     * Payment mode information
     */
    paymentMode?: Record<string, any>;
};
export namespace ExpenseResponseDto {
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
     * Payment status
     */
    export enum paymentStatus {
        UNPAID = 'UNPAID',
        PARTIAL = 'PARTIAL',
        PAID = 'PAID',
        OVERPAID = 'OVERPAID',
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

