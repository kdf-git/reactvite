import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AccessDenied from '@/components/AccessDenied';

interface MerchantProtectedRouteProps {
    children: React.ReactNode;
}

export default function MerchantProtectedRoute({ children }: MerchantProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirect to login with the return url
            navigate('/login', { state: { redirectTo: location.pathname } });
        }
    }, [isAuthenticated, isLoading, navigate, location]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, show nothing (will redirect to login)
    if (!isAuthenticated) {
        return null;
    }

    // Check if user has merchant access
    if (!user?.merchantId && !user?.merchant) {
        return <AccessDenied />;
    }

    // If authenticated and has merchant access, show the children
    return <>{children}</>;
} 