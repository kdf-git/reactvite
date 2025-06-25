import { useState, useEffect } from 'react';

export interface MerchantSettings {
  currency: string;
  currencySymbol: string;
  decimalPlaces: number;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

export const useMerchantSettings = () => {
  const [settings, setSettings] = useState<MerchantSettings>({
    currency: 'USD',
    currencySymbol: '$',
    decimalPlaces: 2,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'HH:mm'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch merchant settings from API
    // For boilerplate, we'll use default settings
    setLoading(false);
  }, []);

  return {
    ...settings,
    loading,
    setSettings
  };
};

export const formatCurrency = (amount: number, currency = 'USD', symbol = '$'): string => {
  return `${symbol}${amount.toFixed(2)}`;
}; 