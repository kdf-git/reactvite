import { useState, useEffect, useRef } from 'react';
import { Search, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { vendorsService } from '@/services/sdk';
import { useAuth } from '@/hooks/useAuth';
import type { VendorResponseDto } from '@/lib/sdk';

interface VendorSearchProps {
    value?: string;
    onValueChange: (vendorId: string | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function VendorSearch({
    value,
    onValueChange,
    placeholder = "Search vendors...",
    disabled = false,
    className
}: VendorSearchProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [vendors, setVendors] = useState<VendorResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<VendorResponseDto | null>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    // Get merchantId from user context
    const getMerchantId = (): string | null => {
        if (user?.merchantId) {
            return user.merchantId;
        }
        if (user?.merchant?.id) {
            return user.merchant.id;
        }
        return null;
    };

    // Search vendors with debouncing
    const searchVendors = async (term: string) => {
        const merchantId = getMerchantId();
        if (!merchantId) {
            console.log('No merchant ID found for vendor search');
            return;
        }

        setLoading(true);
        try {
            let results: VendorResponseDto[] = [];
            if (term.trim()) {
                console.log('Searching vendors with term:', term.trim(), 'for merchant:', merchantId);
                results = await vendorsService.vendorControllerSearch(merchantId, term.trim());
            } else {
                // Load first 20 vendors when no search term
                console.log('Loading all vendors for merchant:', merchantId);
                const allVendors = await vendorsService.vendorControllerFindAll(merchantId);
                results = allVendors.slice(0, 20);
            }
            console.log('Vendor search results:', results);
            setVendors(results);
        } catch (error) {
            console.error('Failed to search vendors:', error);
            setVendors([]);
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
            searchVendors(term);
        }, 300);
    };

    // Load initial vendors when component mounts or opens
    useEffect(() => {
        if (open && vendors.length === 0) {
            searchVendors('');
        }
    }, [open]);

    // Load selected vendor details when value changes
    useEffect(() => {
        if (value && !selectedVendor) {
            const merchantId = getMerchantId();
            if (merchantId) {
                vendorsService.vendorControllerFindOne(value)
                    .then(vendor => setSelectedVendor(vendor))
                    .catch(() => setSelectedVendor(null));
            }
        } else if (!value) {
            setSelectedVendor(null);
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

    const handleSelect = (vendor: VendorResponseDto) => {
        setSelectedVendor(vendor);
        onValueChange(vendor.id);
        setOpen(false);
        setSearchTerm('');
    };

    const handleClear = () => {
        setSelectedVendor(null);
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
                                {selectedVendor ? (
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="truncate text-foreground font-medium">{selectedVendor.name}</span>
                                        <Badge className="text-xs bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
                                            {selectedVendor.type}
                                        </Badge>
                                    </div>
                                ) : (
                                    <span className="text-foreground/60">{placeholder}</span>
                                )}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    {selectedVendor && (
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
                            placeholder="Search vendors by name, email, or phone..."
                            value={searchTerm}
                            onValueChange={handleSearchChange}
                        />
                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            <CommandList>
                                {loading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Searching vendors...
                                    </div>
                                ) : vendors.length === 0 ? (
                                    <CommandEmpty>
                                        {searchTerm ? 'No vendors found.' : 'Start typing to search vendors...'}
                                    </CommandEmpty>
                                ) : (
                                    <CommandGroup>
                                        {/* No vendor option */}
                                        <CommandItem
                                            value="no-vendor"
                                            onSelect={() => {
                                                handleClear();
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    !selectedVendor ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span className="text-muted-foreground">No vendor</span>
                                        </CommandItem>

                                        {vendors.map((vendor) => (
                                            <CommandItem
                                                key={vendor.id}
                                                value={vendor.name}
                                                onSelect={() => handleSelect(vendor)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedVendor?.id === vendor.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium truncate">{vendor.name}</span>
                                                        <Badge className="text-xs bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800">
                                                            {vendor.type}
                                                        </Badge>
                                                    </div>
                                                    {vendor.contactPerson && (
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            Contact: {vendor.contactPerson}
                                                        </span>
                                                    )}
                                                    {vendor.email && (
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            {vendor.email}
                                                        </span>
                                                    )}
                                                    {vendor.phone && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {vendor.phone}
                                                        </span>
                                                    )}
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