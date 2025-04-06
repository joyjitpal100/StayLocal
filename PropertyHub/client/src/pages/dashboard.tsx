import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import HostDashboard from "@/components/dashboard/host-dashboard";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isLoading, isAuthenticated, navigate]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  if (!user.isHost) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">You're not a host yet</h1>
        <p className="mb-6">Become a host to list your properties and manage bookings.</p>
        <Button 
          onClick={() => navigate("/become-host")}
          className="bg-primary hover:bg-primary/90"
        >
          Become a Host
        </Button>
      </div>
    );
  }
  
  return <HostDashboard user={user} />;
}
