import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { UPI_APPS, validateUpiId, generateQrCodeUrl } from "@/lib/payment";
import { Booking } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Payment form schema
const paymentSchema = z.object({
  paymentMethod: z.enum(["upi", "card", "netbanking"]),
  upiId: z.string().optional().refine(val => {
    if (!val) return true;
    return validateUpiId(val);
  }, {
    message: "Please enter a valid UPI ID (e.g. username@upi)"
  }),
  upiApp: z.string().optional()
});

interface PaymentFormProps {
  booking: Booking;
}

export default function PaymentForm({ booking }: PaymentFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showQr, setShowQr] = useState(false);
  
  // Initialize the form
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "upi",
      upiId: "",
      upiApp: "any"
    }
  });
  
  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof paymentSchema>) => {
      const paymentData = {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: "INR",
        paymentMethod: data.paymentMethod,
        upiId: data.upiId
      };
      
      const res = await apiRequest("POST", "/api/payments", paymentData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment successful",
        description: "Your booking has been confirmed",
      });
      navigate(`/bookings`);
    },
    onError: (error: any) => {
      toast({
        title: "Payment failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof paymentSchema>) => {
    paymentMutation.mutate(values);
  };
  
  // Get the watched payment method for conditional rendering
  const paymentMethod = form.watch("paymentMethod");
  const upiId = form.watch("upiId");
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h3 className="font-semibold mb-4">Payment Method</h3>
        
        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi" className="ml-3 font-medium">UPI</Label>
                    </div>
                    <div className="flex space-x-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png" alt="Google Pay" className="h-6" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="ml-3 font-medium">Credit/Debit Card</Label>
                    </div>
                    <div className="flex space-x-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" alt="Amex" className="h-6" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center">
                      <RadioGroupItem value="netbanking" id="netbanking" />
                      <Label htmlFor="netbanking" className="ml-3 font-medium">Net Banking</Label>
                    </div>
                    <div className="flex space-x-2">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/SBI-logo.svg/2048px-SBI-logo.svg.png" alt="SBI" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/ICICI_Bank_Logo.svg/2560px-ICICI_Bank_Logo.svg.png" alt="ICICI" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HDFC_Bank_Logo.svg/1280px-HDFC_Bank_Logo.svg.png" alt="HDFC" className="h-6" />
                    </div>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {paymentMethod === "upi" && (
          <div className="border rounded-lg p-4 space-y-4">
            <FormField
              control={form.control}
              name="upiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPI ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="username@upi" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        setShowQr(false);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="upiApp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select UPI App</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {UPI_APPS.map((app) => (
                      <div 
                        key={app.id}
                        className={`border rounded-lg p-2 flex flex-col items-center cursor-pointer hover:border-primary transition-colors ${
                          field.value === app.id ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => field.onChange(app.id)}
                      >
                        <img src={app.icon} alt={app.name} className="h-8 mb-1" />
                        <span className="text-xs">{app.name}</span>
                      </div>
                    ))}
                  </div>
                </FormItem>
              )}
            />
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Or scan the QR code with your UPI app</p>
              
              {showQr ? (
                <div className="mx-auto w-48 h-48 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-300 overflow-hidden">
                  <img 
                    src={generateQrCodeUrl(booking.totalPrice, upiId)} 
                    alt="UPI QR Code" 
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowQr(true)}
                  disabled={!validateUpiId(upiId) && upiId !== ""}
                >
                  Show QR Code
                </Button>
              )}
            </div>
          </div>
        )}
        
        {paymentMethod === "card" && (
          <div className="border rounded-lg p-4 space-y-4">
            <p className="text-center text-sm text-gray-600">Card payment option will be available soon.</p>
          </div>
        )}
        
        {paymentMethod === "netbanking" && (
          <div className="border rounded-lg p-4 space-y-4">
            <p className="text-center text-sm text-gray-600">Net banking option will be available soon.</p>
          </div>
        )}
        
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition"
          disabled={paymentMutation.isPending}
        >
          {paymentMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ₹${booking.totalPrice.toLocaleString()}`
          )}
        </Button>
        
        <p className="text-center text-sm text-gray-600">
          By clicking "Pay", you agree to our <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Payment Terms</a>
        </p>
      </form>
    </Form>
  );
}
