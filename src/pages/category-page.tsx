import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGrid from "@/components/product/product-grid";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Filter, 
  SlidersHorizontal, 
  Loader2, 
  AlertCircle,
  Dog,
  Cat,
  Fish
} from "lucide-react";

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products by category
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: [`/api/products?category=${category}`],
  });

  // Get category name with proper capitalization
  const getCategoryName = () => {
    switch (category) {
      case 'dog':
        return 'Dogs';
      case 'cat':
        return 'Cats';
      case 'fish':
        return 'Fish';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  // Get category icon
  const getCategoryIcon = () => {
    switch (category) {
      case 'dog':
        return <Dog className="mr-2" size={24} />;
      case 'cat':
        return <Cat className="mr-2" size={24} />;
      case 'fish':
        return <Fish className="mr-2" size={24} />;
      default:
        return null;
    }
  };

  // Get category description
  const getCategoryDescription = () => {
    switch (category) {
      case 'dog':
        return 'Browse our selection of premium dog food, toys, accessories, and more for your canine companion.';
      case 'cat':
        return 'Discover quality cat food, toys, litter supplies, and accessories to keep your feline friend happy and healthy.';
      case 'fish':
        return 'Explore our range of fish food, tanks, filters, decorations, and accessories for your aquatic pets.';
      default:
        return 'Browse our selection of quality pet products.';
    }
  };

  // Sort products
  const sortProducts = (products: Product[]) => {
    const productsCopy = [...products];
    
    switch (sortBy) {
      case 'price-low':
        return productsCopy.sort((a, b) => {
          const aPrice = a.isOnSale && a.salePrice ? a.salePrice : a.price;
          const bPrice = b.isOnSale && b.salePrice ? b.salePrice : b.price;
          return aPrice - bPrice;
        });
      case 'price-high':
        return productsCopy.sort((a, b) => {
          const aPrice = a.isOnSale && a.salePrice ? a.salePrice : a.price;
          const bPrice = b.isOnSale && b.salePrice ? b.salePrice : b.price;
          return bPrice - aPrice;
        });
      case 'rating':
        return productsCopy.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return productsCopy.sort((a, b) => b.id - a.id);
      case 'featured':
      default:
        return productsCopy.filter(p => p.isFeatured).concat(productsCopy.filter(p => !p.isFeatured));
    }
  };

  // Filter by price range
  const filterProducts = (products: Product[]) => {
    return products.filter(product => {
      const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
  };

  // Apply sorting and filtering
  const filteredAndSortedProducts = sortProducts(filterProducts(products));

  // Handle price range change
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
          <span className="ml-2">Loading products...</span>
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
              <h2 className="text-lg font-semibold">Error Loading Products</h2>
            </div>
            <p className="text-neutral-600">{error.message}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
              <BreadcrumbLink>{getCategoryName()}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Category Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center mb-2">
              {getCategoryIcon()}
              <h1 className="font-heading font-bold text-3xl">{getCategoryName()}</h1>
            </div>
            <p className="text-neutral-600 mb-0">{getCategoryDescription()}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters - Desktop */}
            <div className="w-full md:w-64 hidden md:block">
              <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="font-heading font-semibold text-lg mb-4 flex items-center">
                  <Filter className="mr-2" size={18} /> Filters
                </h2>

                <Accordion type="single" collapsible defaultValue="category">
                  <AccordionItem value="category">
                    <AccordionTrigger className="font-medium">Categories</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="food" />
                        <Label htmlFor="food">Food</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="toys" />
                        <Label htmlFor="toys">Toys</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="accessories" />
                        <Label htmlFor="accessories">Accessories</Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="price">
                    <AccordionTrigger className="font-medium">Price Range</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-2 py-4">
                        <Slider
                          defaultValue={[0, 100]}
                          max={100}
                          step={1}
                          onValueChange={handlePriceRangeChange}
                        />
                        <div className="flex justify-between mt-2">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="rating">
                    <AccordionTrigger className="font-medium">Rating</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="4star" />
                        <Label htmlFor="4star">4 Stars & Above</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="3star" />
                        <Label htmlFor="3star">3 Stars & Above</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="2star" />
                        <Label htmlFor="2star">2 Stars & Above</Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="availability">
                    <AccordionTrigger className="font-medium">Availability</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="instock" />
                        <Label htmlFor="instock">In Stock</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="onsale" />
                        <Label htmlFor="onsale">On Sale</Label>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Mobile Filters Button */}
            <div className="md:hidden mb-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="mr-2" size={16} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              
              {/* Mobile Filters */}
              {showFilters && (
                <div className="bg-white rounded-xl shadow-md p-4 mt-3">
                  <h2 className="font-heading font-semibold text-lg mb-4 flex items-center">
                    <Filter className="mr-2" size={18} /> Filters
                  </h2>

                  <Accordion type="single" collapsible>
                    <AccordionItem value="category">
                      <AccordionTrigger className="font-medium">Categories</AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-food" />
                          <Label htmlFor="mobile-food">Food</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-toys" />
                          <Label htmlFor="mobile-toys">Toys</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="mobile-accessories" />
                          <Label htmlFor="mobile-accessories">Accessories</Label>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="price">
                      <AccordionTrigger className="font-medium">Price Range</AccordionTrigger>
                      <AccordionContent>
                        <div className="px-2 py-4">
                          <Slider
                            defaultValue={[0, 100]}
                            max={100}
                            step={1}
                            onValueChange={handlePriceRangeChange}
                          />
                          <div className="flex justify-between mt-2">
                            <span>${priceRange[0]}</span>
                            <span>${priceRange[1]}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
            </div>

            {/* Products */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">{filteredAndSortedProducts.length} products</span>
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Best Rating</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredAndSortedProducts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-neutral-600 mb-6">
                    We couldn't find any products matching your criteria. Try adjusting your filters.
                  </p>
                  <Button
                    onClick={() => {
                      setPriceRange([0, 100]);
                      setSortBy('featured');
                    }}
                    className="bg-primary"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <ProductGrid products={filteredAndSortedProducts} />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
