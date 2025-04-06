import { Link } from "wouter";
import { 
  Home, 
  Building, 
  Umbrella, 
  Mountain,
  Tent,
  Building2,
  Tree,
  Hotel
} from "lucide-react";

interface CategoryProps {
  icon: React.ReactNode;
  name: string;
  count: number;
  href: string;
}

function CategoryCard({ icon, name, count, href }: CategoryProps) {
  return (
    <Link href={href} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 text-center">
      <div className="p-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-gray-600 text-sm mt-1">{count} properties</p>
      </div>
    </Link>
  );
}

export default function PropertyCategories() {
  const categories = [
    { 
      icon: <Home className="h-6 w-6" />, 
      name: "Entire homes", 
      count: 1254, 
      href: "/properties?propertyType=Villa" 
    },
    { 
      icon: <Building className="h-6 w-6" />, 
      name: "Apartments", 
      count: 879, 
      href: "/properties?propertyType=Apartment" 
    },
    { 
      icon: <Umbrella className="h-6 w-6" />, 
      name: "Beachfront", 
      count: 432, 
      href: "/properties?amenities=Beach+access" 
    },
    { 
      icon: <Mountain className="h-6 w-6" />, 
      name: "Mountain views", 
      count: 653, 
      href: "/properties?amenities=Mountain+view" 
    },
  ];
  
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Explore by Property Type</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <CategoryCard 
              key={index}
              icon={category.icon}
              name={category.name}
              count={category.count}
              href={category.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
