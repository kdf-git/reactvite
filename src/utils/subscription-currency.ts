import { formatCurrency, type MerchantSettings } from '@/hooks/useMerchantSettings';

// Helper function to create currency settings from subscription data
export const getSubscriptionCurrencySettings = (subscriptionData: {
    subscriptionPlan: { currency?: string };
    merchant: { currency: string; country?: string };
}): MerchantSettings => {
    const planCurrency = subscriptionData.subscriptionPlan.currency || subscriptionData.merchant.currency || 'USD';

    return {
        timezone: 'UTC', // Not used for currency formatting
        country: subscriptionData.merchant.country || 'US',
        currency: planCurrency,
        currencySymbol: planCurrency, // Just use the currency code as the symbol
    };
};

// Convenience function to format subscription amounts
export const formatSubscriptionCurrency = (
    amount: number,
    subscriptionData: {
        subscriptionPlan: { currency?: string };
        merchant: { currency: string; country?: string };
    }
): string => {
    const settings = getSubscriptionCurrencySettings(subscriptionData);
    return formatCurrency(amount, settings);
}; 