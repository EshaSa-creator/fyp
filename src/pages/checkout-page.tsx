import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency, getProductImage } from "@/lib/utils";
import { 
  CreditCard, 
  Banknote, 
  Truck, 
  Package, 
  Check, 
  ArrowLeft,
  ShieldCheck,
  CreditCard as CreditCardIcon,
  Calendar,
  LockKeyhole
} from "lucide-react";

// Define checkout form schema
const checkoutSchema = z.object({
  // Shipping information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  
  // Payment information
  paymentMethod: z.enum(["credit", "paypal"]),
  cardName: z.string().optional(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvv: z.string().optional(),
  
  // Shipping method
  shippingMethod: z.enum(["standard", "express"]),
  
  // Other options
  sameAsBilling: z.boolean().default(true),
  saveInformation: z.boolean().default(false),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<"shipping" | "payment" | "review" | "complete">("shipping");

  // Set up form
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: user?.zipCode || "",
      paymentMethod: "credit",
      shippingMethod: "standard",
      sameAsBilling: true,
      saveInformation: false,
    },
  });

  // Calculate totals
  const subtotal = cartTotal;
  const shipping = form.watch("shippingMethod") === "express" ? 14.99 : (subtotal >= 50 ? 0 : 4.99);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  // Create order mutation
  const orderMutation = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      // Prepare shipping address
      const shippingAddress = `${data.address}, ${data.city}, ${data.state} ${data.zipCode}`;
      
      // Use the same address for billing if checkbox is checked
      const billingAddress = data.sameAsBilling 
        ? shippingAddress 
        : "Different billing address would be collected here";
        
      const orderData = {
        total: total,
        status: "pending",
        paymentMethod: data.paymentMethod,
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        shippingMethod: data.shippingMethod,
      };
      
      const res = await apiRequest("POST", "/api/orders", orderData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      clearCart();
      setStep("complete");
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: CheckoutFormData) => {
    if (step === "shipping") {
      setStep("payment");
    } else if (step === "payment") {
      setStep("review");
    } else if (step === "review") {
      orderMutation.mutate(data);
    }
  };

  // Handle going back
  const handleBack = () => {
    if (step === "payment") {
      setStep("shipping");
    } else if (step === "review") {
      setStep("payment");
    }
  };

  // If no items in cart, redirect to cart page
  if (cartItems.length === 0 && step !== "complete") {
    if (typeof window !== "undefined") {
      navigate("/cart");
    }
    return null;
  }

  return (
    <>
      <Header />
      <main className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          <Breadcrumb className="mb-6">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/cart">Cart</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Checkout</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <h1 className="font-heading font-bold text-3xl mb-6">Checkout</h1>

          {step === "complete" ? (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="pt-10 pb-10 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="font-heading font-bold text-2xl mb-2">Order Placed Successfully!</h2>
                  <p className="text-neutral-600 mb-6">
                    Thank you for your purchase. We've received your order and will process it right away.
                  </p>
                  <p className="font-medium mb-4">
                    Order Number: <span className="text-primary">PET-{Math.floor(10000 + Math.random() * 90000)}</span>
                  </p>
                  <p className="text-sm text-neutral-600 mb-6">
                    A confirmation email has been sent to your email address.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/orders")}
                      className="flex items-center"
                    >
                      <Package className="mr-2" size={16} />
                      View My Orders
                    </Button>
                    <Button 
                      onClick={() => navigate("/")}
                      className="bg-primary flex items-center"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Checkout Forms */}
              <div className="w-full lg:w-2/3">
                <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                  <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                      <h2 className="font-semibold text-xl">Checkout</h2>
                      <div className="flex items-center">
                        <div className={`flex items-center ${step === "shipping" ? "text-primary font-semibold" : "text-neutral-400"}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === "shipping" ? "bg-primary text-white" : "bg-neutral-200"}`}>1</div>
                          <span className="ml-2 hidden sm:inline">Shipping</span>
                        </div>
                        <div className="w-8 h-px bg-neutral-300 mx-2"></div>
                        <div className={`flex items-center ${step === "payment" ? "text-primary font-semibold" : "text-neutral-400"}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === "payment" ? "bg-primary text-white" : "bg-neutral-200"}`}>2</div>
                          <span className="ml-2 hidden sm:inline">Payment</span>
                        </div>
                        <div className="w-8 h-px bg-neutral-300 mx-2"></div>
                        <div className={`flex items-center ${step === "review" ? "text-primary font-semibold" : "text-neutral-400"}`}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === "review" ? "bg-primary text-white" : "bg-neutral-200"}`}>3</div>
                          <span className="ml-2 hidden sm:inline">Review</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                      {/* Shipping Information Step */}
                      {step === "shipping" && (
                        <div className="p-6">
                          <h3 className="font-semibold text-lg mb-4">Shipping Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="lastName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input type="email" placeholder="your@email.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="(123) 456-7890" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main St" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="New York" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input placeholder="NY" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Zip Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="10001" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="mt-4">
                            <FormField
                              control={form.control}
                              name="sameAsBilling"
                              render={({ field }) => (
                                <div className="flex items-center">
                                  <Checkbox
                                    id="sameAsBilling"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                  <Label htmlFor="sameAsBilling" className="ml-2">
                                    Billing address is the same as shipping address
                                  </Label>
                                </div>
                              )}
                            />
                          </div>
                          
                          <div className="mt-8">
                            <h3 className="font-semibold text-lg mb-4">Shipping Method</h3>
                            <FormField
                              control={form.control}
                              name="shippingMethod"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <RadioGroup
                                      value={field.value}
                                      onValueChange={field.onChange}
                                      className="space-y-3"
                                    >
                                      <div className="flex items-start space-x-2 border rounded-lg p-3 hover:bg-neutral-50 cursor-pointer">
                                        <RadioGroupItem value="standard" id="standard" />
                                        <div className="flex flex-col">
                                          <Label htmlFor="standard" className="font-medium">Standard Shipping</Label>
                                          <span className="text-sm text-neutral-600">
                                            {subtotal >= 50 ? "Free" : `$${shipping.toFixed(2)}`} - Delivery in 3-5 business days
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex items-start space-x-2 border rounded-lg p-3 hover:bg-neutral-50 cursor-pointer">
                                        <RadioGroupItem value="express" id="express" />
                                        <div className="flex flex-col">
                                          <Label htmlFor="express" className="font-medium">Express Shipping</Label>
                                          <span className="text-sm text-neutral-600">
                                            $14.99 - Delivery in 1-2 business days
                                          </span>
                                        </div>
                                      </div>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="mt-6 flex justify-end">
                            <Button 
                              type="submit" 
                              className="bg-primary hover:bg-blue-600"
                            >
                              Continue to Payment
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Payment Information Step */}
                      {step === "payment" && (
                        <div className="p-6">
                          <h3 className="font-semibold text-lg mb-4">Payment Method</h3>
                          
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Tabs 
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    className="w-full"
                                  >
                                    <TabsList className="grid w-full grid-cols-2 mb-6">
                                      <TabsTrigger value="credit" className="flex items-center">
                                        <CreditCard className="mr-2" size={16} />
                                        Credit Card
                                      </TabsTrigger>
                                      <TabsTrigger value="paypal" className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#253B80">
                                          <path d="M9.1 9.6c-.1-.7-.7-1.1-1.4-1.1-.3 0-.6.1-.8.2-.2.1-.3.3-.3.5 0 .3.2.5.5.6.3.1.7.1 1.1.2.7.1 1.2.2 1.6.4.4.2.7.5.9.8.2.3.3.7.3 1.2 0 .8-.3 1.4-.9 1.8-.6.4-1.3.7-2.3.7-.7 0-1.2-.1-1.7-.3-.5-.2-.8-.5-1.1-.9-.2-.4-.4-.8-.4-1.3h1.8c0 .3.2.6.4.7.2.2.5.2.9.2.3 0 .6-.1.8-.2.2-.1.3-.3.3-.5 0-.2-.1-.4-.3-.5-.2-.1-.6-.2-1.1-.3-.7-.1-1.2-.2-1.6-.4-.4-.2-.6-.4-.8-.7-.2-.3-.3-.6-.3-1 0-.5.1-.9.4-1.2.2-.3.6-.6 1-.8.4-.2.9-.3 1.4-.3 1.4 0 2.2.7 2.4 2h-1.8zm1.4.2h1.7c0-.3.1-.6.2-.8.1-.2.3-.4.5-.5.2-.1.5-.2.8-.2.4 0 .8.1 1 .4.2.2.4.6.4 1v3.1c0 .2 0 .4.1.5 0 .1.1.3.2.3h-1.7c0-.1-.1-.1-.1-.2v-.2c-.3.4-.8.5-1.4.5-.4 0-.8-.1-1.1-.2-.3-.2-.5-.4-.7-.6-.1-.3-.2-.6-.2-.9 0-.5.1-.9.4-1.2.3-.3.7-.5 1.3-.6l1.3-.2c.3 0 .4-.1.5-.2.1-.1.2-.2.2-.4 0-.2-.1-.4-.2-.5-.1-.1-.3-.2-.6-.2-.2 0-.4.1-.6.2-.2.1-.3.3-.3.5h-1.7zm3.4 1.5c-.1.1-.2.1-.3.1-.1 0-.3.1-.5.1l-.6.1c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5 0 .2.1.4.2.5.1.1.3.2.5.2.3 0 .6-.1.8-.2.2-.2.4-.3.5-.6.1-.2.1-.5.1-.7v-.2zm5-3.5c.6 0 1 .1 1.4.3.4.2.7.5.9.9.2.4.3.8.3 1.3v3.7h-1.7v-3.4c0-.4-.1-.6-.2-.8-.2-.2-.4-.3-.7-.3-.3 0-.5.1-.7.3-.2.2-.2.5-.2.9v3.3h-1.7V8h1.7v.7c.3-.5.9-.8 1.6-.8z" />
                                        </svg>
                                        PayPal
                                      </TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="credit" className="space-y-4">
                                      <div className="p-4 border rounded-lg bg-neutral-50">
                                        <FormField
                                          control={form.control}
                                          name="cardName"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Name on Card</FormLabel>
                                              <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        
                                        <div className="mt-4 relative">
                                          <FormField
                                            control={form.control}
                                            name="cardNumber"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Card Number</FormLabel>
                                                <FormControl>
                                                  <div className="relative">
                                                    <Input placeholder="4242 4242 4242 4242" {...field} />
                                                    <CreditCardIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                                  </div>
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                          <FormField
                                            control={form.control}
                                            name="cardExpiry"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Expiry Date</FormLabel>
                                                <FormControl>
                                                  <div className="relative">
                                                    <Input placeholder="MM/YY" {...field} />
                                                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                                  </div>
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                          
                                          <FormField
                                            control={form.control}
                                            name="cardCvv"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>CVV</FormLabel>
                                                <FormControl>
                                                  <div className="relative">
                                                    <Input placeholder="123" {...field} />
                                                    <LockKeyhole className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
                                                  </div>
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center">
                                        <ShieldCheck className="h-5 w-5 text-primary mr-2" />
                                        <span className="text-sm text-neutral-600">
                                          Your payment information is secure and encrypted
                                        </span>
                                      </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="paypal" className="p-4 border rounded-lg">
                                      <div className="text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-auto mx-auto mb-4" viewBox="0 0 24 24" fill="#253B80">
                                          <path d="M9.1 9.6c-.1-.7-.7-1.1-1.4-1.1-.3 0-.6.1-.8.2-.2.1-.3.3-.3.5 0 .3.2.5.5.6.3.1.7.1 1.1.2.7.1 1.2.2 1.6.4.4.2.7.5.9.8.2.3.3.7.3 1.2 0 .8-.3 1.4-.9 1.8-.6.4-1.3.7-2.3.7-.7 0-1.2-.1-1.7-.3-.5-.2-.8-.5-1.1-.9-.2-.4-.4-.8-.4-1.3h1.8c0 .3.2.6.4.7.2.2.5.2.9.2.3 0 .6-.1.8-.2.2-.1.3-.3.3-.5 0-.2-.1-.4-.3-.5-.2-.1-.6-.2-1.1-.3-.7-.1-1.2-.2-1.6-.4-.4-.2-.6-.4-.8-.7-.2-.3-.3-.6-.3-1 0-.5.1-.9.4-1.2.2-.3.6-.6 1-.8.4-.2.9-.3 1.4-.3 1.4 0 2.2.7 2.4 2h-1.8zm1.4.2h1.7c0-.3.1-.6.2-.8.1-.2.3-.4.5-.5.2-.1.5-.2.8-.2.4 0 .8.1 1 .4.2.2.4.6.4 1v3.1c0 .2 0 .4.1.5 0 .1.1.3.2.3h-1.7c0-.1-.1-.1-.1-.2v-.2c-.3.4-.8.5-1.4.5-.4 0-.8-.1-1.1-.2-.3-.2-.5-.4-.7-.6-.1-.3-.2-.6-.2-.9 0-.5.1-.9.4-1.2.3-.3.7-.5 1.3-.6l1.3-.2c.3 0 .4-.1.5-.2.1-.1.2-.2.2-.4 0-.2-.1-.4-.2-.5-.1-.1-.3-.2-.6-.2-.2 0-.4.1-.6.2-.2.1-.3.3-.3.5h-1.7zm3.4 1.5c-.1.1-.2.1-.3.1-.1 0-.3.1-.5.1l-.6.1c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5 0 .2.1.4.2.5.1.1.3.2.5.2.3 0 .6-.1.8-.2.2-.2.4-.3.5-.6.1-.2.1-.5.1-.7v-.2zm5-3.5c.6 0 1 .1 1.4.3.4.2.7.5.9.9.2.4.3.8.3 1.3v3.7h-1.7v-3.4c0-.4-.1-.6-.2-.8-.2-.2-.4-.3-.7-.3-.3 0-.5.1-.7.3-.2.2-.2.5-.2.9v3.3h-1.7V8h1.7v.7c.3-.5.9-.8 1.6-.8z" />
                                        </svg>
                                        <p className="mb-4">
                                          You will be redirected to PayPal to complete your payment after review.
                                        </p>
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="mt-6 flex justify-between">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleBack}
                              className="flex items-center"
                            >
                              <ArrowLeft className="mr-2" size={16} />
                              Back to Shipping
                            </Button>
                            <Button 
                              type="submit" 
                              className="bg-primary hover:bg-blue-600"
                            >
                              Continue to Review
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Review Order Step */}
                      {step === "review" && (
                        <div className="p-6">
                          <h3 className="font-semibold text-lg mb-4">Review Your Order</h3>
                          
                          <div className="space-y-6">
                            {/* Shipping Information Summary */}
                            <div>
                              <div className="flex justify-between mb-2">
                                <h4 className="font-medium">Shipping Information</h4>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-auto p-0 text-primary"
                                  onClick={() => setStep("shipping")}
                                >
                                  Edit
                                </Button>
                              </div>
                              <div className="bg-neutral-50 p-3 rounded-lg">
                                <p><span className="font-medium">Name:</span> {form.getValues("firstName")} {form.getValues("lastName")}</p>
                                <p><span className="font-medium">Email:</span> {form.getValues("email")}</p>
                                <p><span className="font-medium">Phone:</span> {form.getValues("phone")}</p>
                                <p><span className="font-medium">Address:</span> {form.getValues("address")}, {form.getValues("city")}, {form.getValues("state")} {form.getValues("zipCode")}</p>
                                <p><span className="font-medium">Shipping Method:</span> {form.getValues("shippingMethod") === "standard" ? "Standard Shipping" : "Express Shipping"}</p>
                              </div>
                            </div>
                            
                            {/* Payment Information Summary */}
                            <div>
                              <div className="flex justify-between mb-2">
                                <h4 className="font-medium">Payment Information</h4>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-auto p-0 text-primary"
                                  onClick={() => setStep("payment")}
                                >
                                  Edit
                                </Button>
                              </div>
                              <div className="bg-neutral-50 p-3 rounded-lg">
                                <p>
                                  <span className="font-medium">Payment Method:</span> {form.getValues("paymentMethod") === "credit" ? "Credit Card" : "PayPal"}
                                </p>
                                {form.getValues("paymentMethod") === "credit" && (
                                  <p>
                                    <span className="font-medium">Card:</span> •••• •••• •••• {form.getValues("cardNumber")?.slice(-4) || "****"}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Order Summary */}
                            <div>
                              <h4 className="font-medium mb-2">Order Summary</h4>
                              <div className="bg-neutral-50 p-3 rounded-lg">
                                <div className="space-y-3 divide-y">
                                  {cartItems.map((item) => (
                                    <div key={item.id} className="pt-3 first:pt-0 flex items-center">
                                      <img 
                                        src={getProductImage(item.product.imageUrl)} 
                                        alt={item.product.name} 
                                        className="w-16 h-16 object-cover rounded-md"
                                      />
                                      <div className="ml-3 flex-grow">
                                        <p className="font-medium">{item.product.name}</p>
                                        <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                                      </div>
                                      <div className="font-medium">
                                        {formatCurrency(
                                          (item.product.isOnSale && item.product.salePrice
                                            ? item.product.salePrice
                                            : item.product.price) * item.quantity
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex justify-between">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={handleBack}
                              className="flex items-center"
                            >
                              <ArrowLeft className="mr-2" size={16} />
                              Back to Payment
                            </Button>
                            <Button 
                              type="submit" 
                              className="bg-primary hover:bg-blue-600"
                              disabled={orderMutation.isPending}
                            >
                              {orderMutation.isPending ? "Processing..." : "Place Order"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </form>
                  </Form>
                </div>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-24">
                  <div className="p-6 border-b">
                    <h2 className="font-semibold text-xl">Order Summary</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal ({cartItems.length} items)</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                      
                      <div className="py-3">
                        <Separator />
                      </div>
                      
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-neutral-100 p-4 rounded-lg flex items-start">
                      <ShieldCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-neutral-600">
                        Your personal data will be used to process your order, support your experience, and for other purposes described in our privacy policy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
