import { Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Badge } from './badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { cn } from '@/lib/utils';

interface KraSyncIndicatorProps {
    kraSubmitted?: boolean;
    kraSubmittedAt?: string | Date;
    kraSubmissionData?: any;
    className?: string;
    showIcon?: boolean;
    showText?: boolean;
    variant?: 'default' | 'compact' | 'detailed';
}

export function KraSyncIndicator({
    kraSubmitted = false,
    kraSubmittedAt,
    kraSubmissionData,
    className,
    showIcon = true,
    showText = true,
    variant = 'default'
}: KraSyncIndicatorProps) {
    // Parse submission date
    const submissionDate = kraSubmittedAt ? new Date(kraSubmittedAt) : null;
    const isRecent = submissionDate && (Date.now() - submissionDate.getTime()) < 24 * 60 * 60 * 1000; // Less than 24 hours

    // Determine status based on submission data
    const getStatus = () => {
        if (!kraSubmitted) return 'not-submitted';

        if (kraSubmissionData) {
            const resultCode = kraSubmissionData.resultCd || kraSubmissionData.resultCode;
            if (resultCode === '000' || resultCode === 'SUCCESS') return 'success';
            if (resultCode && resultCode !== '000') return 'error';
        }

        return 'submitted';
    };

    const status = getStatus();

    // Get badge variant and icon based on status
    const getBadgeProps = () => {
        switch (status) {
            case 'success':
                return {
                    variant: 'default' as const,
                    className: 'bg-green-100 text-green-800 border-green-200',
                    icon: CheckCircle,
                    text: 'KRA Synced'
                };
            case 'error':
                return {
                    variant: 'destructive' as const,
                    className: 'bg-red-100 text-red-800 border-red-200',
                    icon: XCircle,
                    text: 'Sync Failed'
                };
            case 'submitted':
                return {
                    variant: 'secondary' as const,
                    className: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: Shield,
                    text: 'KRA Submitted'
                };
            default:
                return {
                    variant: 'outline' as const,
                    className: 'bg-gray-50 text-gray-600 border-gray-200',
                    icon: Clock,
                    text: 'Not Synced'
                };
        }
    };

    const badgeProps = getBadgeProps();
    const Icon = badgeProps.icon;

    // Format submission time
    const formatSubmissionTime = () => {
        if (!submissionDate) return null;

        const now = new Date();
        const diffMs = now.getTime() - submissionDate.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return submissionDate.toLocaleDateString();
    };

    const submissionTimeText = formatSubmissionTime();

    if (variant === 'compact') {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className={cn("inline-flex items-center", className)}>
                            <Icon className={cn(
                                "h-4 w-4",
                                status === 'success' && "text-green-600",
                                status === 'error' && "text-red-600",
                                status === 'submitted' && "text-blue-600",
                                status === 'not-submitted' && "text-gray-400"
                            )} />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="text-sm">
                            <div className="font-medium">{badgeProps.text}</div>
                            {submissionTimeText && (
                                <div className="text-muted-foreground">{submissionTimeText}</div>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (variant === 'detailed') {
        return (
            <div className={cn("space-y-1", className)}>
                <Badge
                    variant={badgeProps.variant}
                    className={cn(badgeProps.className, "inline-flex items-center gap-1")}
                >
                    {showIcon && <Icon className="h-3 w-3" />}
                    {showText && badgeProps.text}
                </Badge>
                {submissionTimeText && (
                    <div className="text-xs text-muted-foreground">
                        Last synced: {submissionTimeText}
                    </div>
                )}
                {status === 'error' && kraSubmissionData?.resultMsg && (
                    <div className="text-xs text-red-600">
                        Error: {kraSubmissionData.resultMsg}
                    </div>
                )}
            </div>
        );
    }

    // Default variant
    return (
        <Badge
            variant={badgeProps.variant}
            className={cn(
                badgeProps.className,
                "inline-flex items-center gap-1",
                className
            )}
        >
            {showIcon && <Icon className="h-3 w-3" />}
            {showText && (
                <span>
                    {badgeProps.text}
                    {submissionTimeText && variant === 'default' && (
                        <span className="ml-1 opacity-75">({submissionTimeText})</span>
                    )}
                </span>
            )}
        </Badge>
    );
} 