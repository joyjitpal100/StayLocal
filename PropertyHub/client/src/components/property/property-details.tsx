import { useState } from "react";
import { Property, Review } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  Users, 
  Bed, 
  Bath, 
  Wifi, 
  Snowflake, 
  Tv, 
  Utensils,
  Car,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PropertyDetailsProps {
  property: Property;
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/properties/${property.id}/reviews`]
  });
  
  const displayedAmenities = showAllAmenities 
    ? property.amenities 
    : property.amenities.slice(0, 6);
  
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="text-gray-700 mr-3" size={18} />;
    if (amenityLower.includes('air') || amenityLower.includes('ac')) return <Snowflake className="text-gray-700 mr-3" size={18} />;
    if (amenityLower.includes('tv')) return <Tv className="text-gray-700 mr-3" size={18} />;
    if (amenityLower.includes('kitchen')) return <Utensils className="text-gray-700 mr-3" size={18} />;
    if (amenityLower.includes('parking')) return <Car className="text-gray-700 mr-3" size={18} />;
    if (amenityLower.includes('cleaning')) return <Sparkles className="text-gray-700 mr-3" size={18} />;
    return <div className="w-[18px] h-[18px] rounded-full bg-gray-200 mr-3"></div>;
  };
  
  const description = property.description || '';
  const shortDescription = description.length > 200 
    ? `${description.slice(0, 200)}...` 
    : description;
  
  return (
    <div className="mt-8">
      <div className="flex flex-wrap justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
          <p className="text-gray-600 mt-1">{property.location}</p>
        </div>
        <div className="flex items-center mt-2 md:mt-0">
          <Star className="text-yellow-500" size={18} />
          <span className="ml-1 font-medium">{property.rating || "New"}</span>
          {reviews.length > 0 && (
            <>
              <span className="mx-1">·</span>
              <a href="#reviews" className="text-gray-600 hover:underline">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </a>
            </>
          )}
        </div>
      </div>
      
      <div className="border-b border-gray-200 pb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <Home className="text-gray-700 mr-2" size={18} />
            <span>Entire {property.propertyType.toLowerCase()}</span>
          </div>
          <div className="flex items-center">
            <Users className="text-gray-700 mr-2" size={18} />
            <span>{property.maxGuests} guest{property.maxGuests !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Bed className="text-gray-700 mr-2" size={18} />
            <span>{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Bath className="text-gray-700 mr-2" size={18} />
            <span>{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
      
      <div className="py-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">About this place</h2>
        <p className="text-gray-600 mb-4">
          {showFullDescription ? description : shortDescription}
        </p>
        {description.length > 200 && (
          <Button 
            variant="link" 
            className="font-medium text-gray-900 p-0 hover:no-underline" 
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? "Show less" : "Read more"}
          </Button>
        )}
      </div>
      
      <div className="py-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedAmenities.map((amenity, index) => (
            <div key={index} className="flex items-center">
              {getAmenityIcon(amenity)}
              <span>{amenity}</span>
            </div>
          ))}
        </div>
        {property.amenities.length > 6 && (
          <Button 
            variant="outline" 
            className="mt-4 px-4 py-2 border border-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            onClick={() => setShowAllAmenities(!showAllAmenities)}
          >
            {showAllAmenities ? "Show less" : `Show all ${property.amenities.length} amenities`}
          </Button>
        )}
      </div>
      
      {reviews.length > 0 && (
        <div id="reviews" className="py-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mr-2">Reviews</h2>
            <div className="flex items-center">
              <Star className="text-yellow-500" size={18} />
              <span className="ml-1 font-medium">{property.rating}</span>
              <span className="mx-1 text-gray-400">·</span>
              <span>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {reviews.slice(0, 3).map((review, index) => (
              <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-center mb-2">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage 
                      src={review.user?.profileImage} 
                      alt={review.user?.name} 
                    />
                    <AvatarFallback>
                      {review.user?.name.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</h3>
                    <p className="text-gray-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                {review.comment && <p className="text-gray-600">{review.comment}</p>}
              </div>
            ))}
          </div>
          
          {reviews.length > 3 && (
            <Button 
              variant="outline" 
              className="mt-4"
            >
              Show all {reviews.length} reviews
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
