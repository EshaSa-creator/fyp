import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Order, OrderItem, Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  formatCurrency, 
  formatDate,
  formatOrderStatus,
  getProductImage
} from "@/lib/utils";
import { 
  Loader2, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Truck,
  ShoppingBag,
  Calendar,
  ArrowLeft
} from "lucide-react";

type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch orders
  const { data: orders = [], isLoading, error } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-indigo-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-neutral-500" />;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-neutral-100 text-neutral-800 hover:bg-neutral-200";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2">Loading your orders...</span>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle className="mr-2" />
              <h2 className="text-lg font-semibold">Error Loading Orders</h2>
            </div>
            <p className="text-neutral-600">{error.message}</p>
            <Link href="/">
              <Button className="mt-4 bg-primary">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Empty state
  if (orders.length === 0) {
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
                <BreadcrumbLink>My Orders</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <div className="max-w-md mx-auto text-center">
              <Card>
                <CardContent className="pt-10 pb-10">
                  <div className="text-6xl mb-4">📦</div>
                  <h1 className="font-heading font-bold text-2xl mb-4">No Orders Yet</h1>
                  <p className="text-neutral-600 mb-6">
                    You haven't placed any orders yet. Start shopping to see your orders here.
                  </p>
                  <Link href="/">
                    <Button className="bg-primary">
                      Start Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
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
              <BreadcrumbLink>My Orders</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="font-heading font-bold text-3xl mb-2">My Orders</h1>
              <p className="text-neutral-600">Track and manage your order history</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="mt-4 md:mt-0 flex items-center">
                <ArrowLeft className="mr-2" size={16} />
                Continue Shopping
              </Button>
            </Link>
          </div>

          <Tabs 
            defaultValue="all" 
            onValueChange={setActiveTab}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
            </TabsList>
          </Tabs>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium mb-2">No orders found</h3>
              <p className="text-neutral-600 mb-6">
                We couldn't find any orders with the selected status.
              </p>
              <Button
                onClick={() => setActiveTab("all")}
                className="bg-primary"
              >
                View All Orders
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  <div className="p-6 border-b flex flex-col sm:flex-row justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-1">
                        <h2 className="font-semibold text-lg">Order #{order.id}</h2>
                        <Badge 
                          className={getStatusBadgeVariant(order.status)}
                          variant="outline"
                        >
                          <span className="flex items-center">
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{formatOrderStatus(order.status)}</span>
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-neutral-600">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-3 sm:mt-0 flex flex-col sm:items-end">
                      <span className="font-medium text-lg">
                        {formatCurrency(order.total)}
                      </span>
                      {order.trackingNumber && (
                        <span className="text-sm text-neutral-600">
                          Tracking: {order.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <Accordion type="single" collapsible>
                    <AccordionItem value={`order-${order.id}`}>
                      <AccordionTrigger className="px-6 py-3 hover:no-underline hover:bg-neutral-50">
                        <div className="flex items-center text-sm">
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          <span>
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center">
                              <img 
                                src={getProductImage(item.product.imageUrl)} 
                                alt={item.product.name} 
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div className="ml-4 flex-grow">
                                <Link href={`/product/${item.product.id}`} className="block">
                                  <h3 className="font-medium hover:text-primary transition-colors">
                                    {item.product.name}
                                  </h3>
                                </Link>
                                <p className="text-sm text-neutral-600">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <div className="font-medium">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}

                          <div className="mt-4 pt-4 border-t border-dashed">
                            <div className="flex justify-between text-sm">
                              <span>Subtotal:</span>
                              <span>{formatCurrency(order.total - (order.total * 0.08))}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Shipping:</span>
                              <span>{formatCurrency(order.total >= 50 ? 0 : 4.99)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Tax:</span>
                              <span>{formatCurrency(order.total * 0.08)}</span>
                            </div>
                            <div className="flex justify-between font-medium mt-2">
                              <span>Total:</span>
                              <span>{formatCurrency(order.total)}</span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-sm mb-1">Shipping Address</h4>
                              <p className="text-sm text-neutral-600">{order.shippingAddress}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-sm mb-1">Payment Method</h4>
                              <p className="text-sm text-neutral-600">
                                {order.paymentMethod === 'credit' ? 'Credit Card' : 'PayPal'}
                              </p>
                            </div>
                          </div>

                          {order.status === "shipped" && (
                            <div className="mt-4 flex items-center justify-between">
                              <div className="flex items-center text-primary">
                                <Truck className="h-4 w-4 mr-2" />
                                <span className="text-sm">Your order is on the way!</span>
                              </div>
                              <Button size="sm" variant="outline">
                                Track Package
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
