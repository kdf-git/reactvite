/**
 * Utility functions for formatting amounts with abbreviations and full display options
 */

export interface AmountFormatOptions {
    /** Whether to use abbreviations (K, M, B, etc.) */
    useAbbreviation?: boolean;
    /** Currency symbol to display */
    currencySymbol?: string;
    /** Currency code for proper formatting */
    currency?: string;
    /** Number of decimal places for abbreviated amounts */
    decimalPlaces?: number;
    /** Whether to show full amount alongside abbreviated */
    showFullAmount?: boolean;
}

export interface FormattedAmount {
    /** The abbreviated amount (e.g., "1.2K") */
    abbreviated: string;
    /** The full formatted amount (e.g., "1,234.56") */
    full: string;
    /** The raw numeric value */
    value: number;
    /** The currency symbol used */
    currencySymbol: string;
}

/**
 * Format amount with abbreviations (K, M, B, T)
 */
export function formatAbbreviatedAmount(
    amount: number,
    options: AmountFormatOptions = {}
): FormattedAmount {
    const {
        currencySymbol = 'KSh',
        currency = 'KES',
        decimalPlaces = 1,
    } = options;

    // Handle edge cases
    if (amount === 0) {
        return {
            abbreviated: `${currencySymbol} 0`,
            full: `${currencySymbol} 0.00`,
            value: 0,
            currencySymbol,
        };
    }

    const absAmount = Math.abs(amount);
    const isNegative = amount < 0;
    const sign = isNegative ? '-' : '';

    let abbreviated: string;
    let suffix = '';

    // Determine abbreviation and value
    if (absAmount >= 1_000_000_000_000) {
        // Trillions
        abbreviated = (absAmount / 1_000_000_000_000).toFixed(decimalPlaces);
        suffix = 'T';
    } else if (absAmount >= 1_000_000_000) {
        // Billions
        abbreviated = (absAmount / 1_000_000_000).toFixed(decimalPlaces);
        suffix = 'B';
    } else if (absAmount >= 1_000_000) {
        // Millions
        abbreviated = (absAmount / 1_000_000).toFixed(decimalPlaces);
        suffix = 'M';
    } else if (absAmount >= 1_000) {
        // Thousands
        abbreviated = (absAmount / 1_000).toFixed(decimalPlaces);
        suffix = 'K';
    } else {
        // Less than 1000, show as is with 2 decimal places
        abbreviated = absAmount.toFixed(2);
    }

    // Remove trailing zeros and decimal point if not needed
    abbreviated = abbreviated.replace(/\.?0+$/, '');

    // Format the full amount using Intl.NumberFormat
    const fullFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount).replace(/[A-Z]{3}/, currencySymbol);

    return {
        abbreviated: `${sign}${currencySymbol} ${abbreviated}${suffix}`,
        full: fullFormatted,
        value: amount,
        currencySymbol,
    };
}

/**
 * Legacy function to maintain compatibility
 * Use this when you need just the abbreviated string
 */
export function formatCurrencyAbbreviated(
    amount: number,
    currencySymbol: string = 'KSh',
    decimalPlaces: number = 1
): string {
    const formatted = formatAbbreviatedAmount(amount, {
        currencySymbol,
        decimalPlaces,
    });
    return formatted.abbreviated;
}

/**
 * Smart amount formatter that shows abbreviated for large amounts
 * and full amounts for smaller values
 */
export function formatSmartAmount(
    amount: number,
    options: AmountFormatOptions = {}
): FormattedAmount {
    const {
        currencySymbol = 'KSh',
        currency = 'KES',
    } = options;

    const absAmount = Math.abs(amount);

    // Show full amount for values less than 10,000
    if (absAmount < 10_000) {
        const fullFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount).replace(/[A-Z]{3}/, currencySymbol);

        return {
            abbreviated: fullFormatted,
            full: fullFormatted,
            value: amount,
            currencySymbol,
        };
    }

    // Use abbreviated format for larger amounts
    return formatAbbreviatedAmount(amount, options);
}

/**
 * Percentage formatter for displaying percentages
 */
export function formatPercentage(
    value: number,
    decimalPlaces: number = 1
): string {
    return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Growth indicator formatter (with + or - signs and colors)
 */
export interface GrowthInfo {
    value: string;
    isPositive: boolean;
    isZero: boolean;
    className: string;
}

export function formatGrowth(
    currentValue: number,
    previousValue: number,
    asPercentage: boolean = true
): GrowthInfo {
    if (previousValue === 0) {
        return {
            value: currentValue > 0 ? '+100%' : '0%',
            isPositive: currentValue > 0,
            isZero: currentValue === 0,
            className: currentValue > 0 ? 'text-green-600' : 'text-gray-500',
        };
    }

    const difference = currentValue - previousValue;
    const percentageChange = (difference / Math.abs(previousValue)) * 100;

    const isPositive = difference > 0;
    const isZero = difference === 0;

    let value: string;
    if (asPercentage) {
        value = `${isPositive ? '+' : ''}${percentageChange.toFixed(1)}%`;
    } else {
        const formattedDiff = formatAbbreviatedAmount(Math.abs(difference));
        value = `${isPositive ? '+' : '-'}${formattedDiff.abbreviated.replace(/^[^\d]*/, '')}`;
    }

    return {
        value,
        isPositive,
        isZero,
        className: isPositive ? 'text-green-600' : isZero ? 'text-gray-500' : 'text-red-600',
    };
} 