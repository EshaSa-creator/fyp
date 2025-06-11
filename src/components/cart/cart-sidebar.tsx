import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { X, Plus, Minus } from "lucide-react";
import { formatCurrency, getProductImage } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function CartSidebar() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setCartOpen,
    updateCartItem,
    removeFromCart,
  } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full md:max-w-md flex flex-col h-full">
        <SheetHeader className="border-b border-neutral-200 pb-4">
          <SheetTitle className="font-heading font-bold text-xl">
            Your Cart ({cartCount} items)
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-grow">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-medium mb-2">Your cart is empty</h3>
            <p className="text-neutral-600 mb-6 text-center">
              Looks like you haven't added any items to your cart yet.
            </p>
            <SheetClose asChild>
              <Button onClick={() => setCartOpen(false)} className="bg-primary hover:bg-blue-600">
                Continue Shopping
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-grow overflow-auto py-4 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex border-b border-neutral-200 pb-4">
                  <Link href={`/product/${item.product.id}`}>
                    <img
                      src={getProductImage(item.product.imageUrl)}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg cursor-pointer"
                    />
                  </Link>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="font-medium cursor-pointer hover:text-primary">
                          {item.product.name}
                        </h3>
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-neutral-400 hover:text-error"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-neutral-600">{item.product.description.slice(0, 40)}...</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border rounded">
                        <button
                          className="px-2 py-1 text-neutral-600 hover:text-primary"
                          onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          className="px-2 py-1 text-neutral-600 hover:text-primary"
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(
                          (item.product.isOnSale && item.product.salePrice
                            ? item.product.salePrice
                            : item.product.price) * item.quantity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="border-t border-neutral-200 bg-neutral-100 p-4 mt-auto">
              <div className="space-y-2 mb-4 w-full">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium">{cartTotal >= 50 ? "Free" : formatCurrency(4.99)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal >= 50 ? cartTotal : cartTotal + 4.99)}</span>
                </div>
              </div>
              <SheetClose asChild>
                <Button asChild className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
