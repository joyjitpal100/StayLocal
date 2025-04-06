import { Link } from "wouter";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Property } from "@/lib/types";
import { useState } from "react";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  return (
    <Link href={`/property/${property.id}`}>
      <Card className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 cursor-pointer h-full">
        <div className="relative pb-[66.25%] overflow-hidden">
          <img 
            src={property.images[0]} 
            alt={property.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/60 hover:bg-white transition"
          >
            <Heart 
              className={`${isFavorite ? 'fill-primary text-primary' : 'text-gray-700'}`} 
              size={20} 
            />
          </button>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{property.title}</h3>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-yellow-500"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1">{property.rating || "New"}</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-2">{property.location}</p>
          <p className="text-gray-600 text-sm">Available now</p>
          <p className="mt-2">
            <span className="font-semibold text-gray-900">₹{property.pricePerNight.toLocaleString()}</span> night
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
