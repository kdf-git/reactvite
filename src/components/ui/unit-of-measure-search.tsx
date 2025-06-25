import { useState, useEffect, useRef } from 'react';
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
import { stockService } from '@/services/sdk';
import type { UnitOfMeasureResponseDto } from '@/lib/sdk';

interface UnitOfMeasureSearchProps {
    value?: string;
    onValueChange: (unitId: string | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

// Helper function to safely extract string value from object or string
const getStringValue = (value: any): string => {
    if (typeof value === 'string') {
        return value;
    }
    if (value && typeof value === 'object') {
        // Try common properties that might contain the string value
        return value.value || value.name || value.text || value.label || String(value);
    }
    return '';
};

export function UnitOfMeasureSearch({
    value,
    onValueChange,
    placeholder = "Search units of measure...",
    disabled = false,
    className
}: UnitOfMeasureSearchProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [units, setUnits] = useState<UnitOfMeasureResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasureResponseDto | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    // Search units with debouncing
    const searchUnits = async (term: string) => {
        setLoading(true);
        try {
            let results: UnitOfMeasureResponseDto[] = [];
            if (term.trim()) {
                console.log('Searching units with term:', term.trim());
                results = await stockService.stockControllerSearchUnitsOfMeasure(term.trim(), '20');
            } else {
                // Load first 20 units when no search term - use empty string for search term
                console.log('Loading default units (first 20)');
                results = await stockService.stockControllerSearchUnitsOfMeasure('', '20');
            }
            console.log('Units search results:', results);
            setUnits(results);
        } catch (error) {
            console.error('Failed to search units of measure:', error);
            setUnits([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle search input change with debouncing
    const handleSearchChange = (term: string) => {
        setSearchTerm(term);

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search
        searchTimeoutRef.current = setTimeout(() => {
            searchUnits(term);
        }, 300);
    };

    // Load initial units when component mounts or opens
    useEffect(() => {
        if (open && units.length === 0) {
            searchUnits('');
        }
    }, [open]);

    // Load selected unit details when value changes
    useEffect(() => {
        if (value && !selectedUnit) {
            // Try to find in current units first
            const existingUnit = units.find(u => u.id === value);
            if (existingUnit) {
                setSelectedUnit(existingUnit);
                return;
            }

            // If not found, load all units to find it
            stockService.stockControllerGetUnitsOfMeasure()
                .then(allUnits => {
                    const unit = allUnits.find(u => u.id === value);
                    if (unit) {
                        setSelectedUnit(unit);
                    }
                })
                .catch(() => setSelectedUnit(null));
        } else if (!value) {
            setSelectedUnit(null);
        }
    }, [value]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleSelect = (unit: UnitOfMeasureResponseDto) => {
        setSelectedUnit(unit);
        onValueChange(unit.id);
        setOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        setSelectedUnit(null);
        onValueChange(undefined);
        setSearchTerm('');
    };

    // Helper function to get display symbol
    const getDisplaySymbol = (unit: UnitOfMeasureResponseDto): string => {
        const symbolValue = getStringValue(unit.symbol);
        return symbolValue || unit.code;
    };

    // Helper function to get display category
    const getDisplayCategory = (unit: UnitOfMeasureResponseDto): string => {
        return getStringValue(unit.category);
    };

    // Helper function to get display description
    const getDisplayDescription = (unit: UnitOfMeasureResponseDto): string => {
        return getStringValue(unit.description);
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
                                {selectedUnit ? (
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="truncate text-foreground font-medium">{selectedUnit.name}</span>
                                        <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800">
                                            {getDisplaySymbol(selectedUnit)}
                                        </Badge>
                                    </div>
                                ) : (
                                    <span className="text-foreground/60">{placeholder}</span>
                                )}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    {selectedUnit && (
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
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command className="bg-background" shouldFilter={false}>
                        <CommandInput
                            placeholder="Search units by name, code, or symbol..."
                            value={searchTerm}
                            onValueChange={handleSearchChange}
                        />
                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            <CommandList>
                                {loading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Searching units...
                                    </div>
                                ) : units.length === 0 ? (
                                    <CommandEmpty>
                                        {searchTerm ? 'No units found.' : 'Start typing to search units...'}
                                    </CommandEmpty>
                                ) : (
                                    <CommandGroup>
                                        {/* No unit option */}
                                        <CommandItem
                                            value="no-unit"
                                            onSelect={() => {
                                                handleClear();
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    !selectedUnit ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="text-muted-foreground">No unit</span>
                                        </CommandItem>

                                        {units.map((unit) => {
                                            const displayCategory = getDisplayCategory(unit);
                                            const displayDescription = getDisplayDescription(unit);

                                            return (
                                                <CommandItem
                                                    key={unit.id}
                                                    value={unit.name}
                                                    onSelect={() => handleSelect(unit)}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedUnit?.id === unit.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium truncate">{unit.name}</span>
                                                            <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800">
                                                                {getDisplaySymbol(unit)}
                                                            </Badge>
                                                        </div>
                                                        {displayCategory && (
                                                            <span className="text-xs text-muted-foreground truncate uppercase tracking-wide">
                                                                {displayCategory}
                                                            </span>
                                                        )}
                                                        {displayDescription && (
                                                            <span className="text-xs text-muted-foreground truncate">
                                                                {displayDescription}
                                                            </span>
                                                        )}
                                                    </div>
                                                </CommandItem>
                                            );
                                        })}
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