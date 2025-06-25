import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, Package, Plus, Layers, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KraSyncIndicator } from '@/components/ui/kra-sync-indicator';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings } from '@/hooks/useMerchantSettings';
import { productsService, categoriesService, adminService, vendorsService } from '@/services/sdk';
import { UnitOfMeasureSearch } from '@/components/ui/unit-of-measure-search';
import { VendorSearch } from '@/components/ui/vendor-search';
import { KraClassificationSearch } from '@/components/ui/kra-classification-search';
import { extractErrorMessage } from '@/lib/error-utils';
import type { CategoryResponseDto, CreateProductDto, VendorResponseDto } from '@/lib/sdk';

// Product Type enum to match backend
enum ProductType {
    STORABLE_PRODUCT = 'STORABLE_PRODUCT',
    KIT = 'KIT',
    SERVICE = 'SERVICE'
}

const productTypeLabels = {
    [ProductType.STORABLE_PRODUCT]: 'Storable Product',
    [ProductType.KIT]: 'Kit/Bundle',
    [ProductType.SERVICE]: 'Service'
};

const productTypeDescriptions = {
    [ProductType.STORABLE_PRODUCT]: 'Physical items tracked in inventory with stock levels',
    [ProductType.KIT]: 'Virtual bundles made from other products (Bill of Materials)',
    [ProductType.SERVICE]: 'Non-physical services with no inventory tracking'
};

const productTypeIcons = {
    [ProductType.STORABLE_PRODUCT]: Package,
    [ProductType.KIT]: Layers,
    [ProductType.SERVICE]: Wrench
};

interface ProductFormData {
    name: string;
    code: string;
    description: string;
    categoryId: string;
    subcategory: string;
    barcode: string;
    sku: string;
    unitOfMeasureId: string;
    costPrice: number;
    sellingPrice: number;
    taxRate: number;
    isActive: boolean;
    kraItemCode: string;
    imageUrl: string;

    // New Product Type and Inventory Fields
    productType: ProductType;
    trackInventory: boolean;
    vendorId: string;
    stockLevel: number;
    reorderLevel: number;

    // KRA Integration Fields (for Kenya merchants)
    kraTaxTypeId: string;
    kraPackagingUnitId: string;
    kraUnitOfMeasurementId: string;
    kraOriginNationCode: string;
    kraItemClassificationCode: string;

    // Import Fields (for imported items)
    isImported: boolean;
    importHsCode: string;
    importTaskCode: string;
    importBatchNumber: string;
    importDeclarationDate: string;
    importItemSequence: number;
    importItemStatusCode: string;
    importRemark: string;

    // KRA Submission Fields
    submitToKRA: boolean;
    kraSubmissionDate: string;
}

const initialFormData: ProductFormData = {
    name: '',
    code: '',
    description: '',
    categoryId: '',
    subcategory: '',
    barcode: '',
    sku: '',
    unitOfMeasureId: '',
    costPrice: 0,
    sellingPrice: 0,
    taxRate: 0,
    isActive: true,
    kraItemCode: '',
    imageUrl: '',

    // New Product Type and Inventory Fields
    productType: ProductType.STORABLE_PRODUCT,
    trackInventory: true,
    vendorId: '',
    stockLevel: 0,
    reorderLevel: 0,

    kraTaxTypeId: '',
    kraPackagingUnitId: '',
    kraUnitOfMeasurementId: '',
    kraOriginNationCode: 'KE',
    kraItemClassificationCode: '',
    isImported: false,
    importHsCode: '',
    importTaskCode: '',
    importBatchNumber: '',
    importDeclarationDate: '',
    importItemSequence: 1,
    importItemStatusCode: '1',
    importRemark: '',
    submitToKRA: false,
    kraSubmissionDate: '',
};

