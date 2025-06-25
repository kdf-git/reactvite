import { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Tag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { categoriesService } from '@/services/sdk';
import type { CategoryResponseDto, CreateCategoryDto, UpdateCategoryDto } from '@/lib/sdk';

// Update interfaces to match the API DTOs
interface Category extends CategoryResponseDto { }

interface CategoryFormData {
    name: string;
    description: string;
    isActive: boolean;
}

interface CategoriesPageState {
    categories: Category[];
    loading: boolean;
    error: string | null;
    filters: {
        search: string;
        isActive?: boolean;
    };
    showCreateDialog: boolean;
    showEditDialog: boolean;
    showDeleteDialog: boolean;
    showViewDialog: boolean;
    editingCategory: Category | null;
    deletingCategory: Category | null;
    viewingCategory: Category | null;
}

const initialFormData: CategoryFormData = {
    name: '',
    description: '',
    isActive: true,
};

export default function CategoriesPage() {
    const { user } = useAuth();
    const [state, setState] = useState<CategoriesPageState>({
        categories: [],
        loading: true,
        error: null,
        filters: {
            search: '',
        },
        showCreateDialog: false,
        showEditDialog: false,
        showDeleteDialog: false,
        showViewDialog: false,
        editingCategory: null,
        deletingCategory: null,
        viewingCategory: null,
    });

    const [createForm, setCreateForm] = useState<CategoryFormData>(initialFormData);
    const [editForm, setEditForm] = useState<CategoryFormData>(initialFormData);

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

    // Load categories from API
    const loadCategories = async () => {
        try {
            setState(prev => ({ ...prev, loading: true, error: null }));

            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            let categories: Category[] = [];

            // Apply filters and call appropriate API endpoint
            if (state.filters.search) {
                categories = await categoriesService.categoryControllerFindAll(
                    merchantId,
                    state.filters.search
                );
            } else {
                categories = await categoriesService.categoryControllerFindAll(
                    merchantId,
                    ''
                );
            }

            // Apply client-side filters
            let filteredCategories = [...categories];

            if (state.filters.isActive !== undefined) {
                filteredCategories = filteredCategories.filter(category =>
                    category.isActive === state.filters.isActive
                );
            }

            setState(prev => ({
                ...prev,
                categories: filteredCategories,
                loading: false,
            }));
        } catch (error: any) {
            console.error('Failed to load categories:', error);
            setState(prev => ({
                ...prev,
                error: error.message || 'Failed to load categories',
                loading: false,
            }));
            toast.error(error.message || 'Failed to load categories');
        }
    };

    useEffect(() => {
        if (user) {
            loadCategories();
        }
    }, [user, state.filters]);

    // Handle create category
    const handleCreateCategory = async () => {
        try {
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found');
            }

            const createData: CreateCategoryDto = {
                merchantId,
                name: createForm.name,
                description: createForm.description || undefined,
                isActive: createForm.isActive,
            };

            await categoriesService.categoryControllerCreate(createData);
            toast.success('Category created successfully');
            setState(prev => ({ ...prev, showCreateDialog: false }));
            setCreateForm(initialFormData);
            loadCategories();
        } catch (error: any) {
            console.error('Failed to create category:', error);
            toast.error(error.message || 'Failed to create category');
        }
    };

    // Handle update category
    const handleUpdateCategory = async () => {
        if (!state.editingCategory) return;

        try {
            const updateData: UpdateCategoryDto = {
                name: editForm.name,
                description: editForm.description || undefined,
                isActive: editForm.isActive,
            };

            await categoriesService.categoryControllerUpdate(state.editingCategory.id, updateData);
            toast.success('Category updated successfully');
            setState(prev => ({ ...prev, showEditDialog: false, editingCategory: null }));
            setEditForm(initialFormData);
            loadCategories();
        } catch (error: any) {
            console.error('Failed to update category:', error);
            toast.error(error.message || 'Failed to update category');
        }
    };

    // Handle delete category
    const handleDeleteCategory = async () => {
        if (!state.deletingCategory) return;

        try {
            await categoriesService.categoryControllerRemove(state.deletingCategory.id);
            toast.success('Category deleted successfully');
            setState(prev => ({ ...prev, showDeleteDialog: false, deletingCategory: null }));
            loadCategories();
        } catch (error: any) {
            console.error('Failed to delete category:', error);
            toast.error(error.message || 'Failed to delete category');
        }
    };

    // Handle toggle category status
    const handleToggleStatus = async (category: Category) => {
        try {
            await categoriesService.categoryControllerToggleStatus(category.id);
            toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
            loadCategories();
        } catch (error: any) {
            console.error('Failed to toggle category status:', error);
            toast.error(error.message || 'Failed to update category status');
        }
    };

    // Handle search
    const handleSearch = (value: string) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, search: value },
        }));
    };

    // Handle filter change
    const handleFilterChange = (key: string, value: any) => {
        setState(prev => ({
            ...prev,
            filters: { ...prev.filters, [key]: value },
        }));
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view categories</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                    <p className="text-muted-foreground">
                        Manage product categories and organization
                    </p>
                </div>
                <Button onClick={() => setState(prev => ({ ...prev, showCreateDialog: true }))}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </div>


            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="flex-1">
                            <Label htmlFor="search">Search</Label>
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Search categories..."
                                    value={state.filters.search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
                            <div>
                                <Label>Status</Label>
                                <Select
                                    value={state.filters.isActive?.toString() || 'all'}
                                    onValueChange={(value) =>
                                        handleFilterChange('isActive', value === 'all' ? undefined : value === 'true')
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="true">Active</SelectItem>
                                        <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button variant="outline" onClick={loadCategories}>
                                    <Search className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {state.error && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive">{state.error}</p>
                    </CardContent>
                </Card>
            )}

            {/* Categories Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Categories ({state.categories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {state.loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        Loading categories...
                                    </TableCell>
                                </TableRow>
                            ) : state.categories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        No categories found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                state.categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <Tag className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{category.name}</div>
                                                    {category.description && (
                                                        <div className="text-sm text-muted-foreground">
                                                            {category.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{category.productCount}</span>
                                                <span className="text-muted-foreground">
                                                    product{category.productCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={category.isActive ? 'default' : 'outline'}
                                                className={category.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'}
                                            >
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showViewDialog: true, viewingCategory: category }));
                                                        }}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setState(prev => ({ ...prev, showEditDialog: true, editingCategory: category }));
                                                            setEditForm({
                                                                name: category.name,
                                                                description: category.description || '',
                                                                isActive: category.isActive,
                                                            });
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => setState(prev => ({ ...prev, showDeleteDialog: true, deletingCategory: category }))}
                                                        className="text-destructive"
                                                        disabled={category.productCount > 0}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Create Category Dialog */}
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Category</DialogTitle>
                        <DialogDescription>
                            Categories are created automatically when you add products.
                            This will help you plan your product organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Category Name *</Label>
                            <Input
                                id="name"
                                value={createForm.name}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter category name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={createForm.description}
                                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Enter category description"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={createForm.isActive}
                                onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCategory}>Add Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Category Dialog */}
            <Dialog open={state.showEditDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showEditDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Category changes affect all products in this category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="editName">Category Name *</Label>
                            <Input
                                id="editName"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="editDescription">Description</Label>
                            <Textarea
                                id="editDescription"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="editIsActive"
                                checked={editForm.isActive}
                                onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                            />
                            <Label htmlFor="editIsActive">Active</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showEditDialog: false }))}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateCategory}>Update Category</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Category Dialog */}
            <Dialog open={state.showViewDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Category Details</DialogTitle>
                    </DialogHeader>
                    {state.viewingCategory && (
                        <div className="grid gap-4 py-4">
                            <div>
                                <Label className="text-sm font-medium text-muted-foreground">Category Name</Label>
                                <p className="text-sm">{state.viewingCategory.name}</p>
                            </div>

                            {state.viewingCategory.description && (
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                    <p className="text-sm">{state.viewingCategory.description}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Product Count</Label>
                                    <p className="text-sm font-medium">{state.viewingCategory.productCount}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                    <div>
                                        <Badge
                                            variant={state.viewingCategory.isActive ? 'default' : 'outline'}
                                            className={state.viewingCategory.isActive ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200 dark:hover:bg-orange-900'}
                                        >
                                            {state.viewingCategory.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showViewDialog: false }))}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Category Dialog */}
            <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            {state.deletingCategory?.productCount === 0
                                ? `Are you sure you want to delete "${state.deletingCategory?.name}"? This action cannot be undone.`
                                : `Cannot delete "${state.deletingCategory?.name}" because it contains ${state.deletingCategory?.productCount} product${state.deletingCategory?.productCount !== 1 ? 's' : ''}. Please move or delete the products first.`
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false }))}>
                            Cancel
                        </Button>
                        {state.deletingCategory?.productCount === 0 && (
                            <Button variant="destructive" onClick={handleDeleteCategory}>
                                Delete Category
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 