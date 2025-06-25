/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AccountResponseDto = {
    /**
     * Account ID
     */
    id: string;
    /**
     * Merchant ID
     */
    merchantId: string;
    /**
     * Account code
     */
    accountCode: string;
    /**
     * Account name
     */
    accountName: string;
    /**
     * Account type
     */
    accountType: AccountResponseDto.accountType;
    /**
     * Account sub-type
     */
    accountSubType: AccountResponseDto.accountSubType;
    /**
     * Parent account ID
     */
    parentAccountId?: string;
    /**
     * Parent account details
     */
    parentAccount?: AccountResponseDto;
    /**
     * Child accounts
     */
    childAccounts?: Array<AccountResponseDto>;
    /**
     * Account description
     */
    description?: string;
    /**
     * Whether this account is active
     */
    isActive: boolean;
    /**
     * Whether this is a system account
     */
    isSystemAccount: boolean;
    /**
     * Normal balance type
     */
    normalBalance: AccountResponseDto.normalBalance;
    /**
     * Current balance
     */
    currentBalance: number;
    /**
     * Opening balance
     */
    openingBalance: number;
    /**
     * Creation timestamp
     */
    createdAt: string;
    /**
     * Last update timestamp
     */
    updatedAt: string;
};
export namespace AccountResponseDto {
    /**
     * Account type
     */
    export enum accountType {
        ASSET = 'ASSET',
        LIABILITY = 'LIABILITY',
        EQUITY = 'EQUITY',
        REVENUE = 'REVENUE',
        EXPENSE = 'EXPENSE',
    }
    /**
     * Account sub-type
     */
    export enum accountSubType {
        CURRENT_ASSET = 'CURRENT_ASSET',
        FIXED_ASSET = 'FIXED_ASSET',
        INTANGIBLE_ASSET = 'INTANGIBLE_ASSET',
        OTHER_ASSET = 'OTHER_ASSET',
        CURRENT_LIABILITY = 'CURRENT_LIABILITY',
        LONG_TERM_LIABILITY = 'LONG_TERM_LIABILITY',
        OTHER_LIABILITY = 'OTHER_LIABILITY',
        OWNER_EQUITY = 'OWNER_EQUITY',
        RETAINED_EARNINGS = 'RETAINED_EARNINGS',
        OPERATING_REVENUE = 'OPERATING_REVENUE',
        OTHER_REVENUE = 'OTHER_REVENUE',
        COST_OF_GOODS_SOLD = 'COST_OF_GOODS_SOLD',
        OPERATING_EXPENSE = 'OPERATING_EXPENSE',
        OTHER_EXPENSE = 'OTHER_EXPENSE',
    }
    /**
     * Normal balance type
     */
    export enum normalBalance {
        DEBIT = 'DEBIT',
        CREDIT = 'CREDIT',
    }
}

