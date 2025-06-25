import { useState } from 'react';
import { Link } from "react-router-dom";
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            // TODO: Implement actual password reset logic
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            setIsSubmitted(true);
            toast({
                title: "Success",
                description: "If an account exists with this email, you will receive password reset instructions.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An error occurred. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-md">
                <CardContent className="pt-6">
                    <div className="mb-8">
                        <div className="mb-2">
                            <img src="/images/logo.png" alt="Farmbook Admin" className="w-10 h-10" />
                            <span className="text-xl font-bold text-gray-500">Farm</span>
                            <span className="text-xl text-primary">Book</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            {isSubmitted
                                ? "Check your email for reset instructions"
                                : "Enter your email to reset your password"}
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-light"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-50 border-t-transparent"></span>
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Instructions'
                                )}
                            </Button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-sm text-primary hover:text-primary/90"
                                >
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center text-sm text-gray-500">
                                <p>We've sent password reset instructions to your email.</p>
                                <p className="mt-2">Please check your inbox and follow the instructions to reset your password.</p>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full"
                                asChild
                            >
                                <Link to="/login">
                                    Return to Login
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 