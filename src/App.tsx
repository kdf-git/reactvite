import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/AuthProvider";
import { Layout } from "@/components/layout/layout";
import { useAuth } from "@/hooks/useAuth";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { Toaster } from "sonner";
import ScrollToTop from "./components/ScrollToTop";
import Login from "./pages/login";
import ForgotPassword from "./pages/forgot-password";
import Profile from "./pages/profile";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/dashboard";

// Create a new query client
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login with the return url
      navigate('/login', { state: { redirectTo: location.pathname } });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show nothing while checking authentication
  if (isLoading) return null;

  // If authenticated, show the children
  return isAuthenticated ? <>{children}</> : null;
};

const App = () => {
  return (
    <ThemeProvider defaultTheme="light">
      <BrowserRouter>
        <ScrollToTop />
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Protected Routes with Layout */}
                <Route element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>

              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;