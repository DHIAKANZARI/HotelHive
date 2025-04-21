import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bell, 
  Menu, 
  X, 
  User,
  LogOut
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="font-heading font-bold text-2xl text-primary">
                  Hootili
                </a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <a className={`${location === '/' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Home
                </a>
              </Link>
              <Link href="/hotels">
                <a className={`${location === '/hotels' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Hotels
                </a>
              </Link>
              <Link href="/hotels?special=offers">
                <a className={`${location.includes('special=offers') ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Offers
                </a>
              </Link>
              <a href="#contact" className="border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Contact
              </a>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <>
                <button type="button" className="bg-white p-1 rounded-full text-neutral-400 hover:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-6 w-6" />
                </button>

                <div className="ml-3 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        <span className="sr-only">Open user menu</span>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={user.username} />
                          <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <a className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            <span>My Dashboard</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <Link href="/auth">
                <Button className="ml-4">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              className="bg-white inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className={`${location === '/' ? 'bg-primary-light text-primary' : 'hover:bg-neutral-50'} block pl-3 pr-4 py-2 border-l-4 border-primary text-base font-medium`}>
                Home
              </a>
            </Link>
            <Link href="/hotels">
              <a className={`${location === '/hotels' ? 'bg-primary-light text-primary' : 'hover:bg-neutral-50'} block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium`}>
                Hotels
              </a>
            </Link>
            <Link href="/hotels?special=offers">
              <a className={`${location.includes('special=offers') ? 'bg-primary-light text-primary' : 'hover:bg-neutral-50'} block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium`}>
                Offers
              </a>
            </Link>
            <a href="#contact" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium hover:bg-neutral-50">
              Contact
            </a>
          </div>
          
          <div className="pt-4 pb-3 border-t border-neutral-200">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-neutral-800">
                      {user.username}
                    </div>
                    <div className="text-sm font-medium text-neutral-500">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link href="/dashboard">
                    <a className="block px-4 py-2 text-base font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100">
                      My Dashboard
                    </a>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-neutral-100"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 px-2 space-y-1">
                <Link href="/auth">
                  <a className="block w-full text-center py-3 px-4 rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark">
                    Sign In
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
