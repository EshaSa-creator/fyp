import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  User, 
  Heart, 
  ShoppingCart, 
  Menu, 
  X 
} from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { cartCount, setCartOpen } = useCart();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Search for:", searchQuery);
    // Redirect to search results page
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCartOpen = () => {
    setCartOpen(true);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      {/* Top notification bar */}
      <div className="bg-primary text-white text-center py-2 text-sm">
        Free shipping on orders over $50! Use code: PETLOVE
      </div>
      
      {/* Main navigation */}
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-3xl text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm9 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm-4.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm9-6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
          </div>
          <span className="font-heading font-bold text-2xl text-neutral-800">Pet<span className="text-primary">Sphere</span></span>
        </Link>
        
        {/* Search bar - desktop */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-10 relative">
          <Input
            type="text"
            placeholder="Search for pet products..."
            className="w-full py-2 px-4 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1 text-primary">
            <Search size={20} />
          </Button>
        </form>
        
        {/* User controls */}
        <div className="flex items-center space-x-5">
          {user ? (
            <div className="hidden sm:block">
              <Link href="/account" className="text-neutral-800 hover:text-primary transition-colors">
                <User className="inline-block mr-1" size={18} />
                <span className="ml-1 text-sm hidden md:inline">Account</span>
              </Link>
            </div>
          ) : (
            <Link href="/auth" className="text-neutral-800 hover:text-primary transition-colors hidden sm:block">
              <User className="inline-block mr-1" size={18} />
              <span className="ml-1 text-sm hidden md:inline">Login</span>
            </Link>
          )}
          <Link href="/wishlist" className="text-neutral-800 hover:text-primary transition-colors relative">
            <Heart className="inline-block" size={18} />
            <span className="ml-1 text-sm hidden md:inline">Wishlist</span>
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
          </Link>
          <button
            onClick={handleCartOpen}
            className="text-neutral-800 hover:text-primary transition-colors relative"
          >
            <ShoppingCart className="inline-block" size={18} />
            <span className="ml-1 text-sm hidden md:inline">Cart</span>
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          </button>
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-neutral-800"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      
      {/* Search bar - mobile */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="text"
            placeholder="Search products..."
            className="w-full py-2 px-4 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit" variant="ghost" size="icon" className="absolute right-1 top-1 text-primary">
            <Search size={18} />
          </Button>
        </form>
      </div>
      
      {/* Categories navigation */}
      <nav className="bg-neutral-100 py-2 border-t border-neutral-200 hidden md:block">
        <div className="container mx-auto px-4">
          <ul className="flex space-x-8 justify-center">
            <li>
              <Link 
                href="/category/dog" 
                className={`${location === '/category/dog' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} font-medium`}
              >
                Dogs
              </Link>
            </li>
            <li>
              <Link 
                href="/category/cat" 
                className={`${location === '/category/cat' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} font-medium`}
              >
                Cats
              </Link>
            </li>
            <li>
              <Link 
                href="/category/fish" 
                className={`${location === '/category/fish' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} font-medium`}
              >
                Fish
              </Link>
            </li>
            <li>
              <Link 
                href="/category/food" 
                className={`${location === '/category/food' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} font-medium`}
              >
                Food
              </Link>
            </li>
            <li>
              <Link 
                href="/category/toy" 
                className={`${location === '/category/toy' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} font-medium`}
              >
                Toys
              </Link>
            </li>
            <li>
              <Link 
                href="/category/accessory" 
                className={`${location === '/category/accessory' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} font-medium`}
              >
                Accessories
              </Link>
            </li>
            <li>
              <Link 
                href="/appointments" 
                className={`${location === '/appointments' ? 'text-primary' : 'text-neutral-800 hover:text-primary'} font-medium`}
              >
                Services
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 animate-fadeIn">
          <div className="container mx-auto px-4 py-3">
            <ul className="space-y-3">
              <li className="text-neutral-800 font-medium">Shop by Pet</li>
              <li>
                <Link 
                  href="/category/dog" 
                  className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dogs
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/cat" 
                  className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cats
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/fish" 
                  className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Fish
                </Link>
              </li>
              <li className="text-neutral-800 font-medium pt-2">Shop by Category</li>
              <li>
                <Link 
                  href="/category/food" 
                  className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Food
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/toy" 
                  className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Toys
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/accessory" 
                  className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link 
                  href="/appointments" 
                  className="block pl-3 py-2 text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </Link>
              </li>
              {user ? (
                <>
                  <li className="pt-2">
                    <Link 
                      href="/account" 
                      className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="inline-block mr-2" size={16} />
                      My Account
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/orders" 
                      className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left pl-3 py-2 hover:bg-neutral-100 rounded text-red-500"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <li className="pt-2">
                  <Link 
                    href="/auth" 
                    className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="inline-block mr-2" size={16} />
                    Login / Register
                  </Link>
                </li>
              )}
              <li>
                <Link 
                  href="/wishlist" 
                  className="block pl-3 py-2 hover:bg-neutral-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="inline-block mr-2" size={16} />
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
