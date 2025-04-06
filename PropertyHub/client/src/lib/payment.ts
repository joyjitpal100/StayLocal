import { apiRequest } from "@/lib/queryClient";

// Payment methods supported
export type PaymentMethod = "upi" | "card" | "netbanking";

// Payment data structure
export interface PaymentData {
  bookingId: number;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  upiId?: string;
}

// Process UPI payment
export async function processUpiPayment(
  paymentData: PaymentData
): Promise<{ success: boolean; message: string; transactionId?: string }> {
  try {
    // In a real application, this would integrate with a payment gateway
    // For demonstration purposes, we'll simulate the payment process with our API
    const res = await apiRequest("POST", "/api/payments", paymentData);
    const data = await res.json();
    
    return {
      success: data.status === "success",
      message: data.status === "success" 
        ? "Payment successful" 
        : "Payment processing. Please check status later.",
      transactionId: data.transactionId
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Payment failed. Please try again."
    };
  }
}

// Check payment status
export async function checkPaymentStatus(
  bookingId: number
): Promise<{ status: string; transactionId?: string }> {
  try {
    const res = await apiRequest("GET", `/api/bookings/${bookingId}/payment`, null);
    const payment = await res.json();
    
    return {
      status: payment.status,
      transactionId: payment.transactionId
    };
  } catch (error) {
    return {
      status: "unknown"
    };
  }
}

// Format currencies
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

// UPI apps supported
export const UPI_APPS = [
  { name: "Any UPI App", id: "any", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" },
  { name: "Paytm", id: "paytm", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" },
  { name: "Google Pay", id: "gpay", icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png" },
  { name: "PhonePe", id: "phonepe", icon: "https://www.logo.wine/a/logo/PhonePe/PhonePe-Logo.wine.svg" },
  { name: "BHIM", id: "bhim", icon: "https://upload.wikimedia.org/wikipedia/en/f/fe/BHIM_logo.svg" }
];

// Validate UPI ID
export function validateUpiId(upiId: string): boolean {
  // Basic validation for UPI ID format
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
}

// Generate a mock QR code URL for a payment
// In a real app, this would be provided by the payment gateway
export function generateQrCodeUrl(amount: number, upiId?: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${upiId || 'staylocal@upi'}&pn=StayLocal&am=${amount}&cu=INR&tn=StayLocal%20Booking`;
}
