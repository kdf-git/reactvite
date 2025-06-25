import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Edit, Trash2, MapPin, Eye } from 'lucide-react';
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
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { branchesService } from '@/services/sdk';
import type { BranchResponseDto } from '@/lib/sdk';

// Update interfaces to match the API DTOs
interface Branch extends BranchResponseDto { }

export default function BranchesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

    // Check if merchant is from Kenya
    const isKenyanMerchant = user?.merchant?.country === 'KE';

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

    // Load branches from API
    const loadBranches = async () => {
        try {
            setLoading(true);
            const merchantId = getMerchantId();
            if (!merchantId) {
                throw new Error('Merchant ID not found. Please ensure you are logged in.');
            }

            const branchesData = await branchesService.branchControllerFindAll(merchantId);
            setBranches(branchesData);
        } catch (error: any) {
            console.error('Failed to load branches:', error);
            toast.error(error.message || 'Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadBranches();
        }
    }, [user]);

    const filteredBranches = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle delete branch
    const handleDeleteBranch = async () => {
        if (!deletingBranch) return;

        try {
            await branchesService.branchControllerRemove(deletingBranch.id);
            toast.success('Branch deleted successfully');
            setShowDeleteDialog(false);
            setDeletingBranch(null);
            loadBranches();
        } catch (error: any) {
            console.error('Failed to delete branch:', error);
            toast.error(error.message || 'Failed to delete branch');
        }
    };

    // Handle toggle branch status
    const handleToggleStatus = async (branch: Branch) => {
        try {
            await branchesService.branchControllerToggleStatus(branch.id);
            toast.success(`Branch ${branch.isActive ? 'deactivated' : 'activated'} successfully`);
            loadBranches();
        } catch (error: any) {
            console.error('Failed to toggle branch status:', error);
            toast.error(error.message || 'Failed to update branch status');
        }
    };

    // Show loading or error if user is not available
    if (!user) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-muted-foreground">Please log in to view branches</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
                    <p className="text-muted-foreground">
                        Manage your branch locations and operations
                    </p>
                </div>
                <Button onClick={() => navigate('/branches/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Branch
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Search Branches</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, code, or address..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Branches Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Branches ({filteredBranches.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Contact</TableHead>
                                {isKenyanMerchant && <TableHead>KRA ID</TableHead>}
                                <TableHead>Status</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={isKenyanMerchant ? 7 : 6} className="text-center py-8">
                                        Loading branches...
                                    </TableCell>
                                </TableRow>
                            ) : filteredBranches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isKenyanMerchant ? 7 : 6} className="text-center py-8">
                                        No branches found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBranches.map((branch) => (
                                    <TableRow key={branch.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{branch.name}</div>
                                                    {branch.isHeadOffice && (
                                                        <Badge variant="outline" className="text-xs">
                                                            Head Office
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-sm font-medium">{branch.code}</code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {branch.address}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm space-y-1">
                                                <div>{branch.contactPhone}</div>
                                                {branch.contactEmail && (
                                                    <div className="text-muted-foreground">{branch.contactEmail}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        {isKenyanMerchant && (
                                            <TableCell>
                                                {branch.kraVscuBhfId ? (
                                                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                                        {branch.kraVscuBhfId}
                                                    </code>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Not set</span>
                                                )}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                                                {branch.isActive ? 'Active' : 'Inactive'}
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
                                                        onClick={() => navigate(`/branches/${branch.id}/view`)}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => navigate(`/branches/${branch.id}/edit`)}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleStatus(branch)}
                                                    >
                                                        <MapPin className="mr-2 h-4 w-4" />
                                                        {branch.isActive ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setDeletingBranch(branch);
                                                            setShowDeleteDialog(true);
                                                        }}
                                                        className="text-destructive"
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

            {/* Delete Branch Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Branch</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deletingBranch?.name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteBranch}>
                            Delete Branch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 