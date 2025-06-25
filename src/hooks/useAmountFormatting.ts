import { useMemo } from 'react';
import { useMerchantSettings } from '@/hooks/useMerchantSettings';
import {
    formatAbbreviatedAmount,
    formatSmartAmount,
    formatCurrencyAbbreviated,
    type AmountFormatOptions,
    type FormattedAmount
} from '@/utils/amount-formatter';

/**
 * Custom hook that provides amount formatting functions with merchant settings
 */
export function useAmountFormatting() {
    const merchantSettings = useMerchantSettings();

    const defaultOptions: AmountFormatOptions = useMemo(() => ({
        currencySymbol: merchantSettings.currencySymbol || 'KSh',
        currency: merchantSettings.currency || 'KES',
        decimalPlaces: 1,
    }), [merchantSettings]);

    const formatters = useMemo(() => ({
        /**
         * Format amount with abbreviations (K, M, B, T)
         * Always shows abbreviated format
         */
        abbreviated: (amount: number, customOptions?: Partial<AmountFormatOptions>): FormattedAmount => {
            return formatAbbreviatedAmount(amount, { ...defaultOptions, ...customOptions });
        },

        /**
         * Smart format - shows full amount for small values, abbreviated for large
         * Threshold is 10,000
         */
        smart: (amount: number, customOptions?: Partial<AmountFormatOptions>): FormattedAmount => {
            return formatSmartAmount(amount, { ...defaultOptions, ...customOptions });
        },

        /**
         * Simple abbreviated string (legacy compatibility)
         */
        simple: (amount: number, decimalPlaces?: number): string => {
            return formatCurrencyAbbreviated(
                amount,
                defaultOptions.currencySymbol!,
                decimalPlaces ?? defaultOptions.decimalPlaces!
            );
        },

        /**
         * Get just the abbreviated string from the smart formatter
         */
        smartString: (amount: number, customOptions?: Partial<AmountFormatOptions>): string => {
            const formatted = formatSmartAmount(amount, { ...defaultOptions, ...customOptions });
            return formatted.abbreviated;
        },

        /**
         * Get just the abbreviated string from the standard formatter  
         */
        abbreviatedString: (amount: number, customOptions?: Partial<AmountFormatOptions>): string => {
            const formatted = formatAbbreviatedAmount(amount, { ...defaultOptions, ...customOptions });
            return formatted.abbreviated;
        },
    }), [defaultOptions]);

    return {
        ...formatters,
        defaultOptions,
        currencySymbol: defaultOptions.currencySymbol!,
        currency: defaultOptions.currency!,
    };
}

/**
 * Quick formatting utilities for common use cases
 */
export function useQuickFormat() {
    const { smart, abbreviated, smartString, abbreviatedString } = useAmountFormatting();

    return {
        /**
         * For dashboard cards - shows smart formatting with full amounts for context
         */
        forCard: (amount: number) => smart(amount),

        /**
         * For tables - shows abbreviated to save space
         */
        forTable: (amount: number) => abbreviated(amount),

        /**
         * For inline text - returns just the string
         */
        forText: (amount: number) => smartString(amount),

        /**
         * For compact displays - always abbreviated string
         */
        forCompact: (amount: number) => abbreviatedString(amount),
    };
} 