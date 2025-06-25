export interface Merchant {
    id: string;
    name: string;
    taxIdentifier?: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    logo?: string;
    isActive: boolean;
    kraEnabled: boolean;
    timezone: string;
    country: string;
    currency: string;
    currencySymbol: string;
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    displayName: string;
    email: string;
    email_verified_at?: string | null;
    phone?: string;
    role: string;
    merchantId?: string | null;
    merchant?: Merchant | null;
    created_at?: string;
    updated_at?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: {
        addressLine1?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
    };
}

export interface AuthResult {
    success: boolean;
    message: string;
    user?: User;
}

export interface ShippingAddress {
    id: string;
    name: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
}

export interface Order {
    id: string;
    userId: string;
    items: any[];
    total: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}
