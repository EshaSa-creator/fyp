import { Product } from "@shared/schema";
import ProductCard from "@/components/product/product-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  products: Product[];
  title?: string;
  hasNavigation?: boolean;
}

export default function ProductGrid({ 
  products, 
  title, 
  hasNavigation = false 
}: ProductGridProps) {
  // In a real implementation, we would add navigation functionality
  // For this example, we'll just create the UI without actual sliding functionality
  const handlePrev = () => {
    console.log('Previous products');
  };

  const handleNext = () => {
    console.log('Next products');
  };

  return (
    <div className="container mx-auto px-4">
      {title && (
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-heading font-bold text-3xl">{title}</h2>
          {hasNavigation && (
            <div className="hidden md:flex space-x-2">
              <Button 
                onClick={handlePrev}
                variant="outline" 
                size="icon" 
                className="bg-white hover:bg-neutral-200 rounded-full shadow transition-colors"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button 
                onClick={handleNext}
                variant="outline" 
                size="icon" 
                className="bg-white hover:bg-neutral-200 rounded-full shadow transition-colors"
              >
                <ChevronRight size={18} />
              </Button>
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {hasNavigation && (
        <div className="flex justify-center mt-8 md:hidden space-x-2">
          <Button
            onClick={handlePrev}
            variant="outline"
            size="icon"
            className="bg-white hover:bg-neutral-200 rounded-full shadow transition-colors"
          >
            <ChevronLeft size={18} />
          </Button>
          <Button
            onClick={handleNext}
            variant="outline"
            size="icon"
            className="bg-white hover:bg-neutral-200 rounded-full shadow transition-colors"
          >
            <ChevronRight size={18} />
          </Button>
        </div>
      )}
    </div>
  );
}
