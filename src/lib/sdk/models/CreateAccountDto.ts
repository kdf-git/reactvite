/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateAccountDto = {
    /**
     * Merchant ID
     */
    merchantId: string;
    /**
     * Account code (unique within merchant)
     */
    accountCode: string;
    /**
     * Account name
     */
    accountName: string;
    /**
     * Account type
     */
    accountType: CreateAccountDto.accountType;
    /**
     * Account sub-type
     */
    accountSubType: CreateAccountDto.accountSubType;
    /**
     * Parent account ID for hierarchical structure
     */
    parentAccountId?: string;
    /**
     * Account description
     */
    description?: string;
    /**
     * Normal balance type (DEBIT or CREDIT)
     */
    normalBalance: CreateAccountDto.normalBalance;
    /**
     * Opening balance
     */
    openingBalance?: number;
    /**
     * Whether this account is active
     */
    isActive?: boolean;
    /**
     * Whether this is a system account
     */
    isSystemAccount?: boolean;
};
export namespace CreateAccountDto {
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
     * Normal balance type (DEBIT or CREDIT)
     */
    export enum normalBalance {
        DEBIT = 'DEBIT',
        CREDIT = 'CREDIT',
    }
}

