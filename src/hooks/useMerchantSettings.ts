import { useAuth } from './useAuth';
import type { MerchantResponseDto } from '@/lib/sdk';

export interface MerchantSettings {
    timezone: string;
    country: string;
    currency: string;
    currencySymbol: string;
}

export function useMerchantSettings(): MerchantSettings {
    const { user } = useAuth();
    const merchant = user?.merchant;

    // All values come from the backend with proper defaults
    const timezone = merchant?.timezone || 'Africa/Nairobi';
    const country = merchant?.country || 'KE';
    const currency = merchant?.currency || 'KES';
    const currencySymbol = merchant?.currencySymbol || 'KSh';

    return {
        timezone,
        country,
        currency,
        currencySymbol,
    };
}

export function formatCurrency(amount: number, settings: MerchantSettings): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency,
        currencyDisplay: 'symbol',
    }).format(amount).replace(/[A-Z]{3}/, settings.currencySymbol);
}

// Helper function to format date using merchant timezone
export const formatDate = (date: Date | string, merchantSettings?: MerchantSettings): string => {
    const settings = merchantSettings || {
        timezone: 'Africa/Nairobi',
        country: 'KE',
        currency: 'KES',
        currencySymbol: 'KSh',
    };

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    try {
        return new Intl.DateTimeFormat('en', {
            timeZone: settings.timezone,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj);
    } catch (error) {
        // Fallback to local time if timezone is not supported
        return dateObj.toLocaleString('en');
    }
};

// Helper function to format date only (without time) using merchant timezone
export const formatDateOnly = (date: Date | string, merchantSettings?: MerchantSettings): string => {
    const settings = merchantSettings || {
        timezone: 'Africa/Nairobi',
        country: 'KE',
        currency: 'KES',
        currencySymbol: 'KSh',
    };

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    try {
        return new Intl.DateTimeFormat('en', {
            timeZone: settings.timezone,
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(dateObj);
    } catch (error) {
        // Fallback to local time if timezone is not supported
        return dateObj.toLocaleDateString('en');
    }
}; 