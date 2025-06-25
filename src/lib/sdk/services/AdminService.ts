/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminCreateUserDto } from '../models/AdminCreateUserDto';
import type { AdminResetPasswordDto } from '../models/AdminResetPasswordDto';
import type { AdminUpdateUserDto } from '../models/AdminUpdateUserDto';
import type { AssignSubscriptionDto } from '../models/AssignSubscriptionDto';
import type { CountryResponseDto } from '../models/CountryResponseDto';
import type { CreateCountryDto } from '../models/CreateCountryDto';
import type { CreateCurrencyDto } from '../models/CreateCurrencyDto';
import type { CreateDepartmentDto } from '../models/CreateDepartmentDto';
import type { CreateDeviceTypeDto } from '../models/CreateDeviceTypeDto';
import type { CreateExpenseCategoryDto } from '../models/CreateExpenseCategoryDto';
import type { CreateItemClassificationDto } from '../models/CreateItemClassificationDto';
import type { CreateKraCountryCodeDto } from '../models/CreateKraCountryCodeDto';
import type { CreateKraCurrencyCodeDto } from '../models/CreateKraCurrencyCodeDto';
import type { CreateKraPackagingUnitDto } from '../models/CreateKraPackagingUnitDto';
import type { CreateKraTaxTypeDto } from '../models/CreateKraTaxTypeDto';
import type { CreateKraUnitOfMeasurementDto } from '../models/CreateKraUnitOfMeasurementDto';
import type { CreateMalaysiaClassificationDto } from '../models/CreateMalaysiaClassificationDto';
import type { CreateMerchantDto } from '../models/CreateMerchantDto';
import type { CreatePositionDto } from '../models/CreatePositionDto';
import type { CreateSubscriptionPlanDto } from '../models/CreateSubscriptionPlanDto';
import type { CreateTimezoneDto } from '../models/CreateTimezoneDto';
import type { CurrencyResponseDto } from '../models/CurrencyResponseDto';
import type { DepartmentResponseDto } from '../models/DepartmentResponseDto';
import type { DeviceTypeResponseDto } from '../models/DeviceTypeResponseDto';
import type { ExpenseCategoryResponseDto } from '../models/ExpenseCategoryResponseDto';
import type { ItemClassificationResponseDto } from '../models/ItemClassificationResponseDto';
import type { KraCountryCodeResponseDto } from '../models/KraCountryCodeResponseDto';
import type { KraCurrencyCodeResponseDto } from '../models/KraCurrencyCodeResponseDto';
import type { KraPackagingUnitResponseDto } from '../models/KraPackagingUnitResponseDto';
import type { KraTaxTypeResponseDto } from '../models/KraTaxTypeResponseDto';
import type { KraUnitOfMeasurementResponseDto } from '../models/KraUnitOfMeasurementResponseDto';
import type { MalaysiaClassificationResponseDto } from '../models/MalaysiaClassificationResponseDto';
import type { MerchantResponseDto } from '../models/MerchantResponseDto';
import type { PaginatedResponseDto } from '../models/PaginatedResponseDto';
import type { PositionResponseDto } from '../models/PositionResponseDto';
import type { TimezoneResponseDto } from '../models/TimezoneResponseDto';
import type { ToggleStatusDto } from '../models/ToggleStatusDto';
import type { UpdateCountryDto } from '../models/UpdateCountryDto';
import type { UpdateCurrencyDto } from '../models/UpdateCurrencyDto';
import type { UpdateDepartmentDto } from '../models/UpdateDepartmentDto';
import type { UpdateDeviceTypeDto } from '../models/UpdateDeviceTypeDto';
import type { UpdateExpenseCategoryDto } from '../models/UpdateExpenseCategoryDto';
import type { UpdateItemClassificationDto } from '../models/UpdateItemClassificationDto';
import type { UpdateKraCountryCodeDto } from '../models/UpdateKraCountryCodeDto';
import type { UpdateKraCurrencyCodeDto } from '../models/UpdateKraCurrencyCodeDto';
import type { UpdateKraPackagingUnitDto } from '../models/UpdateKraPackagingUnitDto';
import type { UpdateKraTaxTypeDto } from '../models/UpdateKraTaxTypeDto';
import type { UpdateKraUnitOfMeasurementDto } from '../models/UpdateKraUnitOfMeasurementDto';
import type { UpdateMalaysiaClassificationDto } from '../models/UpdateMalaysiaClassificationDto';
import type { UpdateMerchantDto } from '../models/UpdateMerchantDto';
import type { UpdatePositionDto } from '../models/UpdatePositionDto';
import type { UpdateSubscriptionPlanDto } from '../models/UpdateSubscriptionPlanDto';
import type { UpdateTimezoneDto } from '../models/UpdateTimezoneDto';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class AdminService {
    constructor(public readonly httpRequest: BaseHttpRequest) {}
    /**
     * Create a new user
     * @param requestBody
     * @returns User User created successfully
     * @throws ApiError
     */
    public adminControllerCreateUser(
        requestBody: AdminCreateUserDto,
    ): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/users',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                409: `User with this email already exists`,
            },
        });
    }
    /**
     * Get all users with filtering and pagination
     * @param email Filter by email
     * @param displayName Filter by display name
     * @param isActive Filter by active status
     * @param emailVerified Filter by email verification status
     * @param provider Filter by authentication provider
     * @param role Filter by user role
     * @param merchantId Filter by merchant ID
     * @param startDate Filter by start date range
     * @param endDate Filter by end date range
     * @param search Search term for email or display name
     * @param page Page number (starts from 1)
     * @param limit Number of items per page
     * @param sortBy Field to sort by
     * @param sortOrder Sort order (asc or desc)
     * @returns PaginatedResponseDto Users retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetAllUsers(
        email?: string,
        displayName?: string,
        isActive?: boolean,
        emailVerified?: boolean,
        provider?: string,
        role?: string,
        merchantId?: string,
        startDate?: string,
        endDate?: string,
        search?: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc',
    ): CancelablePromise<PaginatedResponseDto> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/users',
            query: {
                'email': email,
                'displayName': displayName,
                'isActive': isActive,
                'emailVerified': emailVerified,
                'provider': provider,
                'role': role,
                'merchantId': merchantId,
                'startDate': startDate,
                'endDate': endDate,
                'search': search,
                'page': page,
                'limit': limit,
                'sortBy': sortBy,
                'sortOrder': sortOrder,
            },
        });
    }
    /**
     * Get user by ID
     * @param id User ID
     * @returns User User retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetUserById(
        id: string,
    ): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Update user
     * @param id User ID
     * @param requestBody
     * @returns User User updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateUser(
        id: string,
        requestBody: AdminUpdateUserDto,
    ): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/admin/users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `User not found`,
                409: `Email already exists`,
            },
        });
    }
    /**
     * Delete user
     * @param id User ID
     * @returns User User deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteUser(
        id: string,
    ): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/users/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Activate or suspend user
     * @param id User ID
     * @param requestBody
     * @returns User User status updated successfully
     * @throws ApiError
     */
    public adminControllerToggleUserStatus(
        id: string,
        requestBody: ToggleStatusDto,
    ): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/users/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Reset user password
     * @param id User ID
     * @param requestBody
     * @returns User Password reset successfully
     * @throws ApiError
     */
    public adminControllerResetUserPassword(
        id: string,
        requestBody: AdminResetPasswordDto,
    ): CancelablePromise<User> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/users/{id}/reset-password',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `User not found`,
            },
        });
    }
    /**
     * Bulk update user status
     * @param requestBody
     * @returns any Users status updated successfully
     * @throws ApiError
     */
    public adminControllerBulkUpdateUserStatus(
        requestBody: {
            /**
             * Array of user IDs
             */
            userIds: Array<string>;
            /**
             * Active status to set
             */
            isActive: boolean;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/users/bulk/status',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Bulk update merchant status
     * @param requestBody
     * @returns any Merchants status updated successfully
     * @throws ApiError
     */
    public adminControllerBulkUpdateMerchantStatus(
        requestBody: {
            /**
             * Array of merchant IDs
             */
            merchantIds: Array<string>;
            /**
             * Active status to set
             */
            isActive: boolean;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/merchants/bulk/status',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get simple list of merchants for dropdowns
     * @returns any Simple merchant list retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetSimpleMerchantsList(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/merchants/list/simple',
        });
    }
    /**
     * Search merchants with live search functionality
     * @param q Search term for merchant name or email
     * @returns any Merchant search results retrieved successfully
     * @throws ApiError
     */
    public adminControllerSearchMerchants(
        q?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/merchants/search',
            query: {
                'q': q,
            },
        });
    }
    /**
     * Create a new merchant
     * @param requestBody
     * @returns MerchantResponseDto Merchant created successfully
     * @throws ApiError
     */
    public adminControllerCreateMerchant(
        requestBody: CreateMerchantDto,
    ): CancelablePromise<MerchantResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/merchants',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                409: `Merchant with this email or TIN already exists`,
            },
        });
    }
    /**
     * Get all merchants with filtering and pagination
     * @param name Filter by merchant name
     * @param taxIdentifier Filter by tax identifier (TIN)
     * @param contactEmail Filter by contact email
     * @param contactPhone Filter by contact phone
     * @param isActive Filter by active status
     * @param taxIntegrationType Filter by tax integration type
     * @param country Filter by country code
     * @param currency Filter by currency code
     * @param startDate Filter by start date range
     * @param endDate Filter by end date range
     * @param search Search term for name, email, phone, or address
     * @param page Page number (starts from 1)
     * @param limit Number of items per page
     * @param sortBy Field to sort by
     * @param sortOrder Sort order (asc or desc)
     * @returns any Merchants retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetAllMerchants(
        name?: string,
        taxIdentifier?: string,
        contactEmail?: string,
        contactPhone?: string,
        isActive?: boolean,
        taxIntegrationType?: 'NONE' | 'KRA' | 'MALAYSIA_EINVOICE',
        country?: string,
        currency?: string,
        startDate?: string,
        endDate?: string,
        search?: string,
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'desc',
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/merchants',
            query: {
                'name': name,
                'taxIdentifier': taxIdentifier,
                'contactEmail': contactEmail,
                'contactPhone': contactPhone,
                'isActive': isActive,
                'taxIntegrationType': taxIntegrationType,
                'country': country,
                'currency': currency,
                'startDate': startDate,
                'endDate': endDate,
                'search': search,
                'page': page,
                'limit': limit,
                'sortBy': sortBy,
                'sortOrder': sortOrder,
            },
        });
    }
    /**
     * Get merchant by ID
     * @param id Merchant ID
     * @returns any Merchant retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetMerchantById(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/merchants/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Merchant not found`,
            },
        });
    }
    /**
     * Update merchant
     * @param id Merchant ID
     * @param requestBody
     * @returns any Merchant updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateMerchant(
        id: string,
        requestBody: UpdateMerchantDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/admin/merchants/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Merchant not found`,
                409: `Email or TIN already exists`,
            },
        });
    }
    /**
     * Delete merchant
     * @param id Merchant ID
     * @returns any Merchant deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteMerchant(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/merchants/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Merchant not found`,
            },
        });
    }
    /**
     * Activate or suspend merchant
     * @param id Merchant ID
     * @param requestBody
     * @returns any Merchant status updated successfully
     * @throws ApiError
     */
    public adminControllerToggleMerchantStatus(
        id: string,
        requestBody: ToggleStatusDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/merchants/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Merchant not found`,
            },
        });
    }
    /**
     * Update merchant tax integration type
     * @param id Merchant ID
     * @param requestBody
     * @returns any Merchant tax integration type updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateMerchantTaxIntegrationType(
        id: string,
        requestBody: {
            /**
             * Tax integration type
             */
            taxIntegrationType: 'NONE' | 'KRA' | 'MALAYSIA_EINVOICE';
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/merchants/{id}/tax-integration',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Merchant not found`,
            },
        });
    }
    /**
     * Get merchant statistics
     * @param id Merchant ID
     * @returns any Merchant statistics retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetMerchantStats(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/merchants/{id}/stats',
            path: {
                'id': id,
            },
            errors: {
                404: `Merchant not found`,
            },
        });
    }
    /**
     * Get all available roles
     * @returns any Roles retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetAllRoles(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/roles',
        });
    }
    /**
     * Get available timezones for admin use
     * @returns any List of available timezones
     * @throws ApiError
     */
    public adminControllerGetTimezones(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/timezones',
        });
    }
    /**
     * Get available countries for admin use
     * @returns any List of available countries
     * @throws ApiError
     */
    public adminControllerGetCountries(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/countries',
        });
    }
    /**
     * Get available currencies for admin use
     * @returns any List of available currencies
     * @throws ApiError
     */
    public adminControllerGetCurrencies(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/currencies',
        });
    }
    /**
     * Get all device types
     * @returns DeviceTypeResponseDto List of device types
     * @throws ApiError
     */
    public adminControllerGetDeviceTypes(): CancelablePromise<Array<DeviceTypeResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/device-types',
        });
    }
    /**
     * Create a new device type
     * @param requestBody
     * @returns DeviceTypeResponseDto Device type created successfully
     * @throws ApiError
     */
    public adminControllerCreateDeviceType(
        requestBody: CreateDeviceTypeDto,
    ): CancelablePromise<DeviceTypeResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/device-types',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update device type
     * @param id Device type ID
     * @param requestBody
     * @returns DeviceTypeResponseDto Device type updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateDeviceType(
        id: string,
        requestBody: UpdateDeviceTypeDto,
    ): CancelablePromise<DeviceTypeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/device-types/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete device type
     * @param id Device type ID
     * @returns DeviceTypeResponseDto Device type deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteDeviceType(
        id: string,
    ): CancelablePromise<DeviceTypeResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/device-types/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle device type active status
     * @param id Device type ID
     * @returns any Device type status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleDeviceType(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/device-types/{id}/toggle',
            path: {
                'id': id,
            },
            errors: {
                404: `Device type not found`,
            },
        });
    }
    /**
     * Get all staff positions
     * @returns PositionResponseDto List of staff positions
     * @throws ApiError
     */
    public adminControllerGetPositions(): CancelablePromise<Array<PositionResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/positions',
        });
    }
    /**
     * Create a new staff position
     * @param requestBody
     * @returns PositionResponseDto Position created successfully
     * @throws ApiError
     */
    public adminControllerCreatePosition(
        requestBody: CreatePositionDto,
    ): CancelablePromise<PositionResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/positions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update staff position
     * @param id Position ID
     * @param requestBody
     * @returns PositionResponseDto Position updated successfully
     * @throws ApiError
     */
    public adminControllerUpdatePosition(
        id: string,
        requestBody: UpdatePositionDto,
    ): CancelablePromise<PositionResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/positions/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete staff position
     * @param id Position ID
     * @returns PositionResponseDto Position deleted successfully
     * @throws ApiError
     */
    public adminControllerDeletePosition(
        id: string,
    ): CancelablePromise<PositionResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/positions/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle position active status
     * @param id Position ID
     * @returns any Position status toggled successfully
     * @throws ApiError
     */
    public adminControllerTogglePosition(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/positions/{id}/toggle',
            path: {
                'id': id,
            },
            errors: {
                404: `Position not found`,
            },
        });
    }
    /**
     * Get all staff departments
     * @returns DepartmentResponseDto List of staff departments
     * @throws ApiError
     */
    public adminControllerGetDepartments(): CancelablePromise<Array<DepartmentResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/departments',
        });
    }
    /**
     * Create a new staff department
     * @param requestBody
     * @returns DepartmentResponseDto Department created successfully
     * @throws ApiError
     */
    public adminControllerCreateDepartment(
        requestBody: CreateDepartmentDto,
    ): CancelablePromise<DepartmentResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/departments',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update staff department
     * @param id Department ID
     * @param requestBody
     * @returns DepartmentResponseDto Department updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateDepartment(
        id: string,
        requestBody: UpdateDepartmentDto,
    ): CancelablePromise<DepartmentResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/departments/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete staff department
     * @param id Department ID
     * @returns DepartmentResponseDto Department deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteDepartment(
        id: string,
    ): CancelablePromise<DepartmentResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/departments/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle department active status
     * @param id Department ID
     * @returns any Department status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleDepartment(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/departments/{id}/toggle',
            path: {
                'id': id,
            },
            errors: {
                404: `Department not found`,
            },
        });
    }
    /**
     * Get all expense categories
     * @returns ExpenseCategoryResponseDto Expense categories retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetExpenseCategories(): CancelablePromise<Array<ExpenseCategoryResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/expense-categories',
        });
    }
    /**
     * Create a new expense category
     * @param requestBody
     * @returns ExpenseCategoryResponseDto Expense category created successfully
     * @throws ApiError
     */
    public adminControllerCreateExpenseCategory(
        requestBody: CreateExpenseCategoryDto,
    ): CancelablePromise<ExpenseCategoryResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/expense-categories',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Expense category with this name already exists`,
            },
        });
    }
    /**
     * Update expense category
     * @param id
     * @param requestBody
     * @returns ExpenseCategoryResponseDto Expense category updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateExpenseCategory(
        id: string,
        requestBody: UpdateExpenseCategoryDto,
    ): CancelablePromise<ExpenseCategoryResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/expense-categories/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Expense category not found`,
                409: `Expense category with this name already exists`,
            },
        });
    }
    /**
     * Delete expense category
     * @param id
     * @returns any Expense category deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteExpenseCategory(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/constants/expense-categories/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Expense category not found`,
                409: `Cannot delete expense category with existing expenses`,
            },
        });
    }
    /**
     * Toggle expense category active status
     * @param id
     * @returns ExpenseCategoryResponseDto Expense category status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleExpenseCategory(
        id: string,
    ): CancelablePromise<ExpenseCategoryResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/expense-categories/{id}/toggle',
            path: {
                'id': id,
            },
            errors: {
                404: `Expense category not found`,
            },
        });
    }
    /**
     * Seed default system-wide expense categories
     * @returns any Expense categories seeded successfully
     * @throws ApiError
     */
    public adminControllerSeedExpenseCategories(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/expense-categories/seed',
        });
    }
    /**
     * Seed Malaysia item classifications from official MSIC source
     * @returns any Malaysia classifications seeded successfully
     * @throws ApiError
     */
    public adminControllerSeedMalaysiaClassifications(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/malaysia-classifications/seed',
        });
    }
    /**
     * Create a new timezone
     * @param requestBody
     * @returns TimezoneResponseDto Timezone created successfully
     * @throws ApiError
     */
    public adminControllerCreateTimezone(
        requestBody: CreateTimezoneDto,
    ): CancelablePromise<TimezoneResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/timezones',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update timezone
     * @param id Timezone ID
     * @param requestBody
     * @returns TimezoneResponseDto Timezone updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateTimezone(
        id: string,
        requestBody: UpdateTimezoneDto,
    ): CancelablePromise<TimezoneResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/timezones/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete timezone
     * @param id Timezone ID
     * @returns TimezoneResponseDto Timezone deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteTimezone(
        id: string,
    ): CancelablePromise<TimezoneResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/timezones/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle timezone active status
     * @param id Timezone ID
     * @returns any Timezone status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleTimezone(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/timezones/{id}/toggle',
            path: {
                'id': id,
            },
            errors: {
                404: `Timezone not found`,
            },
        });
    }
    /**
     * Create a new country
     * @param requestBody
     * @returns CountryResponseDto Country created successfully
     * @throws ApiError
     */
    public adminControllerCreateCountry(
        requestBody: CreateCountryDto,
    ): CancelablePromise<CountryResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/countries',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update country
     * @param id Country ID
     * @param requestBody
     * @returns CountryResponseDto Country updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateCountry(
        id: string,
        requestBody: UpdateCountryDto,
    ): CancelablePromise<CountryResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/countries/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete country
     * @param id Country ID
     * @returns CountryResponseDto Country deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteCountry(
        id: string,
    ): CancelablePromise<CountryResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/countries/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle country active status
     * @param id Country ID
     * @returns any Country status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleCountry(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/countries/{id}/toggle',
            path: {
                'id': id,
            },
            errors: {
                404: `Country not found`,
            },
        });
    }
    /**
     * Create a new currency
     * @param requestBody
     * @returns CurrencyResponseDto Currency created successfully
     * @throws ApiError
     */
    public adminControllerCreateCurrency(
        requestBody: CreateCurrencyDto,
    ): CancelablePromise<CurrencyResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/currencies',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update currency
     * @param id Currency ID
     * @param requestBody
     * @returns CurrencyResponseDto Currency updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateCurrency(
        id: string,
        requestBody: UpdateCurrencyDto,
    ): CancelablePromise<CurrencyResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/currencies/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete currency
     * @param id Currency ID
     * @returns CurrencyResponseDto Currency deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteCurrency(
        id: string,
    ): CancelablePromise<CurrencyResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/currencies/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle currency active status
     * @param id Currency ID
     * @returns any Currency status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleCurrency(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/currencies/{id}/toggle',
            path: {
                'id': id,
            },
            errors: {
                404: `Currency not found`,
            },
        });
    }
    /**
     * Get all item classification codes
     * @returns ItemClassificationResponseDto Item classifications retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetItemClassifications(): CancelablePromise<Array<ItemClassificationResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/item-classifications',
        });
    }
    /**
     * Create a new item classification code
     * @param requestBody
     * @returns ItemClassificationResponseDto Item classification created successfully
     * @throws ApiError
     */
    public adminControllerCreateItemClassification(
        requestBody: CreateItemClassificationDto,
    ): CancelablePromise<ItemClassificationResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/item-classifications',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Item classification with this code already exists`,
            },
        });
    }
    /**
     * Update item classification code
     * @param id Item Classification ID
     * @param requestBody
     * @returns ItemClassificationResponseDto Item classification updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateItemClassification(
        id: string,
        requestBody: UpdateItemClassificationDto,
    ): CancelablePromise<ItemClassificationResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/item-classifications/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Item classification not found`,
                409: `Item classification with this code already exists`,
            },
        });
    }
    /**
     * Delete item classification code
     * @param id Item Classification ID
     * @returns any Item classification deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteItemClassification(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/constants/item-classifications/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Item classification not found`,
                409: `Cannot delete item classification with existing products`,
            },
        });
    }
    /**
     * Toggle item classification active status
     * @param id Item Classification ID
     * @returns ItemClassificationResponseDto Item classification status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleItemClassification(
        id: string,
    ): CancelablePromise<ItemClassificationResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/item-classifications/{id}/toggle',
            path: {
                'id': id,
            },
            errors: {
                404: `Item classification not found`,
            },
        });
    }
    /**
     * Get all Malaysia item classification codes
     * @returns MalaysiaClassificationResponseDto Malaysia classifications retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetMalaysiaClassifications(): CancelablePromise<Array<MalaysiaClassificationResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/malaysia-classifications',
        });
    }
    /**
     * Create a new Malaysia item classification code
     * @param requestBody
     * @returns MalaysiaClassificationResponseDto Malaysia classification created successfully
     * @throws ApiError
     */
    public adminControllerCreateMalaysiaClassification(
        requestBody: CreateMalaysiaClassificationDto,
    ): CancelablePromise<MalaysiaClassificationResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/malaysia-classifications',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Malaysia classification with this code already exists`,
            },
        });
    }
    /**
     * Update Malaysia item classification code
     * @param id Malaysia Classification ID
     * @param requestBody
     * @returns MalaysiaClassificationResponseDto Malaysia classification updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateMalaysiaClassification(
        id: string,
        requestBody: UpdateMalaysiaClassificationDto,
    ): CancelablePromise<MalaysiaClassificationResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/malaysia-classifications/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Malaysia classification not found`,
                409: `Malaysia classification with this code already exists`,
            },
        });
    }
    /**
     * Delete Malaysia item classification code
     * @param id Malaysia Classification ID
     * @returns any Malaysia classification deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteMalaysiaClassification(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/constants/malaysia-classifications/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Malaysia classification not found`,
            },
        });
    }
    /**
     * Toggle Malaysia classification active status
     * @param id Malaysia Classification ID
     * @returns MalaysiaClassificationResponseDto Malaysia classification status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleMalaysiaClassification(
        id: string,
    ): CancelablePromise<MalaysiaClassificationResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/malaysia-classifications/{id}/toggle',
            path: {
                'id': id,
            },
            errors: {
                404: `Malaysia classification not found`,
            },
        });
    }
    /**
     * Get admin dashboard statistics
     * @returns any Dashboard statistics retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetDashboardStats(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/dashboard/stats',
        });
    }
    /**
     * Create a new subscription plan
     * @param requestBody
     * @returns any Subscription plan created successfully
     * @throws ApiError
     */
    public adminControllerCreateSubscriptionPlan(
        requestBody: CreateSubscriptionPlanDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/subscription-plans',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Plan name already exists`,
            },
        });
    }
    /**
     * Get all subscription plans
     * @param country Filter by country code
     * @returns any Subscription plans retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetAllSubscriptionPlans(
        country?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/subscription-plans',
            query: {
                'country': country,
            },
        });
    }
    /**
     * Get subscription plan by ID
     * @param id Subscription plan ID
     * @returns any Subscription plan retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetSubscriptionPlanById(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/subscription-plans/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Subscription plan not found`,
            },
        });
    }
    /**
     * Update subscription plan
     * @param id Subscription plan ID
     * @param requestBody
     * @returns any Subscription plan updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateSubscriptionPlan(
        id: string,
        requestBody: UpdateSubscriptionPlanDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PUT',
            url: '/api/admin/subscription-plans/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Subscription plan not found`,
            },
        });
    }
    /**
     * Delete subscription plan
     * @param id Subscription plan ID
     * @returns any Subscription plan deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteSubscriptionPlan(
        id: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/subscription-plans/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Cannot delete plan with active subscriptions`,
                404: `Subscription plan not found`,
            },
        });
    }
    /**
     * Assign subscription to merchant
     * @param requestBody
     * @returns any Subscription assigned successfully
     * @throws ApiError
     */
    public adminControllerAssignSubscriptionToMerchant(
        requestBody: AssignSubscriptionDto,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/subscriptions/assign',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Merchant or plan not found`,
                409: `Merchant already has active subscription`,
            },
        });
    }
    /**
     * Get all merchant subscriptions with filtering
     * @param page Page number
     * @param limit Items per page
     * @param sortBy Sort field
     * @param sortOrder Sort order
     * @param search Filter by merchant name or email
     * @param status Filter by subscription status
     * @param billingCycle Filter by billing cycle
     * @param planId Filter by subscription plan ID
     * @param isActive Filter by active status
     * @param startDate Filter subscriptions starting from date
     * @param endDate Filter subscriptions ending before date
     * @returns any Merchant subscriptions retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetAllMerchantSubscriptions(
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'createdAt',
        sortOrder: string = 'desc',
        search?: string,
        status?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'SUSPENDED' | 'EXPIRED',
        billingCycle?: 'MONTHLY' | 'ANNUAL',
        planId?: string,
        isActive?: boolean,
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/subscriptions',
            query: {
                'page': page,
                'limit': limit,
                'sortBy': sortBy,
                'sortOrder': sortOrder,
                'search': search,
                'status': status,
                'billingCycle': billingCycle,
                'planId': planId,
                'isActive': isActive,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get subscription details for a specific merchant
     * @param merchantId Merchant ID
     * @returns any Merchant subscription retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetMerchantSubscription(
        merchantId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/subscriptions/merchant/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
            errors: {
                404: `Merchant subscription not found`,
            },
        });
    }
    /**
     * Update merchant subscription
     * @param merchantId Merchant ID
     * @param requestBody
     * @returns any Merchant subscription updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateMerchantSubscription(
        merchantId: string,
        requestBody: {
            /**
             * Updated device count
             */
            deviceCount?: number;
            status?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'SUSPENDED' | 'EXPIRED';
            billingCycle?: 'MONTHLY' | 'ANNUAL';
            /**
             * Custom pricing overrides
             */
            customPricing?: Record<string, any>;
            /**
             * Trial end date
             */
            trialEndDate?: string;
        },
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/subscriptions/merchant/{merchantId}',
            path: {
                'merchantId': merchantId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Merchant subscription not found`,
            },
        });
    }
    /**
     * Generate invoice for subscription
     * @param subscriptionId Subscription ID
     * @returns any Invoice generated successfully
     * @throws ApiError
     */
    public adminControllerGenerateInvoiceForSubscription(
        subscriptionId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/subscriptions/{subscriptionId}/generate-invoice',
            path: {
                'subscriptionId': subscriptionId,
            },
            errors: {
                404: `Subscription not found`,
            },
        });
    }
    /**
     * Process monthly billing for all active subscriptions
     * @returns any Monthly billing processed successfully
     * @throws ApiError
     */
    public adminControllerProcessMonthlyBilling(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/billing/process-monthly',
        });
    }
    /**
     * Update trial status for expired trials
     * @returns any Trial status updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateTrialStatus(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/billing/update-trial-status',
        });
    }
    /**
     * Get all KRA VSCU logs across all merchants with filtering
     * @param page Page number (default: 1)
     * @param limit Items per page (default: 50, max: 100)
     * @param merchantId Filter by merchant ID
     * @param deviceId Filter by device ID
     * @param branchId Filter by branch ID
     * @param operation Filter by operation type
     * @param success Filter by success status
     * @param startDate Start date (ISO string)
     * @param endDate End date (ISO string)
     * @param search Search across multiple fields
     * @returns any KRA VSCU logs retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetAllVscuLogs(
        page?: number,
        limit?: number,
        merchantId?: string,
        deviceId?: string,
        branchId?: string,
        operation?: string,
        success?: boolean,
        startDate?: string,
        endDate?: string,
        search?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/kra-vscu/logs',
            query: {
                'page': page,
                'limit': limit,
                'merchantId': merchantId,
                'deviceId': deviceId,
                'branchId': branchId,
                'operation': operation,
                'success': success,
                'startDate': startDate,
                'endDate': endDate,
                'search': search,
            },
        });
    }
    /**
     * Get overall KRA VSCU statistics across all merchants
     * @param days Number of days to analyze (default: 30)
     * @returns any KRA VSCU statistics retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetAllVscuStatistics(
        days?: number,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/kra-vscu/statistics',
            query: {
                'days': days,
            },
        });
    }
    /**
     * Get detailed information for a specific KRA log entry (admin access)
     * @param logId Log ID
     * @returns any KRA log details retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetVscuLogDetails(
        logId: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/kra-vscu/logs/{logId}',
            path: {
                'logId': logId,
            },
        });
    }
    /**
     * Seed all KRA codes
     * @returns any All KRA codes seeded successfully
     * @throws ApiError
     */
    public adminControllerSeedAllKraCodes(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/kra-codes/seed',
        });
    }
    /**
     * Seed KRA item classifications from VSCU API
     * @returns any KRA item classifications seeded successfully
     * @throws ApiError
     */
    public adminControllerSeedKraItemClassifications(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/kra-item-classifications/seed',
        });
    }
    /**
     * Get all KRA tax types
     * @returns KraTaxTypeResponseDto KRA tax types retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetKraTaxTypes(): CancelablePromise<Array<KraTaxTypeResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/kra-tax-types',
        });
    }
    /**
     * Create KRA tax type
     * @param requestBody
     * @returns KraTaxTypeResponseDto KRA tax type created successfully
     * @throws ApiError
     */
    public adminControllerCreateKraTaxType(
        requestBody: CreateKraTaxTypeDto,
    ): CancelablePromise<KraTaxTypeResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/kra-tax-types',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update KRA tax type
     * @param id KRA tax type ID
     * @param requestBody
     * @returns KraTaxTypeResponseDto KRA tax type updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateKraTaxType(
        id: string,
        requestBody: UpdateKraTaxTypeDto,
    ): CancelablePromise<KraTaxTypeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-tax-types/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete KRA tax type
     * @param id KRA tax type ID
     * @returns KraTaxTypeResponseDto KRA tax type deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteKraTaxType(
        id: string,
    ): CancelablePromise<KraTaxTypeResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/constants/kra-tax-types/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle KRA tax type status
     * @param id KRA tax type ID
     * @returns KraTaxTypeResponseDto KRA tax type status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleKraTaxType(
        id: string,
    ): CancelablePromise<KraTaxTypeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-tax-types/{id}/toggle',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get all KRA country codes
     * @returns KraCountryCodeResponseDto KRA country codes retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetKraCountryCodes(): CancelablePromise<Array<KraCountryCodeResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/kra-country-codes',
        });
    }
    /**
     * Create KRA country code
     * @param requestBody
     * @returns KraCountryCodeResponseDto KRA country code created successfully
     * @throws ApiError
     */
    public adminControllerCreateKraCountryCode(
        requestBody: CreateKraCountryCodeDto,
    ): CancelablePromise<KraCountryCodeResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/kra-country-codes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update KRA country code
     * @param id KRA country code ID
     * @param requestBody
     * @returns KraCountryCodeResponseDto KRA country code updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateKraCountryCode(
        id: string,
        requestBody: UpdateKraCountryCodeDto,
    ): CancelablePromise<KraCountryCodeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-country-codes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete KRA country code
     * @param id KRA country code ID
     * @returns KraCountryCodeResponseDto KRA country code deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteKraCountryCode(
        id: string,
    ): CancelablePromise<KraCountryCodeResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/constants/kra-country-codes/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle KRA country code status
     * @param id KRA country code ID
     * @returns KraCountryCodeResponseDto KRA country code status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleKraCountryCode(
        id: string,
    ): CancelablePromise<KraCountryCodeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-country-codes/{id}/toggle',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get all KRA currency codes
     * @returns KraCurrencyCodeResponseDto KRA currency codes retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetKraCurrencyCodes(): CancelablePromise<Array<KraCurrencyCodeResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/kra-currency-codes',
        });
    }
    /**
     * Create KRA currency code
     * @param requestBody
     * @returns KraCurrencyCodeResponseDto KRA currency code created successfully
     * @throws ApiError
     */
    public adminControllerCreateKraCurrencyCode(
        requestBody: CreateKraCurrencyCodeDto,
    ): CancelablePromise<KraCurrencyCodeResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/kra-currency-codes',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update KRA currency code
     * @param id KRA currency code ID
     * @param requestBody
     * @returns KraCurrencyCodeResponseDto KRA currency code updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateKraCurrencyCode(
        id: string,
        requestBody: UpdateKraCurrencyCodeDto,
    ): CancelablePromise<KraCurrencyCodeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-currency-codes/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete KRA currency code
     * @param id KRA currency code ID
     * @returns KraCurrencyCodeResponseDto KRA currency code deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteKraCurrencyCode(
        id: string,
    ): CancelablePromise<KraCurrencyCodeResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/constants/kra-currency-codes/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle KRA currency code status
     * @param id KRA currency code ID
     * @returns KraCurrencyCodeResponseDto KRA currency code status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleKraCurrencyCode(
        id: string,
    ): CancelablePromise<KraCurrencyCodeResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-currency-codes/{id}/toggle',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get all KRA packaging units
     * @returns KraPackagingUnitResponseDto KRA packaging units retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetKraPackagingUnits(): CancelablePromise<Array<KraPackagingUnitResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/kra-packaging-units',
        });
    }
    /**
     * Create KRA packaging unit
     * @param requestBody
     * @returns KraPackagingUnitResponseDto KRA packaging unit created successfully
     * @throws ApiError
     */
    public adminControllerCreateKraPackagingUnit(
        requestBody: CreateKraPackagingUnitDto,
    ): CancelablePromise<KraPackagingUnitResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/kra-packaging-units',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update KRA packaging unit
     * @param id KRA packaging unit ID
     * @param requestBody
     * @returns KraPackagingUnitResponseDto KRA packaging unit updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateKraPackagingUnit(
        id: string,
        requestBody: UpdateKraPackagingUnitDto,
    ): CancelablePromise<KraPackagingUnitResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-packaging-units/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete KRA packaging unit
     * @param id KRA packaging unit ID
     * @returns KraPackagingUnitResponseDto KRA packaging unit deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteKraPackagingUnit(
        id: string,
    ): CancelablePromise<KraPackagingUnitResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/constants/kra-packaging-units/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle KRA packaging unit status
     * @param id KRA packaging unit ID
     * @returns KraPackagingUnitResponseDto KRA packaging unit status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleKraPackagingUnit(
        id: string,
    ): CancelablePromise<KraPackagingUnitResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-packaging-units/{id}/toggle',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get all KRA units of measurement
     * @returns KraUnitOfMeasurementResponseDto KRA units of measurement retrieved successfully
     * @throws ApiError
     */
    public adminControllerGetKraUnitsOfMeasurement(): CancelablePromise<Array<KraUnitOfMeasurementResponseDto>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/api/admin/constants/kra-units-of-measurement',
        });
    }
    /**
     * Create KRA unit of measurement
     * @param requestBody
     * @returns KraUnitOfMeasurementResponseDto KRA unit of measurement created successfully
     * @throws ApiError
     */
    public adminControllerCreateKraUnitOfMeasurement(
        requestBody: CreateKraUnitOfMeasurementDto,
    ): CancelablePromise<KraUnitOfMeasurementResponseDto> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/api/admin/constants/kra-units-of-measurement',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Update KRA unit of measurement
     * @param id KRA unit of measurement ID
     * @param requestBody
     * @returns KraUnitOfMeasurementResponseDto KRA unit of measurement updated successfully
     * @throws ApiError
     */
    public adminControllerUpdateKraUnitOfMeasurement(
        id: string,
        requestBody: UpdateKraUnitOfMeasurementDto,
    ): CancelablePromise<KraUnitOfMeasurementResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-units-of-measurement/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete KRA unit of measurement
     * @param id KRA unit of measurement ID
     * @returns KraUnitOfMeasurementResponseDto KRA unit of measurement deleted successfully
     * @throws ApiError
     */
    public adminControllerDeleteKraUnitOfMeasurement(
        id: string,
    ): CancelablePromise<KraUnitOfMeasurementResponseDto> {
        return this.httpRequest.request({
            method: 'DELETE',
            url: '/api/admin/constants/kra-units-of-measurement/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Toggle KRA unit of measurement status
     * @param id KRA unit of measurement ID
     * @returns KraUnitOfMeasurementResponseDto KRA unit of measurement status toggled successfully
     * @throws ApiError
     */
    public adminControllerToggleKraUnitOfMeasurement(
        id: string,
    ): CancelablePromise<KraUnitOfMeasurementResponseDto> {
        return this.httpRequest.request({
            method: 'PATCH',
            url: '/api/admin/constants/kra-units-of-measurement/{id}/toggle',
            path: {
                'id': id,
            },
        });
    }
}
