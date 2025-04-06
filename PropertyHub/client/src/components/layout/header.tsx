import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Search, User, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isHost: z.boolean().optional(),
});

export default function Header() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user, login, register, logout, loginWithGoogle } = useAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      isHost: false,
    },
  });
  
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    await login(values.username, values.password);
    setIsLoginOpen(false);
    loginForm.reset();
  };
  
  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    await register(values);
    setIsRegisterOpen(false);
    registerForm.reset();
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/properties?location=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const switchToRegister = () => {
    setIsLoginOpen(false);
    setAuthMode("register");
    setTimeout(() => setIsRegisterOpen(true), 100);
  };
  
  const switchToLogin = () => {
    setIsRegisterOpen(false);
    setAuthMode("login");
    setTimeout(() => setIsLoginOpen(true), 100);
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 5.5l5.5 10.5h-11L12 7.5z" />
          </svg>
          <span className="ml-2 text-2xl font-bold text-primary">StayLocal</span>
        </Link>
        
        {/* Search Bar (Desktop) */}
        {!isMobile && (
          <form 
            onSubmit={handleSearch} 
            className="hidden md:flex items-center px-4 py-2 rounded-full border border-gray-300 shadow-sm hover:shadow-md transition duration-200"
          >
            <Input 
              type="text" 
              placeholder="Where are you going?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus:outline-none text-sm w-64"
            />
            <span className="mx-2 text-gray-300">|</span>
            <Button type="submit" size="icon" variant="ghost" className="bg-primary text-white p-2 rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        )}
        
        {/* User Menu */}
        <div className="flex items-center">
          {isAuthenticated && user?.isHost && (
            <Link href="/dashboard" className="hidden md:block mx-4 text-sm font-medium hover:text-primary">
              Host Dashboard
            </Link>
          )}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center p-2 border border-gray-300 rounded-full hover:shadow-md transition">
                  <Menu className="h-4 w-4 text-dark-gray mr-2" />
                  <User className="h-4 w-4 text-dark-gray" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    Profile
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link href="/bookings" className="cursor-pointer">
                    My Bookings
                  </Link>
                </DropdownMenuItem>
                
                {user?.isHost ? (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Host Dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/become-host" className="cursor-pointer">
                      Become a Host
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium">
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Login to your account</DialogTitle>
                    <DialogDescription>
                      Enter your credentials to access your StayLocal account
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="my-4">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsLoginOpen(false);
                            loginWithGoogle();
                          }}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Sign in with Google
                        </Button>
                      </div>
                      
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                      </div>
                      
                      <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={switchToRegister}
                          className="w-full sm:w-auto"
                        >
                          Create Account
                        </Button>
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                        >
                          Login
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="bg-primary hover:bg-primary/90 text-white">
                    Sign Up
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create your account</DialogTitle>
                    <DialogDescription>
                      Join StayLocal to start booking unique accommodations
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Create a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="my-4">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsRegisterOpen(false);
                            loginWithGoogle();
                          }}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Sign up with Google
                        </Button>
                      </div>
                      
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                      </div>
                      
                      <DialogFooter className="flex flex-col gap-2 sm:flex-row mt-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={switchToLogin}
                          className="w-full sm:w-auto"
                        >
                          Already have an account
                        </Button>
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                        >
                          Create Account
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
      
      {/* Search Bar (Mobile) */}
      {isMobile && (
        <div className="md:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="flex items-center px-4 py-2 rounded-full border border-gray-300 shadow-sm">
            <Search className="h-4 w-4 text-dark-gray mr-2" />
            <Input 
              type="text" 
              placeholder="Where are you going?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus:outline-none text-sm flex-grow"
            />
          </form>
        </div>
      )}
    </header>
  );
}
