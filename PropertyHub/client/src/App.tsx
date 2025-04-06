import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Home from "@/pages/home";
import Property from "@/pages/property";
import Properties from "@/pages/properties";
import Dashboard from "@/pages/dashboard";
import Payment from "@/pages/payment";
import AddProperty from "@/pages/add-property";
import Bookings from "@/pages/bookings";
import Profile from "@/pages/profile";
import BecomeHost from "@/pages/become-host";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/property/:id" component={Property} />
          <Route path="/properties" component={Properties} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/add-property" component={AddProperty} />
          <Route path="/payment/:bookingId" component={Payment} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/profile" component={Profile} />
          <Route path="/become-host" component={BecomeHost} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
