import { useState, useEffect, useRef } from 'react';
import { Search, Check, X, Package } from 'lucide-react';
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
import { productsService } from '@/services/sdk';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import type { ProductResponseDto } from '@/lib/sdk';

interface ProductSearchProps {
    value?: string;
    onValueChange: (productId: string | undefined) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    onProductSelect?: (product: ProductResponseDto) => void;
    importedOnly?: boolean; // Filter to show only imported items
    storableOnly?: boolean; // Filter to show only STORABLE_PRODUCT types (default true for BOM components)
}

export function ProductSearch({
    value,
    onValueChange,
    placeholder = "Search products...",
    disabled = false,
    className,
    onProductSelect,
    importedOnly = false,
    storableOnly = true
}: ProductSearchProps) {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<ProductResponseDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponseDto | null>(null);
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

    // Search products with debouncing
    const searchProducts = async (term: string) => {
        const merchantId = getMerchantId();
        if (!merchantId) {
            console.log('No merchant ID found for product search');
            return;
        }

        setLoading(true);
        try {
            console.log('Searching products with term:', term.trim(), 'for merchant:', merchantId);

            // Get all products first
            const results = await productsService.productsControllerFindAll(
                undefined, // search term handled client-side for now
                undefined, // categoryId
                undefined, // productType
                undefined, // status
                true,      // trackInventory only (for BOM components)
                undefined, // lowStock
                undefined, // limit
                undefined  // offset
            );

            // Filter results based on search term
            let filteredResults = results;
            if (term.trim()) {
                filteredResults = results.filter(product =>
                    product.name.toLowerCase().includes(term.toLowerCase()) ||
                    product.code.toLowerCase().includes(term.toLowerCase()) ||
                    (product.description && product.description.toLowerCase().includes(term.toLowerCase()))
                );
            }

            // Only show active products
            filteredResults = filteredResults.filter(product => product.isActive);

            // Filter for storable products only if required (default for BOM components)
            if (storableOnly) {
                filteredResults = filteredResults.filter(product =>
                    product.productType === 'STORABLE_PRODUCT' && product.trackInventory
                );
            }

            // Filter for imported products if required
            if (importedOnly) {
                filteredResults = filteredResults.filter(product => (product as any).isImported === true);
            }

            console.log('Product search results:', filteredResults);
            setProducts(filteredResults.slice(0, 20)); // Limit to 20 results
        } catch (error) {
            console.error('Failed to search products:', error);
            setProducts([]);
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
            searchProducts(term);
        }, 300);
    };

    // Load initial products when component mounts or opens
    useEffect(() => {
        if (open && products.length === 0) {
            searchProducts('');
        }
    }, [open]);

    // Load selected product details when value changes
    useEffect(() => {
        if (value && !selectedProduct) {
            const merchantId = getMerchantId();
            if (merchantId) {
                productsService.productsControllerFindOne(value)
                    .then(product => setSelectedProduct(product))
                    .catch(() => setSelectedProduct(null));
            }
        } else if (!value) {
            setSelectedProduct(null);
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

    const handleSelect = (product: ProductResponseDto) => {
        setSelectedProduct(product);
        onValueChange(product.id);
        setOpen(false);
        setSearchTerm('');

        // Call the callback if provided
        if (onProductSelect) {
            onProductSelect(product);
        }
    };

    const handleClear = () => {
        setSelectedProduct(null);
        onValueChange(undefined);
        setSearchTerm('');
    };

    const isLowStock = (product: ProductResponseDto) => {
        return product.reorderLevel && product.stockLevel <= product.reorderLevel;
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
                                <Package className="h-4 w-4 text-foreground/70 flex-shrink-0" />
                                {selectedProduct ? (
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="truncate text-foreground font-medium">{selectedProduct.name}</span>
                                        <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-800">
                                            {selectedProduct.code}
                                        </Badge>
                                        {isLowStock(selectedProduct) && (
                                            <Badge variant="destructive" className="text-xs">
                                                Low Stock
                                            </Badge>
                                        )}
                                        {(selectedProduct as any).isImported && (
                                            <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800">
                                                Imported
                                            </Badge>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-foreground/60">{placeholder}</span>
                                )}
                            </div>
                        </Button>
                    </PopoverTrigger>
                    {selectedProduct && (
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
                            placeholder="Search products by name, code, or description..."
                            value={searchTerm}
                            onValueChange={handleSearchChange}
                        />
                        <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            <CommandList>
                                {loading ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        Searching products...
                                    </div>
                                ) : products.length === 0 ? (
                                    <CommandEmpty>
                                        <div className="text-center py-4">
                                            <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                {searchTerm ? 'No products found matching your search.' : 'No active products available.'}
                                            </p>
                                        </div>
                                    </CommandEmpty>
                                ) : (
                                    <CommandGroup>
                                        {products.map((product) => (
                                            <CommandItem
                                                key={product.id}
                                                value={product.name}
                                                onSelect={() => handleSelect(product)}
                                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                                            >
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-sm truncate">{product.name}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {product.code}
                                                            </Badge>
                                                            {isLowStock(product) && (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Low Stock
                                                                </Badge>
                                                            )}
                                                            {(product as any).isImported && (
                                                                <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-100 dark:border-amber-800">
                                                                    Imported
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                            <span>
                                                                Stock: {product.stockLevel} {product.unitOfMeasure?.name || product.unitOfMeasure?.code || 'units'}
                                                            </span>
                                                            {product.costPrice && (
                                                                <span>
                                                                    Cost: {formatCurrency(product.costPrice, merchantSettings)}
                                                                </span>
                                                            )}
                                                            {product.vendor && (
                                                                <span>
                                                                    Vendor: {product.vendor.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {product.description && (
                                                            <p className="text-xs text-muted-foreground mt-1 truncate">
                                                                {product.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {value === product.id && (
                                                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                                )}
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

// Keep the old name as an alias for backward compatibility
export const StockItemSearch = ProductSearch; 