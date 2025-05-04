
import { useState } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const HotelRegistration = () => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    city: "",
    address: "",
    stars: 0,
    amenities: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch("/api/hotels/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("Failed to register hotel");
      
      toast({
        title: "Success",
        description: "Hotel registration submitted for approval",
      });
      
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register hotel",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Register Your Hotel</h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <label className="block mb-2">Hotel Name</label>
            <Input
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Location</label>
            <Input
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">City</label>
            <Input
              value={formData.city}
              onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Address</label>
            <Input
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <label className="block mb-2">Stars (1-5)</label>
            <Input
              type="number"
              min="1"
              max="5"
              value={formData.stars}
              onChange={e => setFormData(prev => ({ ...prev, stars: parseInt(e.target.value) }))}
              required
            />
          </div>
          
          <Button type="submit">Submit for Approval</Button>
        </form>
      </main>
      <Footer />
    </>
  );
};

export default HotelRegistration;
