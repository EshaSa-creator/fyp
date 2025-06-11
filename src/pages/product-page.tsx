import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGrid from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatCurrency, getProductImage } from "@/lib/utils";
import { 
  Star, 
  StarHalf, 
  Heart, 
  Minus, 
  Plus, 
  ShoppingCart, 
  AlertCircle,
  Loader2
} from "lucide-react";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Fetch product details
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });

  // Fetch related products
  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: !!product,
  });

  // Handle quantity changes
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  // Generate star rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-current" size={18} />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-current" size={18} />);
    }
    
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" size={18} />);
    }
    
    return (
      <div className="flex text-accent">
        {stars}
      </div>
    );
  };

  // Render the price display
  const renderPrice = () => {
    if (!product) return null;
    
    if (product.isOnSale && product.salePrice) {
      return (
        <div className="flex items-center">
          <span className="text-2xl font-bold">{formatCurrency(product.salePrice)}</span>
          <span className="text-lg text-neutral-600 line-through ml-2">
            {formatCurrency(product.price)}
          </span>
          <span className="ml-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
            {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
          </span>
        </div>
      );
    }
    
    return <span className="text-2xl font-bold">{formatCurrency(product.price)}</span>;
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2">Loading product details...</span>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center text-red-500 mb-4">
              <AlertCircle className="mr-2" />
              <h2 className="text-lg font-semibold">Error Loading Product</h2>
            </div>
            <p className="text-neutral-600">
              {error ? error.message : "Product not found or has been removed."}
            </p>
            <Button 
              onClick={() => navigate("/")}
              className="mt-4 bg-primary"
            >
              Back to Homepage
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Filter out current product from related products and limit to 4
  const filteredRelatedProducts = relatedProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  return (
    <>
      <Header />
      <main className="bg-neutral-100 py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/category/${product.category}`}>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{product.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Product details */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product image */}
              <div className="p-6 flex items-center justify-center">
                <img 
                  src={getProductImage(product.imageUrl)} 
                  alt={product.name} 
                  className="w-full max-w-md rounded-lg object-cover"
                />
              </div>

              {/* Product info */}
              <div className="p-6 md:p-8">
                <h1 className="font-heading font-bold text-3xl mb-2">{product.name}</h1>
                
                <div className="flex items-center mb-4">
                  {renderStars(product.rating)}
                  <span className="ml-2 text-neutral-600">
                    {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>

                <p className="text-neutral-600 mb-6">{product.description}</p>

                <div className="mb-6">
                  {renderPrice()}
                  <p className="text-sm text-neutral-600 mt-1">
                    {product.stock > 0 ? (
                      <span className="text-green-600">In Stock</span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                    {product.stock > 0 && product.stock < 10 && (
                      <span className="ml-2">Only {product.stock} left</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center mb-6">
                  <span className="mr-4">Quantity:</span>
                  <div className="flex items-center border rounded">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="text-neutral-600 hover:text-primary"
                    >
                      <Minus size={16} />
                    </Button>
                    <Input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-16 text-center border-0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      className="text-neutral-600 hover:text-primary"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleAddToCart}
                    className="bg-primary hover:bg-blue-600 text-white flex items-center"
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="mr-2" size={18} />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center"
                  >
                    <Heart className="mr-2" size={18} />
                    Add to Wishlist
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Product tabs */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-12">
            <Tabs defaultValue="description">
              <TabsList className="w-full border-b p-0 h-auto">
                <TabsTrigger 
                  value="description"
                  className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger 
                  value="specifications"
                  className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Specifications
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews"
                  className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
                >
                  Reviews ({product.reviewCount})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-3">Product Description</h3>
                  <p>{product.description}</p>
                  <p className="mt-4">
                    {product.name} is designed for pets who deserve the best. Premium quality ensures
                    your pet's health and happiness. Suitable for pets of all ages and sizes, this product
                    will quickly become an essential part of your pet care routine.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="specifications" className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-3">Product Specifications</h3>
                  <ul className="space-y-2">
                    <li><strong>Category:</strong> {product.category.charAt(0).toUpperCase() + product.category.slice(1)}</li>
                    <li><strong>Type:</strong> {product.subCategory ? product.subCategory.charAt(0).toUpperCase() + product.subCategory.slice(1) : 'N/A'}</li>
                    <li><strong>Stock:</strong> {product.stock} units</li>
                    <li><strong>Weight:</strong> {(Math.random() * 2 + 0.1).toFixed(1)} kg</li>
                    <li><strong>Dimensions:</strong> {Math.floor(Math.random() * 20 + 10)}cm x {Math.floor(Math.random() * 20 + 10)}cm x {Math.floor(Math.random() * 10 + 5)}cm</li>
                    <li><strong>Material:</strong> Premium quality materials</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="p-6">
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold mb-3">Customer Reviews</h3>
                  <div className="flex items-center mb-4">
                    <div className="flex text-accent mr-2">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-lg font-medium">{product.rating.toFixed(1)} out of 5</span>
                    <span className="text-neutral-600 ml-2">({product.reviewCount} reviews)</span>
                  </div>
                  <div className="bg-neutral-100 p-4 rounded-lg text-center">
                    <p>Review content will be loaded here in a future update.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related products */}
          {filteredRelatedProducts.length > 0 && (
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl mb-6">Related Products</h2>
              <ProductGrid products={filteredRelatedProducts} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
