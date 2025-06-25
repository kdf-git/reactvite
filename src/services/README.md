# Using the API SDK

This project uses a generated React SDK from the backend OpenAPI specification. Here's how to use it:

## Setting up the SDK

The SDK is configured in `api.ts` and exported in `sdk.ts`:

```typescript
// Import specific services
import { authService, productsService } from '@/services/sdk';

// Or import the entire API client
import { secureApi } from '@/services/sdk';
```

## Authentication

Authentication is handled through the `AuthService` which uses the SDK:

```typescript
// Login a user
const response = await authService.authControllerLogin({
  email: 'user@example.com',
  password: 'password123'
});
```

## Token Refresh Mechanism

The application includes a built-in token refresh mechanism to keep users authenticated:

1. Access tokens are automatically refreshed in the background
2. If an API call fails with a 401 error, the token is refreshed automatically and the call is retried
3. Refresh tokens are stored securely and used to obtain new access tokens
4. The system periodically checks and refreshes tokens before they expire

This ensures users stay logged in until they explicitly log out, even across page refreshes.

## Making API calls

Use the exported services for type-safe API calls with automatic token refresh:

```typescript
// Get all products
const products = await productsService.productsControllerFindAll();

// Get a single product
const product = await productsService.productsControllerFindOne('product-id');

// Create a product (requires authentication)
const newProduct = await productsService.productsControllerCreate({
  name: 'New Product',
  description: 'Product description',
  price: 29.99
});
```

## Error handling

All SDK methods return Promises that may throw errors:

```typescript
try {
  const result = await authService.authControllerLogin(credentials);
  // Handle success
} catch (error) {
  // Handle error
  console.error('API error:', error);
}
```

## Available services

- `appService`: General application info
- `authService`: Authentication operations
- `cartService`: Shopping cart operations
- `categoriesService`: Product categories
- `farmsService`: Farm-related operations
- `healthService`: API health checks
- `ordersService`: Order management
- `productsService`: Product operations
- `storageService`: File storage operations
- `treesService`: Tree-related operations
- `usersService`: User profile operations