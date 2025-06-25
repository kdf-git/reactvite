import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, Package, Save, X, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useMerchantSettings, formatCurrency } from '@/hooks/useMerchantSettings';
import { stockService, productsService } from '@/services/sdk';
import { ProductSearch } from '@/components/ui/stock-item-search';
import type {
    BOMResponseDto,
    BOMItemResponseDto,
    CreateBOMDto,
    UpdateBOMDto,
    CreateBOMItemDto,
    UpdateBOMItemDto,
    ProductResponseDto
} from '@/lib/sdk';

interface BOMFormData {
    name: string;
    description: string;
}

interface BOMItemFormData {
    id?: string;
    productId: string; // Updated from stockItemId to productId
    productName: string; // Updated from stockItemName to productName
    productCode: string; // Updated from stockItemCode to productCode
    quantity: number;
    unitCost: number;
    totalCost: number;
    isEditing?: boolean;
}

export default function BOMManagementPage() {
    const { user } = useAuth();
    const merchantSettings = useMerchantSettings();
    const navigate = useNavigate();
    const { productId } = useParams<{ productId: string }>();

    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<ProductResponseDto | null>(null);
    const [bom, setBom] = useState<BOMResponseDto | null>(null);
    const [bomItems, setBomItems] = useState<BOMItemFormData[]>([]);
    const [formData, setFormData] = useState<BOMFormData>({
        name: '',
        description: ''
    });
    const [isEditingBom, setIsEditingBom] = useState(false);

    // Load product and BOM data
    useEffect(() => {
        if (productId) {
            loadProductAndBomData();
        }
    }, [productId]);

    const loadProductAndBomData = async () => {
        if (!productId) return;

        setLoading(true);
        try {
            // Load product details first
            const productData = await productsService.productControllerFindOne(productId);
            setProduct(productData);

            // Check if this is a KIT product
            if (productData.productType !== 'KIT') {
                toast.error('BOM can only be created for KIT products');
                navigate('/products');
                return;
            }

            // Get BOMs for this product
            const bomsResponse = await stockService.stockControllerGetBoMsByProduct(productId);

            if (bomsResponse && bomsResponse.length > 0) {
                const existingBom = bomsResponse[0]; // Assuming one BOM per product
                setBom(existingBom);
                setFormData({
                    name: existingBom.name,
                    description: existingBom.description || ''
                });

                // Load BOM items
                const itemsResponse = await stockService.stockControllerGetBomItems(existingBom.id);
                setBomItems(itemsResponse.map(item => ({
                    id: item.id,
                    productId: item.stockItemId, // Backend still uses stockItemId but it now references productId
                    productName: item.stockItem?.name || '', // Backend still uses stockItem but it now references product
                    productCode: item.stockItem?.stockCode || '', // Backend still uses stockCode but it now references product code
                    quantity: item.quantity,
                    unitCost: item.stockItem?.costPrice || 0,
                    totalCost: item.quantity * (item.stockItem?.costPrice || 0),
                    isEditing: false
                })));
            } else {
                // No existing BOM, prepare for creation
                setIsEditingBom(true);
                setFormData({
                    name: `BOM for ${productData.name}`,
                    description: ''
                });
            }
        } catch (error: any) {
            console.error('Failed to load product and BOM data:', error);
            toast.error('Failed to load BOM data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBom = async () => {
        if (!productId) return;

        if (!formData.name.trim()) {
            toast.error('Please enter a BOM name');
            return;
        }

        setLoading(true);
        try {
            if (bom) {
                // Update existing BOM
                const updateData: UpdateBOMDto = {
                    name: formData.name,
                    description: formData.description || undefined
                };

                const updatedBom = await stockService.stockControllerUpdateBom(bom.id, updateData);
                setBom(updatedBom);
                toast.success('BOM updated successfully');
            } else {
                // Create new BOM
                const createData: CreateBOMDto = {
                    productId,
                    name: formData.name,
                    description: formData.description || undefined
                };

                const newBom = await stockService.stockControllerCreateBom(createData);
                setBom(newBom);
                toast.success('BOM created successfully');
            }
            setIsEditingBom(false);
        } catch (error: any) {
            console.error('Failed to save BOM:', error);
            toast.error(error.message || 'Failed to save BOM');
        } finally {
            setLoading(false);
        }
    };

    const addBomItem = () => {
        setBomItems(prev => [...prev, {
            productId: '',
            productName: '',
            productCode: '',
            quantity: 1,
            unitCost: 0,
            totalCost: 0,
            isEditing: true
        }]);
    };

    const handleProductSelect = (index: number, product: any) => {
        setBomItems(prev => {
            const newItems = [...prev];
            newItems[index] = {
                ...newItems[index],
                productId: product.id,
                productName: product.name,
                productCode: product.code || '',
                unitCost: product.costPrice || 0,
                totalCost: newItems[index].quantity * (product.costPrice || 0)
            };
            return newItems;
        });
    };

    const updateBomItemQuantity = (index: number, quantity: number) => {
        setBomItems(prev => {
            const newItems = [...prev];
            newItems[index] = {
                ...newItems[index],
                quantity,
                totalCost: quantity * newItems[index].unitCost
            };
            return newItems;
        });
    };

    const saveBomItem = async (index: number) => {
        if (!bom) {
            toast.error('Please save the BOM first');
            return;
        }

        const item = bomItems[index];

        if (!item.productId) {
            toast.error('Please select a product');
            return;
        }

        if (item.quantity <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        setLoading(true);
        try {
            if (item.id) {
                // Update existing BOM item
                const updateData: UpdateBOMItemDto = {
                    quantity: item.quantity
                };

                await stockService.stockControllerUpdateBomItem(item.id, updateData);
            } else {
                // Create new BOM item
                const createData: CreateBOMItemDto = {
                    stockItemId: item.productId, // Note: Backend DTO still uses stockItemId for compatibility
                    quantity: item.quantity
                };

                const newItem = await stockService.stockControllerAddBomItem(bom.id, createData);

                // Update the item with the new ID
                setBomItems(prev => {
                    const newItems = [...prev];
                    newItems[index] = { ...newItems[index], id: newItem.id, isEditing: false };
                    return newItems;
                });
            }

            toast.success('BOM item saved successfully');
            setBomItems(prev => {
                const newItems = [...prev];
                newItems[index] = { ...newItems[index], isEditing: false };
                return newItems;
            });
        } catch (error: any) {
            console.error('Failed to save BOM item:', error);
            toast.error(error.message || 'Failed to save BOM item');
        } finally {
            setLoading(false);
        }
    };

    const deleteBomItem = async (index: number) => {
        const item = bomItems[index];

        if (item.id) {
            setLoading(true);
            try {
                await stockService.stockControllerDeleteBomItem(item.id);
                toast.success('BOM item deleted successfully');
                setBomItems(prev => prev.filter((_, i) => i !== index));
            } catch (error: any) {
                console.error('Failed to delete BOM item:', error);
                toast.error(error.message || 'Failed to delete BOM item');
            } finally {
                setLoading(false);
            }
        } else {
            // Just remove from local state if not saved yet
            setBomItems(prev => prev.filter((_, i) => i !== index));
        }
    };

    const toggleEditBomItem = (index: number) => {
        setBomItems(prev => {
            const newItems = [...prev];
            newItems[index].isEditing = !newItems[index].isEditing;
            return newItems;
        });
    };

    const calculateTotalCost = () => {
        return bomItems.reduce((sum, item) => sum + item.totalCost, 0);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to manage BOMs</p>
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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Package className="h-8 w-8" />
                        Bill of Materials Management
                    </h1>
                    <p className="text-muted-foreground">
                        {bom ? 'Manage components for this product' : 'Create a new Bill of Materials for this product'}
                    </p>
                </div>
            </div>

            {/* BOM Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>BOM Information</CardTitle>
                        {bom && !isEditingBom && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditingBom(true)}
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit BOM Details
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bomName">BOM Name *</Label>
                            <Input
                                id="bomName"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter BOM name"
                                disabled={!isEditingBom}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Total Cost</Label>
                            <Input
                                value={formatCurrency(calculateTotalCost(), merchantSettings)}
                                disabled
                                className="bg-muted font-semibold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bomDescription">Description</Label>
                        <Textarea
                            id="bomDescription"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter BOM description"
                            disabled={!isEditingBom}
                            rows={3}
                        />
                    </div>

                    {isEditingBom && (
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleSaveBom}
                                disabled={loading}
                                size="sm"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {loading ? 'Saving...' : bom ? 'Update BOM' : 'Create BOM'}
                            </Button>
                            {bom && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditingBom(false);
                                        setFormData({
                                            name: bom.name,
                                            description: bom.description || ''
                                        });
                                    }}
                                    size="sm"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* BOM Items */}
            {bom && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>BOM Components</CardTitle>
                            <Button onClick={addBomItem} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Component
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {bomItems.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No components added yet. Click "Add Component" to get started.
                            </div>
                        ) : (
                            bomItems.map((item, index) => (
                                <Card key={index} className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium">Component {index + 1}</h4>
                                        <div className="flex items-center gap-2">
                                            {!item.isEditing && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleEditBomItem(index)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => deleteBomItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="space-y-2 lg:col-span-2">
                                            <Label>Product *</Label>
                                            {item.isEditing ? (
                                                <ProductSearch
                                                    value={item.productId}
                                                    onValueChange={(value) => {
                                                        setBomItems(prev => {
                                                            const newItems = [...prev];
                                                            newItems[index].productId = value || '';
                                                            return newItems;
                                                        });
                                                    }}
                                                    onProductSelect={(product) => handleProductSelect(index, product)}
                                                    placeholder="Search and select product"
                                                />
                                            ) : (
                                                <Input
                                                    value={`${item.productCode} - ${item.productName}`}
                                                    disabled
                                                    className="bg-muted"
                                                />
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Quantity *</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.quantity}
                                                onChange={(e) => updateBomItemQuantity(index, parseFloat(e.target.value) || 0)}
                                                placeholder="0"
                                                disabled={!item.isEditing}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Total Cost</Label>
                                            <Input
                                                value={formatCurrency(item.totalCost, merchantSettings)}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>
                                    </div>

                                    {item.isEditing && (
                                        <div className="flex items-center gap-2 mt-4">
                                            <Button
                                                onClick={() => saveBomItem(index)}
                                                disabled={loading}
                                                size="sm"
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {loading ? 'Saving...' : item.id ? 'Update' : 'Save'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => toggleEditBomItem(index)}
                                                size="sm"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 