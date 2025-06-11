import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGrid from "@/components/product/product-grid";
import CategoryCard from "@/components/category-card";
import ServiceCard, { ServiceType } from "@/components/services/service-card";
import BookingModal from "@/components/services/booking-modal";
import TestimonialCard from "@/components/testimonial-card";
import NewsletterForm from "@/components/newsletter-form";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  // State for service booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  // Fetch featured products
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products?featured=true"],
  });

  // Handle booking service
  const handleBookService = (serviceType: ServiceType) => {
    setSelectedService(serviceType);
    setIsBookingModalOpen(true);
  };

  // Testimonial data
  const testimonials = [
    {
      rating: 5,
      content: "My dog absolutely loves the organic treats! The quality is outstanding and delivery was super fast. Will definitely be ordering again.",
      author: {
        name: "Jessica S.",
        title: "Dog Owner",
        initials: "JS",
      },
    },
    {
      rating: 5,
      content: "The grooming service was excellent! The groomer was professional and my cat looks amazing. Booking through the website was super easy.",
      author: {
        name: "Michael T.",
        title: "Cat Owner",
        initials: "MT",
      },
    },
    {
      rating: 4.5,
      content: "I've been using the automatic fish feeder for a month now and it works perfectly! Great quality and the price was better than other stores.",
      author: {
        name: "Amanda K.",
        title: "Fish Enthusiast",
        initials: "AK",
      },
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="relative">
          <div 
            className="h-96 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1546975490-e8b92a360b24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')" }}
          >
            <div className="absolute inset-0 bg-neutral-800 bg-opacity-50"></div>
            <div className="container mx-auto px-4 h-full flex items-center relative">
              <div className="max-w-2xl text-white">
                <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 text-shadow">
                  Everything Your Pet Needs, In One Place
                </h1>
                <p className="mb-6 text-lg">
                  Shop premium pet food, toys, accessories, and book services!
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="#featured-products">
                    <Button className="bg-primary hover:bg-blue-600 text-white font-medium py-3 px-6">
                      Shop Now
                    </Button>
                  </Link>
                  <Link href="#services">
                    <Button variant="outline" className="bg-white hover:bg-neutral-100 text-primary font-medium py-3 px-6">
                      Book Services
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl text-center mb-8">Shop by Pet</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
              <CategoryCard
                title="Dogs"
                description="Food, toys, beds, collars & more"
                imageUrl="https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                linkUrl="/category/dog"
              />
              <CategoryCard
                title="Cats"
                description="Food, litter, toys, scratchers & more"
                imageUrl="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                linkUrl="/category/cat"
              />
              <CategoryCard
                title="Fish"
                description="Food, tanks, decorations, filters & more"
                imageUrl="https://images.unsplash.com/photo-1535591273668-578e31182c4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                linkUrl="/category/fish"
              />
            </div>
          </div>
        </section>

        {/* Featured products section */}
        <section id="featured-products" className="py-12 bg-neutral-100">
          {isLoading ? (
            <div className="container mx-auto px-4 text-center py-8">
              <p>Loading featured products...</p>
            </div>
          ) : (
            <ProductGrid 
              products={products} 
              title="Featured Products" 
              hasNavigation={true} 
            />
          )}
        </section>

        {/* Services section */}
        <section id="services" className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl text-center mb-2">Our Services</h2>
            <p className="text-center text-neutral-600 mb-8 max-w-2xl mx-auto">
              Book professional pet care services directly through our platform.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ServiceCard
                serviceType="grooming"
                name="Grooming"
                description="Professional grooming services for all breeds. Includes bathing, hair trimming, nail clipping, and more."
                price={35}
                imageUrl="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7"
                onBookService={handleBookService}
              />
              <ServiceCard
                serviceType="training"
                name="Training"
                description="Expert training sessions for dogs of all ages. Basic commands, behavior correction, and specialized training."
                price={50}
                imageUrl="https://images.unsplash.com/photo-1587300003388-59208cc962cb"
                onBookService={handleBookService}
              />
              <ServiceCard
                serviceType="vet"
                name="Veterinary Care"
                description="Schedule at-home vet visits for check-ups, vaccinations, and minor treatments for your beloved pets."
                price={75}
                imageUrl="https://images.unsplash.com/photo-1583301286816-f4f05e1e8b25"
                onBookService={handleBookService}
              />
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section className="py-12 bg-neutral-100">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl text-center mb-8">What Our Customers Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  rating={testimonial.rating}
                  content={testimonial.content}
                  author={testimonial.author}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter section */}
        <section className="py-12 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-heading font-bold text-3xl mb-2">Join Our Pet Lovers Community</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter for exclusive deals, pet care tips, and new product announcements.
            </p>
            
            <NewsletterForm />
          </div>
        </section>
      </main>

      {/* Service booking modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        serviceType={selectedService} 
      />

      <Footer />
    </>
  );
}
