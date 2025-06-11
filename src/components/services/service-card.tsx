import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export type ServiceType = "grooming" | "training" | "vet";

interface ServiceCardProps {
  serviceType: ServiceType;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  onBookService: (serviceType: ServiceType) => void;
}

export default function ServiceCard({
  serviceType,
  name,
  description,
  price,
  imageUrl,
  onBookService,
}: ServiceCardProps) {
  return (
    <div className="bg-neutral-100 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <img 
        src={`${imageUrl}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400`} 
        alt={name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="font-heading font-semibold text-xl mb-3">{name}</h3>
        <p className="text-neutral-600 mb-4">{description}</p>
        <div className="flex justify-between items-center">
          <span className="font-medium">From {formatCurrency(price)}</span>
          <Button 
            onClick={() => onBookService(serviceType)}
            className="bg-primary hover:bg-blue-600 text-white transition-colors"
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
