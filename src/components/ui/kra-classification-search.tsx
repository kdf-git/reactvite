import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { kraVscuService } from '@/services/sdk';
import { useAuth } from '@/hooks/useAuth';

interface KraItemClassification {
    id: string;
    itemClsCd: string;
    itemClsNm: string;
    itemClsLvl: string;
    taxTyCd: string | null;
    mjrTgYn: string | null;
    useYn: string | null;
}

interface KraClassificationSearchProps {
    value?: string;
    onValueChange: (classificationCode: string | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function KraClassificationSearch({
    value,
    onValueChange,
    placeholder = "Search KRA classification codes...",
    disabled = false,
    className
}: KraClassificationSearchProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [classifications, setClassifications] = useState<KraItemClassification[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedClassification, setSelectedClassification] = useState<KraItemClassification | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();
    const lastSearchTermRef = useRef<string>('');

    // Search classifications with debouncing
    const searchClassifications = useCallback(async (term: string) => {
        // Prevent duplicate searches
        if (lastSearchTermRef.current === term.trim()) {
            return;
        }

        lastSearchTermRef.current = term.trim();
        setLoading(true);

        try {
            console.log('Searching KRA classifications with term:', term.trim());

            let results: KraItemClassification[] = [];
            if (term.trim()) {
                results = await kraVscuService.kraVscuControllerGetItemClassifications(term.trim(), '50');
            } else {
                // Load first 50 classifications when no search term
                console.log('Loading all KRA classifications');
                results = await kraVscuService.kraVscuControllerGetItemClassifications(undefined, '50');
            }

            console.log('KRA classification search results:', results);
            setClassifications(results);
        } catch (error) {
            console.error('Failed to search KRA classifications:', error);
            setClassifications([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle search input change with debouncing
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search
        searchTimeoutRef.current = setTimeout(() => {
            searchClassifications(term);
        }, 300);
    };

    // Load initial classifications when component mounts or opens
    useEffect(() => {
        if (open && classifications.length === 0) {
            searchClassifications('');
        }
    }, [open, searchClassifications]);

    // Load selected classification details when value changes
    useEffect(() => {
        if (value && !selectedClassification) {
            // Find the classification in the current list
            const found = classifications.find(c => c.itemClsCd === value);
            if (found) {
                setSelectedClassification(found);
            } else {
                // Search for the specific classification code to get its details
                // This is important for edit mode when we have a value but haven't loaded the classification details
                searchClassifications(value);
            }
        } else if (!value) {
            setSelectedClassification(null);
        }
    }, [value, searchClassifications]);

    // Update selected classification when classifications change and we have a value
    useEffect(() => {
        if (value && classifications.length > 0 && !selectedClassification) {
            const found = classifications.find(c => c.itemClsCd === value);
            if (found) {
                setSelectedClassification(found);
            }
        }
    }, [classifications, value, selectedClassification]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleSelect = (classification: KraItemClassification) => {
        setSelectedClassification(classification);
        onValueChange(classification.itemClsCd);
        setOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        setSelectedClassification(null);
        onValueChange(undefined);
        setSearchTerm('');
    };



    return (
        <div className={cn("relative", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <div className="relative">
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                            disabled={disabled}
                        >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Search className="h-4 w-4 text-foreground/70 flex-shrink-0" />
                                {selectedClassification ? (
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="truncate text-foreground font-medium">
                                            {selectedClassification.itemClsCd}
                                        </span>
                                        <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800">
                                            Level {selectedClassification.itemClsLvl}
                                        </Badge>
                                    </div>
                                ) : (
                                    <span className="text-foreground/60">{placeholder}</span>
                                )}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    {selectedClassification && (
                        <button
                            type="button"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-sm opacity-70 hover:opacity-100 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            disabled={disabled}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
                <PopoverContent className="w-[500px] p-0" align="start">
                    <Command className="bg-background" shouldFilter={false}>
                        <CommandInput
                            placeholder="Search by classification code or name..."
                            value={searchTerm}
                            onValueChange={handleSearchChange}
                        />
                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            <CommandList>
                                {loading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Searching classifications...
                                    </div>
                                ) : classifications.length === 0 ? (
                                    <CommandEmpty>
                                        {searchTerm ? 'No classifications found.' : 'Start typing to search classifications...'}
                                    </CommandEmpty>
                                ) : (
                                    <CommandGroup>
                                        {/* No classification option */}
                                        <CommandItem
                                            value="no-classification"
                                            onSelect={() => {
                                                handleClear();
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    !selectedClassification ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="text-muted-foreground">No classification</span>
                                        </CommandItem>

                                        {classifications.map((classification) => (
                                            <CommandItem
                                                key={classification.id}
                                                value={classification.itemClsCd}
                                                onSelect={() => handleSelect(classification)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedClassification?.itemClsCd === classification.itemClsCd ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-sm">
                                                            {classification.itemClsCd}
                                                        </span>
                                                        <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800">
                                                            Level {classification.itemClsLvl}
                                                        </Badge>
                                                        {classification.taxTyCd && (
                                                            <Badge className="text-xs bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
                                                                Tax: {classification.taxTyCd}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-muted-foreground truncate">
                                                        {classification.itemClsNm}
                                                    </span>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        {classification.mjrTgYn === 'Y' && (
                                                            <span className="bg-orange-100 text-orange-800 px-1 py-0.5 rounded text-xs">
                                                                Major Target
                                                            </span>
                                                        )}
                                                        {classification.useYn === 'Y' && (
                                                            <span className="bg-green-100 text-green-800 px-1 py-0.5 rounded text-xs">
                                                                In Use
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                )}
                            </CommandList>
                        </div>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
} 