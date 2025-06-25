import { User as SDKUser } from "@/lib/sdk/models/User";
import { User as AppUser, Merchant } from "@/types";

/**
 * Converts SDK User or ProfileResponseDto object to application User format
 */
export const sdkUserToAppUser = (sdkUser: SDKUser | any): AppUser => {
  // For debugging the incoming user data structure
  console.log("Raw user data received:", JSON.stringify(sdkUser, null, 2));

  // Try to extract address from raw response
  let address = undefined;

  // Check if there's an address property directly on the response
  if (sdkUser && typeof sdkUser === 'object') {
    if (sdkUser.shippingAddresses && sdkUser.shippingAddresses.length > 0) {
      // get the default address where isDefault is true
      address = sdkUser.shippingAddresses.find((address: any) => address.isDefault);
      console.log("Default address:", address);
      // if no default address, get the first address
      if (!address) {
        address = sdkUser.shippingAddresses[0];
      }
    }

    // Fallback: Check if data is nested in another property
    else if (sdkUser.user && sdkUser.user.shippingAddresses && sdkUser.user.shippingAddresses.length > 0) {
      // get the default address where isDefault is true
      address = sdkUser.user.shippingAddresses.find((address: any) => address.isDefault);
      console.log("Default address:", address);
      // if no default address, get the first address
      if (!address) {
        address = sdkUser.user.shippingAddresses[0];
      }
    }
  }

  // Try to get saved address from local storage as fallback
  if (!address) {
    try {
      const savedAddressStr = localStorage.getItem('user_address');
      if (savedAddressStr) {
        address = JSON.parse(savedAddressStr);
        console.log("Using address from local storage in adapter:", address);
      }
    } catch (e) {
      console.error("Error loading address from local storage in adapter:", e);
    }
  }

  // Map merchant data if available
  let merchant: Merchant | null = null;
  if (sdkUser.merchant) {
    merchant = {
      id: sdkUser.merchant.id,
      name: sdkUser.merchant.name,
      timezone: sdkUser.merchant.timezone,
      country: sdkUser.merchant.country,
      currency: sdkUser.merchant.currency,
      currencySymbol: sdkUser.merchant.currencySymbol,
      taxIdentifier: sdkUser.merchant.taxIdentifier,
      contactEmail: sdkUser.merchant.contactEmail,
      contactPhone: sdkUser.merchant.contactPhone,
      address: sdkUser.merchant.address,
      logo: sdkUser.merchant.logo,
      isActive: sdkUser.merchant.isActive,
      kraEnabled: sdkUser.merchant.kraEnabled,
      createdAt: sdkUser.merchant.createdAt,
      updatedAt: sdkUser.merchant.updatedAt,
    };
  }

  return {
    id: (sdkUser.id), // Convert string ID to number
    displayName: sdkUser.displayName?.toString() || "", // Use displayName as name
    email: sdkUser.email,
    email_verified_at: sdkUser.emailVerified ? new Date().toISOString() : null,
    phone: sdkUser.phone?.toString() || undefined,
    created_at: sdkUser.createdAt,
    updated_at: sdkUser.updatedAt,
    role: sdkUser.roles.map((role: any) => role.name)[0],
    merchantId: sdkUser.merchantId,
    merchant: merchant,
  };
};
