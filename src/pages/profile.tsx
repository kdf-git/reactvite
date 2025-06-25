import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';

// Form schemas
const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  phone: z.string().optional(),
  avatar: z.string().url('Please enter a valid URL').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        displayName: user.displayName,
        phone: user.phone || '',
      });
    }
  }, [user, profileForm]);

  async function onUpdateProfile(data: ProfileFormValues) {
    if (!user) return;

    setIsUpdating(true);
    try {
      // In a real app, this would call an API endpoint
      updateUserProfile({
        ...user,
        displayName: data.displayName,
        phone: data.phone
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Failed to update profile',
        description: (error as Error).message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  }

  async function onChangePassword(data: PasswordFormValues) {
    setIsChangingPassword(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully.',
      });

      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast({
        title: 'Failed to change password',
        description: (error as Error).message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-full p-4">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal information and account preferences</p>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-3 h-auto">
            <TabsTrigger value="personal" className="py-2">Personal Info</TabsTrigger>
            <TabsTrigger value="account" className="py-2">Account Settings</TabsTrigger>
            <TabsTrigger value="security" className="py-2">Security</TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="mt-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden dark:border dark:border-gray-700">
              <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">

                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{user.displayName}</h2>
                    <div className="mt-1 flex items-center flex-wrap gap-3">
                      <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                        {user.role === 'super_admin' ? 'Super Admin' :
                          user.role === 'farm_owner' ? 'Farm Owner' :
                            user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {user.phone ? user.phone : 'No phone number added'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-5">
                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-300">Display Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="dark:bg-gray-800 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-300">Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+60 12-345-6789" className="dark:bg-gray-800 dark:border-gray-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end mt-6">
                        <Button
                          type="submit"
                          className="bg-primary hover:bg-primary/90"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <span className="flex items-center">
                              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-50 border-t-transparent"></span>
                              Updating...
                            </span>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </TabsContent>

          {/* Account Settings Tab */}
          <TabsContent value="account" className="mt-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden p-6 dark:border dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Account Preferences</h2>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-medium dark:text-gray-100">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about system activities</p>
                  </div>
                  <div className="flex items-center">
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-medium dark:text-gray-100">Language Settings</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Change your preferred language</p>
                  </div>
                  <div className="flex items-center">
                    <Button variant="outline">English (US)</Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-medium dark:text-gray-100">Time Zone</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Set your local time zone</p>
                  </div>
                  <div className="flex items-center">
                    <Button variant="outline">Asia/Kuala_Lumpur</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden dark:border dark:border-gray-700">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Change Password</h2>

                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-300">Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} className="dark:bg-gray-800 dark:border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-300">New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="dark:bg-gray-800 dark:border-gray-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-300">Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} className="dark:bg-gray-800 dark:border-gray-700" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end mt-6">
                      <Button
                        type="submit"
                        className="bg-primary hover:bg-primary/90"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? (
                          <span className="flex items-center">
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-opacity-50 border-t-transparent"></span>
                            Changing Password...
                          </span>
                        ) : (
                          'Change Password'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>

              <Separator className="dark:border-gray-700" />

              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4 dark:text-gray-100">Security Settings</h2>

                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="mb-3 md:mb-0">
                      <h3 className="font-medium dark:text-gray-100">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enhance your account security</p>
                    </div>
                    <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
                      Enable
                    </Button>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="mb-3 md:mb-0">
                      <h3 className="font-medium dark:text-gray-100">Login Sessions</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage devices where you're logged in</p>
                    </div>
                    <Button variant="outline">
                      View All
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="dark:border-gray-700" />

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-700">
                  <div className="mb-3 md:mb-0">
                    <h3 className="font-medium text-red-600 dark:text-red-400">Delete Account</h3>
                    <p className="text-sm text-red-500 dark:text-red-300">This action cannot be undone</p>
                  </div>
                  <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white dark:text-red-400 dark:border-red-500 dark:hover:bg-red-700">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}