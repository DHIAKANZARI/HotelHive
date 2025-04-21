import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/use-auth";
import { Booking, User, Hotel, Room } from "@/types";
import { Helmet } from "react-helmet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BookingCard from "@/components/dashboard/BookingCard";
import { 
  User as UserIcon,
  Settings,
  CalendarDays,
  Star,
  Loader2,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const UserDashboard = () => {
  const { user, logoutMutation } = useAuth();
  const [profileTab, setProfileTab] = useState("bookings");

  // Fetch user's bookings
  const { data: bookings, isLoading: isBookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });
  
  // Group bookings by status
  const upcomingBookings = bookings?.filter(
    (booking) => booking.status === "confirmed" && new Date(booking.checkInDate) > new Date()
  );
  
  const pastBookings = bookings?.filter(
    (booking) => 
      booking.status === "confirmed" && new Date(booking.checkOutDate) < new Date()
  );
  
  const cancelledBookings = bookings?.filter(
    (booking) => booking.status === "cancelled"
  );

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (!user) {
    return null; // Protected by ProtectedRoute component
  }

  return (
    <>
      <Helmet>
        <title>My Dashboard - Hootili</title>
        <meta
          name="description"
          content="View and manage your bookings, account details, and preferences."
        />
      </Helmet>
      
      <Navbar />
      
      <main className="bg-neutral-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-20 w-20 mb-4">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-center">{user.fullName || user.username}</CardTitle>
                    <p className="text-sm text-neutral-500">{user.email}</p>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-6">
                  <nav className="space-y-2">
                    <Button 
                      variant={profileTab === "bookings" ? "default" : "ghost"} 
                      className="w-full justify-start" 
                      onClick={() => setProfileTab("bookings")}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      My Bookings
                    </Button>
                    <Button 
                      variant={profileTab === "profile" ? "default" : "ghost"} 
                      className="w-full justify-start" 
                      onClick={() => setProfileTab("profile")}
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button 
                      variant={profileTab === "reviews" ? "default" : "ghost"} 
                      className="w-full justify-start" 
                      onClick={() => setProfileTab("reviews")}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Reviews
                    </Button>
                    <Button 
                      variant={profileTab === "settings" ? "default" : "ghost"} 
                      className="w-full justify-start" 
                      onClick={() => setProfileTab("settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Separator className="my-2" />
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </nav>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4">
              {profileTab === "bookings" && (
                <Card>
                  <CardHeader>
                    <CardTitle>My Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="upcoming">
                      <TabsList className="w-full mb-6">
                        <TabsTrigger value="upcoming" className="flex-1">
                          Upcoming
                          {upcomingBookings && upcomingBookings.length > 0 && (
                            <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              {upcomingBookings.length}
                            </span>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
                        <TabsTrigger value="cancelled" className="flex-1">Cancelled</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="upcoming">
                        {isBookingsLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : upcomingBookings && upcomingBookings.length > 0 ? (
                          <div className="space-y-4">
                            {upcomingBookings.map((booking) => (
                              <BookingCard key={booking.id} booking={booking} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-neutral-50 rounded-md">
                            <CalendarDays className="h-12 w-12 mx-auto text-neutral-400 mb-2" />
                            <h3 className="text-lg font-semibold">No upcoming bookings</h3>
                            <p className="text-neutral-500 mt-1 mb-4">
                              You don't have any upcoming hotel reservations.
                            </p>
                            <Button onClick={() => window.location.href = '/hotels'}>
                              Book a Hotel
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="past">
                        {isBookingsLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : pastBookings && pastBookings.length > 0 ? (
                          <div className="space-y-4">
                            {pastBookings.map((booking) => (
                              <BookingCard key={booking.id} booking={booking} isPast={true} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-neutral-50 rounded-md">
                            <CalendarDays className="h-12 w-12 mx-auto text-neutral-400 mb-2" />
                            <h3 className="text-lg font-semibold">No past bookings</h3>
                            <p className="text-neutral-500">
                              You haven't completed any hotel stays yet.
                            </p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="cancelled">
                        {isBookingsLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : cancelledBookings && cancelledBookings.length > 0 ? (
                          <div className="space-y-4">
                            {cancelledBookings.map((booking) => (
                              <BookingCard key={booking.id} booking={booking} isCancelled={true} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-neutral-50 rounded-md">
                            <CalendarDays className="h-12 w-12 mx-auto text-neutral-400 mb-2" />
                            <h3 className="text-lg font-semibold">No cancelled bookings</h3>
                            <p className="text-neutral-500">
                              You don't have any cancelled reservations.
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
              
              {profileTab === "profile" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
                            Username
                          </label>
                          <Input
                            id="username"
                            value={user.username}
                            readOnly
                            className="bg-neutral-50"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                            Email Address
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={user.email}
                            readOnly
                            className="bg-neutral-50"
                          />
                        </div>
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-medium text-neutral-700 mb-1">
                            Full Name
                          </label>
                          <Input
                            id="fullName"
                            defaultValue={user.fullName || ""}
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-neutral-700 mb-1">
                            Phone Number
                          </label>
                          <Input
                            id="phoneNumber"
                            defaultValue={user.phoneNumber || ""}
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="button">Save Changes</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
              
              {profileTab === "reviews" && (
                <Card>
                  <CardHeader>
                    <CardTitle>My Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 bg-neutral-50 rounded-md">
                      <Star className="h-12 w-12 mx-auto text-neutral-400 mb-2" />
                      <h3 className="text-lg font-semibold">No reviews yet</h3>
                      <p className="text-neutral-500 mt-1">
                        You haven't written any hotel reviews.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {profileTab === "settings" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                              Current Password
                            </label>
                            <Input
                              id="currentPassword"
                              type="password"
                              placeholder="Enter your current password"
                            />
                          </div>
                          <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                              New Password
                            </label>
                            <Input
                              id="newPassword"
                              type="password"
                              placeholder="Enter your new password"
                            />
                          </div>
                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                              Confirm New Password
                            </label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="Confirm your new password"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label htmlFor="emailNotifications" className="text-sm text-neutral-700">
                              Email Notifications
                            </label>
                            <input
                              type="checkbox"
                              id="emailNotifications"
                              defaultChecked
                              className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <label htmlFor="promotionalEmails" className="text-sm text-neutral-700">
                              Promotional Emails
                            </label>
                            <input
                              type="checkbox"
                              id="promotionalEmails"
                              defaultChecked
                              className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button type="button">Save Settings</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default UserDashboard;
