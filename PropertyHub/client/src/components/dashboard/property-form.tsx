import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Plus } from "lucide-react";

// Property types
const propertyTypes = [
  "Villa",
  "Apartment",
  "Houseboat",
  "Cottage",
  "Bungalow",
  "Farmhouse",
  "Hotel",
  "Resort"
];

// Common amenities
const commonAmenities = [
  "WiFi",
  "Air conditioning",
  "Kitchen",
  "Washing machine",
  "TV",
  "Free parking",
  "Pool",
  "Beach access",
  "Mountain view",
  "Balcony",
  "Garden",
  "BBQ grill",
  "Gym",
  "Pets allowed"
];

// Schema for property form validation
const propertySchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  pricePerNight: z.number().min(500, "Price must be at least ₹500"),
  bedrooms: z.number().min(1, "Must have at least 1 bedroom"),
  bathrooms: z.number().min(1, "Must have at least 1 bathroom"),
  maxGuests: z.number().min(1, "Must accommodate at least 1 guest"),
  propertyType: z.string().min(1, "Property type is required"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  amenities: z.array(z.string()).min(1, "At least one amenity is required"),
  status: z.enum(["active", "draft", "inactive"]).default("draft")
});

export default function PropertyForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [customAmenity, setCustomAmenity] = useState("");
  
  // Form setup
  const form = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      latitude: "",
      longitude: "",
      pricePerNight: 2500,
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      propertyType: "",
      images: [],
      amenities: [],
      status: "draft"
    },
  });
  
  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof propertySchema>) => {
      const res = await apiRequest("POST", "/api/properties", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Property created",
        description: "Your property has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/hosts'] });
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error creating property",
        description: error.message || "There was an error creating your property. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof propertySchema>) {
    createPropertyMutation.mutate(values);
  }
  
  // Add image URL to form
  const addImageUrl = () => {
    if (!imageUrl) return;
    
    try {
      new URL(imageUrl); // Validate URL
      const currentImages = form.getValues("images");
      form.setValue("images", [...currentImages, imageUrl]);
      setImageUrl("");
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
    }
  };
  
  // Remove image from form
  const removeImage = (index: number) => {
    const currentImages = form.getValues("images");
    form.setValue("images", currentImages.filter((_, i) => i !== index));
  };
  
  // Toggle amenity selection
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => {
      const newAmenities = prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity];
      
      form.setValue("amenities", newAmenities);
      return newAmenities;
    });
  };
  
  // Add custom amenity
  const addCustomAmenity = () => {
    if (!customAmenity.trim()) return;
    
    setSelectedAmenities(prev => {
      const newAmenities = [...prev, customAmenity];
      form.setValue("amenities", newAmenities);
      return newAmenities;
    });
    
    setCustomAmenity("");
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Basic Information</h2>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Luxury Beachfront Villa in Goa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your property in detail..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Include details about the space, ambiance, and unique features.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. North Goa, Goa, India" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 15.5074" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 73.8278" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Property Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pricePerNight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Night (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 5000" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="maxGuests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Guests</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 4" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bedrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bedrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 2" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bathrooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bathrooms</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 2" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active (Visible to guests)</SelectItem>
                        <SelectItem value="draft">Draft (Hidden from search)</SelectItem>
                        <SelectItem value="inactive">Inactive (Temporarily unavailable)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Active listings are immediately available for booking.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="space-y-6 border-t pt-6">
            <h2 className="text-xl font-semibold">Images</h2>
            <FormField
              control={form.control}
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Property Images</FormLabel>
                  
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button type="button" onClick={addImageUrl}>Add</Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    {form.getValues("images").map((url, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={url} 
                          alt={`Property ${index + 1}`} 
                          className="h-24 w-full object-cover rounded-md border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/150?text=Error';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-80 hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <FormDescription>
                    Add high-quality images of your property (exterior, interior, amenities)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6 border-t pt-6">
            <h2 className="text-xl font-semibold">Amenities</h2>
            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {commonAmenities.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox 
                          id={amenity} 
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <label
                          htmlFor={amenity}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Input
                      placeholder="Add custom amenity"
                      value={customAmenity}
                      onChange={(e) => setCustomAmenity(e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={addCustomAmenity}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                  
                  {selectedAmenities.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Selected Amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAmenities.map((amenity) => (
                          <div 
                            key={amenity} 
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {amenity}
                            <button
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end gap-4 border-t pt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={createPropertyMutation.isPending}
            >
              {createPropertyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Property"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
