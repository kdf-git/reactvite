import { AlertTriangle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function AccessDenied() {
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <Card className="border-red-200">
                    <CardHeader className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
                            Access Denied
                        </CardTitle>
                        <CardDescription className="mt-2 text-gray-600">
                            You don't have permission to access this system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-700 mb-4">
                                Your account ({user?.email}) has not been granted access to the merchant system.
                                Please contact Tracksol support to request access.
                            </p>

                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <h3 className="text-sm font-medium text-gray-900">Contact Support:</h3>

                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <Mail className="h-4 w-4" />
                                    <span>support@tracksol.com</span>
                                </div>

                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                                    <Phone className="h-4 w-4" />
                                    <span>+254 700 000 000</span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mt-4">
                                Please provide your email address when contacting support.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button
                                onClick={handleLogout}
                                className="w-full"
                                variant="outline"
                            >
                                Logout
                            </Button>

                            <Button
                                onClick={() => window.location.href = 'mailto:support@tracksol.com?subject=Merchant Access Request&body=Hello, I would like to request access to the merchant system. My email is: ' + user?.email}
                                className="w-full"
                            >
                                Contact Support
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 