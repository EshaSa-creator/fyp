import { Star, StarHalf } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarFallback } from "@/lib/utils";

interface TestimonialCardProps {
  rating: number;
  content: string;
  author: {
    name: string;
    title: string;
    initials?: string;
  };
}

export default function TestimonialCard({ rating, content, author }: TestimonialCardProps) {
  // Generate the star rating display
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-accent text-accent" size={16} />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-accent text-accent" size={16} />);
    }
    
    // Add empty stars to make a total of 5
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" size={16} />);
    }
    
    return stars;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex text-accent mb-4">
        {renderStars()}
      </div>
      <p className="text-neutral-600 mb-4">{content}</p>
      <div className="flex items-center">
        <Avatar className="h-10 w-10 bg-neutral-200">
          <AvatarFallback className="text-neutral-500 font-medium">
            {author.initials || getAvatarFallback(author.name)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h4 className="font-medium">{author.name}</h4>
          <p className="text-sm text-neutral-500">{author.title}</p>
        </div>
      </div>
    </div>
  );
}
