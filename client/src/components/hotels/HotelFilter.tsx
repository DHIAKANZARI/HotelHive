import { useState, useEffect } from "react";
import { HotelFilters } from "@/types";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface HotelFilterProps {
  filters: HotelFilters;
  onFilterChange: (filters: HotelFilters) => void;
}

const HotelFilter = ({ filters, onFilterChange }: HotelFilterProps) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedStars, setSelectedStars] = useState<number | undefined>(filters.stars);
  const [cities, setCities] = useState<{ [key: string]: boolean }>({
    Hammamet: false,
    Djerba: false,
    Tunis: false,
    Sousse: false,
  });

  useEffect(() => {
    // Initialize price range if filters have min/max price
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      setPriceRange([
        filters.minPrice || 0,
        filters.maxPrice || 500,
      ]);
    }
    
    // Initialize city checkboxes
    if (filters.city) {
      setCities({
        ...cities,
        [filters.city]: true,
      });
    }
    
    // Initialize stars filter
    if (filters.stars) {
      setSelectedStars(filters.stars);
    }
  }, []);

  const handlePriceChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  const handleStarClick = (stars: number) => {
    setSelectedStars(selectedStars === stars ? undefined : stars);
  };

  const handleCityChange = (city: string, checked: boolean) => {
    setCities({
      ...cities,
      [city]: checked,
    });
  };

  const handleApplyFilters = () => {
    const selectedCity = Object.entries(cities).find(([_, selected]) => selected);
    
    onFilterChange({
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      stars: selectedStars,
      city: selectedCity ? selectedCity[0] : undefined,
    });
  };

  const handleResetFilters = () => {
    setPriceRange([0, 500]);
    setSelectedStars(undefined);
    setCities({
      Hammamet: false,
      Djerba: false,
      Tunis: false,
      Sousse: false,
    });
    
    onFilterChange({
      minPrice: undefined,
      maxPrice: undefined,
      stars: undefined,
      city: undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Price Range</h3>
        <div className="mb-6">
          <Slider
            defaultValue={[priceRange[0], priceRange[1]]}
            min={0}
            max={500}
            step={10}
            value={[priceRange[0], priceRange[1]]}
            onValueChange={handlePriceChange}
            className="mb-2"
          />
          <div className="flex items-center justify-between">
            <div className="border rounded-md px-2 py-1 text-sm">
              ${priceRange[0]}
            </div>
            <div className="border rounded-md px-2 py-1 text-sm">
              ${priceRange[1]}
            </div>
          </div>
        </div>
      </div>
      
      {/* Star Rating Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Star Rating</h3>
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              type="button"
              className={`flex items-center border rounded-md px-3 py-1.5 ${
                selectedStars === stars
                  ? "bg-primary-light border-primary"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
              onClick={() => handleStarClick(stars)}
            >
              <div className="flex mr-1">
                {[...Array(stars)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <span className="text-sm">{stars}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* City Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">City</h3>
        <div className="space-y-2">
          {Object.entries(cities).map(([city, checked]) => (
            <div key={city} className="flex items-center">
              <Checkbox
                id={`city-${city}`}
                checked={checked}
                onCheckedChange={(checked) => 
                  handleCityChange(city, checked as boolean)
                }
              />
              <Label htmlFor={`city-${city}`} className="ml-2">
                {city}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Apply/Reset Buttons */}
      <div className="flex gap-2">
        <Button 
          onClick={handleApplyFilters}
          className="flex-1"
        >
          Apply Filters
        </Button>
        <Button 
          variant="outline" 
          onClick={handleResetFilters}
          className="flex-1"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default HotelFilter;