export default function CreateProductPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
    const [vendors, setVendors] = useState<VendorResponseDto[]>([]);

    // KRA Data States (for Kenya merchants)
    const [kraTaxTypes, setKraTaxTypes] = useState<any[]>([]);
    const [kraPackagingUnits, setKraPackagingUnits] = useState<any[]>([]);
    const [kraUnitsOfMeasurement, setKraUnitsOfMeasurement] = useState<any[]>([]);
    const [kraCountryCodes, setKraCountryCodes] = useState<any[]>([]);

    const [formData, setFormData] = useState<ProductFormData>(initialFormData);
    const [productKraData, setProductKraData] = useState<{
        kraSubmitted?: boolean;
        kraSubmittedAt?: string;
        kraSubmissionData?: any;
    }>({});

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

    // Check if merchant is from Kenya and should show KRA fields
    const isKenyaMerchant = merchantSettings.country === 'KE';

    // Load categories, vendors, and product data (if editing)
    useEffect(() => {
        const loadData = async () => {
            try {
                const merchantId = getMerchantId();
                if (!merchantId) return;

                // Load categories and vendors
                const [categoriesData, vendorsData] = await Promise.all([
                    categoriesService.categoryControllerFindAll(merchantId, ''),
                    vendorsService.vendorControllerFindAll(merchantId)
                ]);

                setCategories(categoriesData);
                setVendors(vendorsData);

                // Load KRA data if merchant is from Kenya
                if (isKenyaMerchant) {
                    try {
                        const [taxTypesData, packagingUnitsData, unitsOfMeasurementData, countryCodesData] = await Promise.all([
                            adminService.adminControllerGetKraTaxTypes(),
                            adminService.adminControllerGetKraPackagingUnits(),
                            adminService.adminControllerGetKraUnitsOfMeasurement(),
                            adminService.adminControllerGetKraCountryCodes(),
                        ]);

                        setKraTaxTypes(taxTypesData.filter((item: any) => item.isActive));
                        setKraPackagingUnits(packagingUnitsData.filter((item: any) => item.isActive));
                        setKraUnitsOfMeasurement(unitsOfMeasurementData.filter((item: any) => item.isActive));
                        setKraCountryCodes(countryCodesData.filter((item: any) => item.isActive));
                    } catch (error) {
                        console.warn('Could not load KRA data:', error);
                        toast.error('Failed to load KRA data. Some fields may not be available.');
                    }
                }

                // Load product data if editing
                if (isEditMode && id) {
                    const product = await productsService.productControllerFindOne(id);

                    // Handle unitOfMeasure - it might be an object or a string
                    let unitOfMeasureId = '';
                    if (typeof product.unitOfMeasure === 'string') {
                        unitOfMeasureId = product.unitOfMeasure;
                    } else if (product.unitOfMeasure && typeof product.unitOfMeasure === 'object' && 'id' in product.unitOfMeasure) {
                        unitOfMeasureId = (product.unitOfMeasure as any).id;
                    }

                    setFormData({
                        name: product.name,
                        code: product.code,
                        description: product.description || '',
                        categoryId: product.categoryId,
                        subcategory: product.subcategory || '',
                        barcode: product.barcode || '',
                        sku: product.sku || '',
                        unitOfMeasureId: unitOfMeasureId,
                        costPrice: product.costPrice,
                        sellingPrice: product.sellingPrice,
                        taxRate: product.taxRate,
                        isActive: product.isActive,
                        kraItemCode: product.kraItemCode || '',
                        imageUrl: product.imageUrl || '',

                        // New Product Type and Inventory Fields
                        productType: (product.productType as ProductType) || ProductType.STORABLE_PRODUCT,
                        trackInventory: product.trackInventory || false,
                        vendorId: product.vendorId || '',
                        stockLevel: product.stockLevel || 0,
                        reorderLevel: product.reorderLevel || 0,

                        kraTaxTypeId: product.kraTaxTypeId || '',
                        kraPackagingUnitId: product.kraPackagingUnitId || '',
                        kraUnitOfMeasurementId: product.kraUnitOfMeasurementId || '',
                        kraOriginNationCode: product.kraOriginNationCode || '',
                        kraItemClassificationCode: product.kraItemClassificationCode || '',
                        isImported: (product as any).isImported || false,
                        importHsCode: (product as any).importHsCode || '',
                        importTaskCode: (product as any).importTaskCode || '',
                        importBatchNumber: (product as any).importBatchNumber || '',
                        importDeclarationDate: (product as any).importDeclarationDate ? new Date((product as any).importDeclarationDate).toISOString().split('T')[0] : '',
                        importItemSequence: (product as any).importItemSequence || 1,
                        importItemStatusCode: (product as any).importItemStatusCode || '1',
                        importRemark: (product as any).importRemark || '',
                        submitToKRA: false,
                        kraSubmissionDate: '',
                    });

                    // Set KRA submission data for the indicator
                    setProductKraData({
                        kraSubmitted: product.kraSubmitted,
                        kraSubmittedAt: product.kraSubmittedAt,
                        kraSubmissionData: product.kraSubmissionData
                    });
                }
            } catch (error: any) {
                console.error('Failed to load data:', error);
                toast.error('Failed to load data');
            }
        };

        if (user) {
            loadData();
        }
    }, [user, isEditMode, id, isKenyaMerchant]);

    // Auto-generate product code for non-Kenya merchants when name changes (only in create mode)
    useEffect(() => {
        if (!isEditMode && !isKenyaMerchant && formData.name && !formData.code) {
            const generatedCode = formData.name
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .substring(0, 10);
            setFormData(prev => ({ ...prev, code: generatedCode }));
        }
    }, [formData.name, isEditMode, isKenyaMerchant]);

    // Handle form field changes
    const handleFormChange = (field: keyof ProductFormData, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Auto-adjust inventory tracking based on product type
            if (field === 'productType') {
                if (value === ProductType.SERVICE) {
                    newData.trackInventory = false;
                } else if (value === ProductType.STORABLE_PRODUCT) {
                    newData.trackInventory = true;
                }
                // KIT products can optionally track inventory (for direct sales)
            }

            return newData;
        });
    };

    // Auto-generate sequence number for imported items
    const generateImportItemSequence = (): number => {
        // For now, simply return 1 for single item submissions
        // In batch submissions (like import purchase orders), this would be calculated based on item position
        return 1;
    };

    // Handle KRA submission after product is created/updated
    const handleKraSubmissionAfterSave = async (productId: string) => {
        if (!formData.submitToKRA) return;

        try {
            await productsService.productControllerSubmitToKra(productId);
            toast.success('Product submitted to KRA successfully');
        } catch (error: any) {
            console.error('Failed to submit product to KRA:', error);
            toast.error(`Failed to submit to KRA: ${extractErrorMessage(error)}`);
        }
    };

    // Get product type icon
    const getProductTypeIcon = (productType: ProductType) => {
        const IconComponent = productTypeIcons[productType];
        return IconComponent ? <IconComponent className="h-5 w-5" /> : <Package className="h-5 w-5" />;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please log in to create products');
            return;
        }

        const merchantId = getMerchantId();
        if (!merchantId) {
            toast.error('Merchant ID not found');
            return;
        }

        setLoading(true);

        try {
            let savedProduct;

            if (isEditMode && id) {
                // Update existing product
                const updateProductData = {
                    name: formData.name,
                    code: formData.code,
                    description: formData.description || undefined,
                    categoryId: formData.categoryId,
                    subcategory: formData.subcategory || undefined,
                    barcode: formData.barcode || undefined,
                    sku: formData.sku || undefined,
                    unitOfMeasureId: formData.unitOfMeasureId || undefined,
                    costPrice: formData.costPrice,
                    sellingPrice: formData.sellingPrice,
                    taxRate: formData.taxRate,
                    isActive: formData.isActive,
                    kraItemCode: formData.kraItemCode || undefined,
                    imageUrl: formData.imageUrl || undefined,

                    // New Product Type and Inventory Fields
                    productType: formData.productType as unknown as CreateProductDto.productType,
                    trackInventory: formData.trackInventory,
                    vendorId: formData.vendorId || undefined,
                    reorderLevel: formData.reorderLevel || undefined,

                    // KRA fields
                    kraTaxTypeId: formData.kraTaxTypeId || undefined,
                    kraPackagingUnitId: formData.kraPackagingUnitId || undefined,
                    kraUnitOfMeasurementId: formData.kraUnitOfMeasurementId || undefined,
                    kraOriginNationCode: formData.kraOriginNationCode || undefined,
                    kraItemClassificationCode: formData.kraItemClassificationCode || undefined,

                    // Import fields
                    isImported: formData.isImported,
                    importHsCode: formData.importHsCode || undefined,
                    importTaskCode: formData.importTaskCode || undefined,
                    importBatchNumber: formData.importBatchNumber || undefined,
                    importDeclarationDate: formData.importDeclarationDate || undefined,
                    importItemSequence: formData.importItemSequence,
                    importItemStatusCode: formData.importItemStatusCode || undefined,
                    importRemark: formData.importRemark || undefined,
                };

                savedProduct = await productsService.productControllerUpdate(id, updateProductData);
            } else {
                // Create new product
                const productData: CreateProductDto = {
                    merchantId,
                    name: formData.name,
                    // Only include code if not a Kenyan merchant (it will be auto-generated)
                    ...(isKenyaMerchant ? {} : { code: formData.code }),
                    description: formData.description || undefined,
                    categoryId: formData.categoryId,
                    subcategory: formData.subcategory || undefined,
                    barcode: formData.barcode || undefined,
                    sku: formData.sku || undefined,
                    unitOfMeasureId: formData.unitOfMeasureId || undefined,
                    costPrice: formData.costPrice,
                    sellingPrice: formData.sellingPrice,
                    taxRate: formData.taxRate,
                    isActive: formData.isActive,
                    kraItemCode: formData.kraItemCode || undefined,
                    imageUrl: formData.imageUrl || undefined,

                    // New Product Type and Inventory Fields
                    productType: formData.productType as unknown as CreateProductDto.productType,
                    trackInventory: formData.trackInventory,
                    vendorId: formData.vendorId || undefined,
                    stockLevel: formData.stockLevel || 0,
                    reorderLevel: formData.reorderLevel || 0,
                    hasBom: formData.productType === ProductType.KIT, // KIT products have BOM by definition

                    // KRA fields
                    kraTaxTypeId: formData.kraTaxTypeId || undefined,
                    kraPackagingUnitId: formData.kraPackagingUnitId || undefined,
                    kraUnitOfMeasurementId: formData.kraUnitOfMeasurementId || undefined,
                    kraOriginNationCode: formData.kraOriginNationCode || undefined,
                    kraItemClassificationCode: formData.kraItemClassificationCode || undefined,

                    // Import fields
                    isImported: formData.isImported,
                    importHsCode: formData.importHsCode || undefined,
                    importTaskCode: formData.importTaskCode || undefined,
                    importBatchNumber: formData.importBatchNumber || undefined,
                    importDeclarationDate: formData.importDeclarationDate || undefined,
                    importItemSequence: formData.importItemSequence,
                    importItemStatusCode: formData.importItemStatusCode || undefined,
                    importRemark: formData.importRemark || undefined,
                };

                savedProduct = await productsService.productControllerCreate(productData);
            }

            toast.success(isEditMode ? 'Product updated successfully' : 'Product created successfully');

            // Submit to KRA if requested
            if (formData.submitToKRA && savedProduct.id) {
                await handleKraSubmissionAfterSave(savedProduct.id);
            }

            navigate('/products');
        } catch (error: any) {
            console.error('Failed to save product:', error);

            // Extract user-friendly error message using shared utility
            const errorMessage = extractErrorMessage(error);

            // Show specific error message to user
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to create products</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/products')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isEditMode ? 'Edit Product' : 'Create Product'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditMode ? 'Update product information' : 'Add a new product to your catalog'}
                    </p>
                </div>
                {isEditMode && isKenyaMerchant && (
                    <div className="flex flex-col items-end">
                        <KraSyncIndicator
                            kraSubmitted={productKraData.kraSubmitted}
                            kraSubmittedAt={productKraData.kraSubmittedAt}
                            kraSubmissionData={productKraData.kraSubmissionData}
                        />
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Type Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Product Type
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.values(ProductType).map((type) => {
                                const Icon = productTypeIcons[type];
                                const isSelected = formData.productType === type;

                                return (
                                    <div
                                        key={type}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${isSelected
                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => handleFormChange('productType', type)}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                            <h3 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {productTypeLabels[type]}
                                            </h3>
                                        </div>
                                        <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                                            {productTypeDescriptions[type]}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Inventory Tracking Toggle */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <Label className="text-sm font-medium">Track Inventory</Label>
                                <p className="text-xs text-gray-600 mt-1">
                                    {formData.productType === ProductType.SERVICE
                                        ? 'Services cannot track inventory'
                                        : formData.productType === ProductType.STORABLE_PRODUCT
                                            ? 'Storable products should track inventory'
                                            : 'Optional for kit products (for direct sales)'}
                                </p>
                            </div>
                            <Switch
                                checked={formData.trackInventory}
                                onCheckedChange={(checked) => handleFormChange('trackInventory', checked)}
                                disabled={formData.productType === ProductType.SERVICE}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => handleFormChange('name', e.target.value)}
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Product Code *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => handleFormChange('code', e.target.value)}
                                    placeholder={isKenyaMerchant ? "Auto-generated on save" : "Enter product code"}
                                    required={!isKenyaMerchant}
                                    disabled={isKenyaMerchant || isEditMode}
                                />
                                {isKenyaMerchant && !isEditMode && (
                                    <p className="text-xs text-muted-foreground text-blue-600">
                                        🇰🇪 Product code will be auto-generated using KRA-compliant format when you provide packaging unit and unit of measurement
                                    </p>
                                )}
                                {isEditMode && (
                                    <p className="text-xs text-muted-foreground">Product code cannot be changed after creation</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleFormChange('description', e.target.value)}
                                placeholder="Enter product description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Category *</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(value) => handleFormChange('categoryId', value)}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subcategory">Subcategory</Label>
                                <Input
                                    id="subcategory"
                                    value={formData.subcategory}
                                    onChange={(e) => handleFormChange('subcategory', e.target.value)}
                                    placeholder="Enter subcategory"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={formData.sku}
                                    onChange={(e) => handleFormChange('sku', e.target.value)}
                                    placeholder="Enter SKU"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="barcode">Barcode</Label>
                                <Input
                                    id="barcode"
                                    value={formData.barcode}
                                    onChange={(e) => handleFormChange('barcode', e.target.value)}
                                    placeholder="Enter barcode"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="costPrice">Cost Price *</Label>
                                <Input
                                    id="costPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.costPrice}
                                    onChange={(e) => handleFormChange('costPrice', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="sellingPrice">Selling Price *</Label>
                                <Input
                                    id="sellingPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.sellingPrice}
                                    onChange={(e) => handleFormChange('sellingPrice', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.taxRate}
                                    onChange={(e) => handleFormChange('taxRate', parseFloat(e.target.value) || 0)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory & Vendor Information */}
                {formData.trackInventory && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory & Vendor Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="vendor">Vendor</Label>
                                    <VendorSearch
                                        value={formData.vendorId}
                                        onValueChange={(vendorId) => handleFormChange('vendorId', vendorId || '')}
                                        placeholder="Select vendor"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="reorderLevel">Reorder Level</Label>
                                    <Input
                                        id="reorderLevel"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.reorderLevel}
                                        onChange={(e) => handleFormChange('reorderLevel', parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Minimum stock level before reordering
                                    </p>
                                </div>
                            </div>

                            {!isEditMode && (
                                <div>
                                    <Label htmlFor="stockLevel">Initial Stock Level</Label>
                                    <Input
                                        id="stockLevel"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.stockLevel}
                                        onChange={(e) => handleFormChange('stockLevel', parseFloat(e.target.value) || 0)}
                                        placeholder="0"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Starting stock quantity for this product
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Bill of Materials Information */}
                {formData.productType === ProductType.KIT && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                Bill of Materials (BOM)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                                <div className="flex items-start gap-3">
                                    <Layers className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-blue-900">Kit Product</h4>
                                        <p className="text-sm text-blue-800">
                                            This product is a kit that combines other products. You'll need to define which products and quantities make up this kit.
                                        </p>
                                    </div>
                                </div>

                                {isEditMode && id && (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => navigate(`/products/${id}/bom`)}
                                        >
                                            <Layers className="h-4 w-4 mr-2" />
                                            Manage BOM
                                        </Button>
                                    </div>
                                )}

                                {!isEditMode && (
                                    <p className="text-xs text-blue-600">
                                        You can create and manage the BOM after saving the product.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* KRA Integration (Kenya merchants only) */}
                {isKenyaMerchant && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                KRA Integration
                                {isEditMode && productKraData.kraSubmitted && (
                                    <KraSyncIndicator
                                        kraSubmitted={productKraData.kraSubmitted}
                                        kraSubmittedAt={productKraData.kraSubmittedAt}
                                        kraSubmissionData={productKraData.kraSubmissionData}
                                    />
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="kraTaxType">KRA Tax Type</Label>
                                    <Select
                                        value={formData.kraTaxTypeId}
                                        onValueChange={(value) => handleFormChange('kraTaxTypeId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select tax type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kraTaxTypes.map((taxType) => (
                                                <SelectItem key={taxType.id} value={taxType.id}>
                                                    {taxType.name} ({taxType.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="kraPackagingUnit">KRA Packaging Unit</Label>
                                    <Select
                                        value={formData.kraPackagingUnitId}
                                        onValueChange={(value) => handleFormChange('kraPackagingUnitId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select packaging unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kraPackagingUnits.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id}>
                                                    {unit.name} ({unit.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="kraUnitOfMeasurement">KRA Unit of Measurement</Label>
                                    <Select
                                        value={formData.kraUnitOfMeasurementId}
                                        onValueChange={(value) => handleFormChange('kraUnitOfMeasurementId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select unit of measurement" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kraUnitsOfMeasurement.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id}>
                                                    {unit.name} ({unit.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="kraOriginNation">Origin Country</Label>
                                    <Select
                                        value={formData.kraOriginNationCode}
                                        onValueChange={(value) => handleFormChange('kraOriginNationCode', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select origin country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {kraCountryCodes.map((country) => (
                                                <SelectItem key={country.code} value={country.code}>
                                                    {country.name} ({country.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="kraItemClassification">KRA Item Classification</Label>
                                <KraClassificationSearch
                                    value={formData.kraItemClassificationCode}
                                    onValueChange={(code) => handleFormChange('kraItemClassificationCode', code || '')}
                                    placeholder="Search for item classification"
                                />
                            </div>

                            {/* Import Information */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="isImported"
                                        checked={formData.isImported}
                                        onCheckedChange={(checked) => handleFormChange('isImported', checked)}
                                    />
                                    <Label htmlFor="isImported">This is an imported product</Label>
                                </div>

                                {formData.isImported && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <Label htmlFor="importHsCode">HS Code</Label>
                                            <Input
                                                id="importHsCode"
                                                value={formData.importHsCode}
                                                onChange={(e) => handleFormChange('importHsCode', e.target.value)}
                                                placeholder="Enter HS code"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="importTaskCode">Task Code</Label>
                                            <Input
                                                id="importTaskCode"
                                                value={formData.importTaskCode}
                                                onChange={(e) => handleFormChange('importTaskCode', e.target.value)}
                                                placeholder="Enter task code"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="importBatchNumber">Batch Number</Label>
                                            <Input
                                                id="importBatchNumber"
                                                value={formData.importBatchNumber}
                                                onChange={(e) => handleFormChange('importBatchNumber', e.target.value)}
                                                placeholder="Enter batch number"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="importDeclarationDate">Declaration Date</Label>
                                            <Input
                                                id="importDeclarationDate"
                                                type="date"
                                                value={formData.importDeclarationDate}
                                                onChange={(e) => handleFormChange('importDeclarationDate', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="importItemSequence">Item Sequence</Label>
                                            <Input
                                                id="importItemSequence"
                                                type="number"
                                                min="1"
                                                value={formData.importItemSequence}
                                                onChange={(e) => handleFormChange('importItemSequence', parseInt(e.target.value) || 1)}
                                                placeholder="1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="importRemark">Import Remarks</Label>
                                            <Input
                                                id="importRemark"
                                                value={formData.importRemark}
                                                onChange={(e) => handleFormChange('importRemark', e.target.value)}
                                                placeholder="Enter remarks"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* KRA Submission */}
                            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <Switch
                                    id="submitToKRA"
                                    checked={formData.submitToKRA}
                                    onCheckedChange={(checked) => handleFormChange('submitToKRA', checked)}
                                />
                                <div>
                                    <Label htmlFor="submitToKRA" className="text-green-900">
                                        Submit to KRA after saving
                                    </Label>
                                    <p className="text-xs text-green-700">
                                        Automatically submit this product to KRA VSCU after creating/updating
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Additional Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="imageUrl">Product Image URL</Label>
                            <Input
                                id="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                                placeholder="https://example.com/product-image.jpg"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => handleFormChange('isActive', checked)}
                            />
                            <Label htmlFor="isActive">Product is active</Label>
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/products')}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {isEditMode ? 'Update Product' : 'Create Product'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
} 