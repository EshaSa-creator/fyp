import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, getProductImage } from "@/lib/utils";
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

export default function CartPage() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isLoading,
    error,
    updateCartItem,
    removeFromCart,
    clearCart
  } = useCart();

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2">Loading your cart...</span>
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
              <h2 className="text-lg font-semibold">Error Loading Cart</h2>
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

  // Empty cart state
  if (cartCount === 0) {
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
                <BreadcrumbLink>Cart</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <div className="max-w-md mx-auto text-center">
              <Card>
                <CardContent className="pt-10 pb-10">
                  <div className="text-6xl mb-4">🛒</div>
                  <h1 className="font-heading font-bold text-2xl mb-4">Your Cart is Empty</h1>
                  <p className="text-neutral-600 mb-6">
                    Looks like you haven't added any items to your cart yet.
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
              <BreadcrumbLink>Cart</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          <h1 className="font-heading font-bold text-3xl mb-6">Your Shopping Cart</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl">Cart Items ({cartCount})</h2>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearCart}
                      className="text-red-500 border-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} className="mr-1" /> Clear Cart
                    </Button>
                  </div>
                </div>

                <div>
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 border-b flex flex-col sm:flex-row gap-4">
                      <Link href={`/product/${item.product.id}`}>
                        <img 
                          src={getProductImage(item.product.imageUrl)} 
                          alt={item.product.name} 
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                        />
                      </Link>
                      <div className="flex-grow">
                        <div className="flex justify-between mb-1">
                          <Link href={`/product/${item.product.id}`}>
                            <h3 className="font-medium text-lg cursor-pointer hover:text-primary transition-colors">
                              {item.product.name}
                            </h3>
                          </Link>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-sm text-neutral-600 mb-3">{item.product.description.slice(0, 80)}...</p>
                        <div className="flex flex-wrap justify-between items-center gap-3">
                          <div className="flex items-center border rounded">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8"
                            >
                              <Minus size={14} />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartItem(item.id, parseInt(e.target.value) || 1)}
                              className="w-12 h-8 text-center border-0"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateCartItem(item.id, item.quantity + 1)}
                              className="h-8 w-8"
                            >
                              <Plus size={14} />
                            </Button>
                          </div>
                          <div className="text-right">
                            <div>
                              {item.product.isOnSale && item.product.salePrice ? (
                                <>
                                  <span className="font-bold">
                                    {formatCurrency(item.product.salePrice * item.quantity)}
                                  </span>
                                  <span className="text-sm text-neutral-600 line-through ml-2">
                                    {formatCurrency(item.product.price * item.quantity)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-bold">
                                  {formatCurrency(item.product.price * item.quantity)}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-neutral-600">
                              {formatCurrency(item.product.isOnSale && item.product.salePrice ? item.product.salePrice : item.product.price)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 flex flex-wrap justify-between gap-4">
                  <Link href="/">
                    <Button variant="outline" className="flex items-center">
                      <ArrowLeft className="mr-2" size={16} />
                      Continue Shopping
                    </Button>
                  </Link>
                  <Link href="/checkout">
                    <Button className="bg-primary hover:bg-blue-600 flex items-center">
                      Proceed to Checkout
                      <ArrowRight className="ml-2" size={16} />
                    </Button>
                  </Link>
                </div>
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
                      <span>Subtotal ({cartCount} items)</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{cartTotal >= 50 ? "Free" : formatCurrency(4.99)}</span>
                    </div>
                    {cartTotal >= 50 ? (
                      <div className="text-green-600 text-sm">
                        You've qualified for free shipping!
                      </div>
                    ) : (
                      <div className="text-sm">
                        Add {formatCurrency(50 - cartTotal)} more to qualify for free shipping
                      </div>
                    )}
                    
                    <div className="py-3">
                      <Separator />
                    </div>
                    
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(cartTotal >= 50 ? cartTotal : cartTotal + 4.99)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Link href="/checkout">
                      <Button className="w-full bg-primary hover:bg-blue-600 py-3">
                        <ShoppingCart className="mr-2" size={18} />
                        Proceed to Checkout
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="mt-6 bg-neutral-100 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">We Accept</h3>
                    <div className="flex gap-2">
                      <div className="bg-white p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8" viewBox="0 0 24 24" fill="#1434CB">
                          <path d="M4 4h16v2.5h-16z" />
                          <path d="M4 17.5h16v2.5h-16z" />
                          <path d="M7 11h10v2h-10z" />
                        </svg>
                      </div>
                      <div className="bg-white p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8" viewBox="0 0 24 24">
                          <circle cx="7" cy="12" r="4" fill="#EB001B" />
                          <circle cx="17" cy="12" r="4" fill="#F79E1B" />
                          <path d="M12 8a4 4 0 010 8 4 4 0 010-8z" fill="#FF5F00" />
                        </svg>
                      </div>
                      <div className="bg-white p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8" viewBox="0 0 24 24" fill="#006FCF">
                          <path d="M22 9.3v5.4h-3.5c-.5 0-.9-.4-.9-.9 0-.3.1-.6.4-.8.3-.2.5-.2.9-.2H20V9.6h-1.1c-1.2 0-2 .3-2.5.8-.5.6-.8 1.3-.8 2.2 0 .8.2 1.5.7 2 .5.5 1.1.7 1.9.7h3.6V16H19c-1.6 0-2.9-.4-3.8-1.2-.9-.8-1.4-1.9-1.4-3.2s.5-2.4 1.4-3.2C16.1 7.6 17.4 7.2 19 7.2h3v2.1z" />
                          <path d="M4 7h3.5c1.4 0 2.5.4 3.3 1.1.8.7 1.2 1.7 1.2 2.9 0 1.2-.4 2.2-1.2 2.9-.8.7-1.9 1.1-3.3 1.1H6v2H4V7zm3.3 6c1.9 0 2.9-.7 2.9-2s-1-2-2.9-2H6v4h1.3z" />
                        </svg>
                      </div>
                      <div className="bg-white p-1 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8" viewBox="0 0 24 24" fill="#253B80">
                          <path d="M9.1 9.6c-.1-.7-.7-1.1-1.4-1.1-.3 0-.6.1-.8.2-.2.1-.3.3-.3.5 0 .3.2.5.5.6.3.1.7.1 1.1.2.7.1 1.2.2 1.6.4.4.2.7.5.9.8.2.3.3.7.3 1.2 0 .8-.3 1.4-.9 1.8-.6.4-1.3.7-2.3.7-.7 0-1.2-.1-1.7-.3-.5-.2-.8-.5-1.1-.9-.2-.4-.4-.8-.4-1.3h1.8c0 .3.2.6.4.7.2.2.5.2.9.2.3 0 .6-.1.8-.2.2-.1.3-.3.3-.5 0-.2-.1-.4-.3-.5-.2-.1-.6-.2-1.1-.3-.7-.1-1.2-.2-1.6-.4-.4-.2-.6-.4-.8-.7-.2-.3-.3-.6-.3-1 0-.5.1-.9.4-1.2.2-.3.6-.6 1-.8.4-.2.9-.3 1.4-.3 1.4 0 2.2.7 2.4 2h-1.8zm1.4.2h1.7c0-.3.1-.6.2-.8.1-.2.3-.4.5-.5.2-.1.5-.2.8-.2.4 0 .8.1 1 .4.2.2.4.6.4 1v3.1c0 .2 0 .4.1.5 0 .1.1.3.2.3h-1.7c0-.1-.1-.1-.1-.2v-.2c-.3.4-.8.5-1.4.5-.4 0-.8-.1-1.1-.2-.3-.2-.5-.4-.7-.6-.1-.3-.2-.6-.2-.9 0-.5.1-.9.4-1.2.3-.3.7-.5 1.3-.6l1.3-.2c.3 0 .4-.1.5-.2.1-.1.2-.2.2-.4 0-.2-.1-.4-.2-.5-.1-.1-.3-.2-.6-.2-.2 0-.4.1-.6.2-.2.1-.3.3-.3.5h-1.7zm3.4 1.5c-.1.1-.2.1-.3.1-.1 0-.3.1-.5.1l-.6.1c-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5 0 .2.1.4.2.5.1.1.3.2.5.2.3 0 .6-.1.8-.2.2-.2.4-.3.5-.6.1-.2.1-.5.1-.7v-.2zm5-3.5c.6 0 1 .1 1.4.3.4.2.7.5.9.9.2.4.3.8.3 1.3v3.7h-1.7v-3.4c0-.4-.1-.6-.2-.8-.2-.2-.4-.3-.7-.3-.3 0-.5.1-.7.3-.2.2-.2.5-.2.9v3.3h-1.7V8h1.7v.7c.3-.5.9-.8 1.6-.8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
