import React from 'react';
import { formatAbbreviatedAmount, formatSmartAmount, type AmountFormatOptions } from '@/utils/amount-formatter';
import { useMerchantSettings } from '@/hooks/useMerchantSettings';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface AmountDisplayProps {
    /** The amount to display */
    amount: number;
    /** Whether to show the full amount below in small text */
    showFullAmount?: boolean;
    /** Whether to use tooltip instead of subtitle for full amount */
    useTooltip?: boolean;
    /** Whether to use smart formatting (shows full for small amounts) */
    useSmart?: boolean;
    /** Custom CSS classes for the main amount */
    className?: string;
    /** Custom CSS classes for the subtitle/full amount */
    subtitleClassName?: string;
    /** Additional formatting options */
    formatOptions?: Partial<AmountFormatOptions>;
    /** Text color variant */
    variant?: 'default' | 'green' | 'red' | 'orange' | 'blue';
}

const variantClasses = {
    default: 'text-foreground',
    green: 'text-green-600',
    red: 'text-red-600',
    orange: 'text-orange-600',
    blue: 'text-blue-600',
};

export function AmountDisplay({
    amount,
    showFullAmount = true,
    useTooltip = false,
    useSmart = false,
    className,
    subtitleClassName,
    formatOptions = {},
    variant = 'default',
}: AmountDisplayProps) {
    const merchantSettings = useMerchantSettings();

    // Merge merchant settings with format options
    const options: AmountFormatOptions = {
        currencySymbol: merchantSettings.currencySymbol || 'KSh',
        currency: merchantSettings.currency || 'KES',
        ...formatOptions,
    };

    // Choose formatting function based on useSmart prop
    const formatted = useSmart
        ? formatSmartAmount(amount, options)
        : formatAbbreviatedAmount(amount, options);

    const mainClasses = cn(
        'font-bold',
        variantClasses[variant],
        className
    );

    const subtitleClasses = cn(
        'text-xs text-muted-foreground mt-0.5',
        subtitleClassName
    );

    // If the abbreviated and full amounts are the same (small amounts), don't show subtitle
    const shouldShowSubtitle = showFullAmount && formatted.abbreviated !== formatted.full;

    const content = (
        <div className="flex flex-col">
            <span className={mainClasses}>
                {formatted.abbreviated}
            </span>
            {shouldShowSubtitle && !useTooltip && (
                <span className={subtitleClasses}>
                    {formatted.full}
                </span>
            )}
        </div>
    );

    // Use tooltip if requested and there's a difference between abbreviated and full
    if (useTooltip && shouldShowSubtitle) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="cursor-help">
                            <span className={mainClasses}>
                                {formatted.abbreviated}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{formatted.full}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return content;
}

interface CompactAmountProps {
    /** The amount to display */
    amount: number;
    /** Text color variant */
    variant?: 'default' | 'green' | 'red' | 'orange' | 'blue';
    /** Custom CSS classes */
    className?: string;
    /** Additional formatting options */
    formatOptions?: Partial<AmountFormatOptions>;
}

/**
 * Compact amount display that always shows abbreviated format with tooltip
 */
export function CompactAmount({
    amount,
    variant = 'default',
    className,
    formatOptions = {},
}: CompactAmountProps) {
    return (
        <AmountDisplay
            amount={amount}
            variant={variant}
            className={className}
            formatOptions={formatOptions}
            useTooltip={true}
            showFullAmount={true}
        />
    );
}

interface CardAmountProps {
    /** The amount to display */
    amount: number;
    /** Card title/label */
    label?: string;
    /** Text color variant */
    variant?: 'default' | 'green' | 'red' | 'orange' | 'blue';
    /** Custom CSS classes for the amount */
    className?: string;
    /** Additional formatting options */
    formatOptions?: Partial<AmountFormatOptions>;
}

/**
 * Amount display specifically designed for dashboard cards
 */
export function CardAmount({
    amount,
    label,
    variant = 'default',
    className,
    formatOptions = {},
}: CardAmountProps) {
    const mainClasses = cn(
        'text-2xl font-bold',
        className
    );

    return (
        <div>
            {label && (
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
            )}
            <AmountDisplay
                amount={amount}
                variant={variant}
                className={mainClasses}
                formatOptions={formatOptions}
                showFullAmount={true}
                useSmart={true}
            />
        </div>
    );
}

/**
 * Simple abbreviated amount without any additional features
 */
export function SimpleAmount({
    amount,
    className,
    formatOptions = {},
}: {
    amount: number;
    className?: string;
    formatOptions?: Partial<AmountFormatOptions>;
}) {
    const merchantSettings = useMerchantSettings();

    const options: AmountFormatOptions = {
        currencySymbol: merchantSettings.currencySymbol || 'KSh',
        currency: merchantSettings.currency || 'KES',
        ...formatOptions,
    };

    const formatted = formatAbbreviatedAmount(amount, options);

    return (
        <span className={className}>
            {formatted.abbreviated}
        </span>
    );
} 