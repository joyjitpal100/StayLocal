import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Ensure we have at least 3 images, even if duplicated
  const displayImages = images.length >= 3 
    ? images.slice(0, 3) 
    : [...images, ...images, ...images].slice(0, 3);
  
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowAllPhotos(true);
  };
  
  return (
    <>
      <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
        <div className="col-span-2">
          <img 
            src={displayImages[0]} 
            alt={`${title} - main view`} 
            className="w-full h-80 object-cover cursor-pointer"
            onClick={() => handleImageClick(0)}
          />
        </div>
        <div>
          <img 
            src={displayImages[1]} 
            alt={`${title} - view 2`} 
            className="w-full h-40 object-cover cursor-pointer"
            onClick={() => handleImageClick(1)}
          />
        </div>
        <div className="relative">
          <img 
            src={displayImages[2]} 
            alt={`${title} - view 3`} 
            className="w-full h-40 object-cover cursor-pointer"
            onClick={() => handleImageClick(2)}
          />
          <Dialog open={showAllPhotos} onOpenChange={setShowAllPhotos}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                View all photos
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">All photos for {title}</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowAllPhotos(false)}
                  size="icon"
                >
                  <X size={20} />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${title} - view ${index + 1}`} 
                    className="w-full h-auto max-h-[50vh] object-cover rounded-lg"
                  />
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
