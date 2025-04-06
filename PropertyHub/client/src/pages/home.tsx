import { useQuery } from "@tanstack/react-query";
import HeroSection from "@/components/home/hero-section";
import PropertyCategories from "@/components/home/property-categories";
import FeaturedProperties from "@/components/home/featured-properties";
import { Property } from "@/lib/types";

export default function Home() {
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

  return (
    <div>
      <HeroSection />
      
      <FeaturedProperties 
        properties={properties} 
        isLoading={isLoading} 
      />
      
      <PropertyCategories />
    </div>
  );
}
