import { Link } from "wouter";
import { Property } from "@/lib/types";
import PropertyCard from "@/components/home/property-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface FeaturedPropertiesProps {
  properties: Property[];
  isLoading: boolean;
}

export default function FeaturedProperties({ properties, isLoading }: FeaturedPropertiesProps) {
  // Show only active properties
  const activeProperties = properties.filter(property => property.status === 'active');
  
  // Show up to 4 properties
  const featuredProperties = activeProperties.slice(0, 4);
  
  return (
    <section className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Featured Properties</h2>
        <Link href="/properties">
          <Button variant="link" className="text-primary font-medium hover:underline">
            View all
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="rounded-xl overflow-hidden shadow-md">
              <Skeleton className="pb-[66.25%] relative" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : featuredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No properties available at the moment.</p>
          {isLoading ? null : (
            <Link href="/properties">
              <Button className="mt-4 bg-primary hover:bg-primary/90">
                Browse All Properties
              </Button>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
