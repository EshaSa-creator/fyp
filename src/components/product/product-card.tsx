import { Link } from "wouter";
import { Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { formatCurrency, getProductImage, calculateDiscountPercentage } from "@/lib/utils";
import { Star, StarHalf, Heart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  
  // Generate full stars, half stars, and empty stars for ratings
  const stars = [];
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 >= 0.5;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="fill-current" size={16} />);
  }
  
  if (hasHalfStar) {
    stars.push(<StarHalf key="half" className="fill-current" size={16} />);
  }
  
  for (let i = stars.length; i < 5; i++) {
    stars.push(<Star key={`empty-${i}`} className="text-gray-300" size={16} />);
  }

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  const displayPrice = () => {
    if (product.isOnSale && product.salePrice) {
      return (
        <div>
          <span className="font-bold text-lg">{formatCurrency(product.salePrice)}</span>
          <span className="text-sm text-neutral-600 line-through ml-2">
            {formatCurrency(product.price)}
          </span>
        </div>
      );
    }
    return <span className="font-bold text-lg">{formatCurrency(product.price)}</span>;
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <img 
            src={getProductImage(product.imageUrl)} 
            alt={product.name} 
            className="w-full h-48 object-cover cursor-pointer"
          />
        </Link>
        
        {/* Product badges */}
        {product.isOnSale && product.salePrice && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-medium px-2 py-1 rounded">
            {calculateDiscountPercentage(product.price, product.salePrice)}% Off
          </span>
        )}
        
        {/* Wishlist button */}
        <button className="absolute top-3 right-3 bg-white text-neutral-600 hover:text-secondary p-2 rounded-full shadow transition-colors">
          <Heart size={16} />
        </button>
      </div>
      
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-lg cursor-pointer hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <div className="flex text-accent">
            {stars}
          </div>
          <span className="text-sm text-neutral-600 ml-1">({product.reviewCount})</span>
        </div>
        
        <p className="text-sm text-neutral-600 mb-3">{product.description}</p>
        
        <div className="flex justify-between items-center">
          {displayPrice()}
          <Button 
            onClick={handleAddToCart} 
            className="bg-primary hover:bg-blue-600 text-white transition-colors">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
