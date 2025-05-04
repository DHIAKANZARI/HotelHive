
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel } from "@/types";

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const { data: hotels, refetch } = useQuery<Hotel[]>({
    queryKey: ["/api/admin/hotels"],
    enabled: user?.isAdmin,
  });

  const handleApproveHotel = async (hotelId: number) => {
    try {
      await fetch(`/api/admin/approve-hotel/${hotelId}`, {
        method: "POST",
      });
      refetch();
    } catch (error) {
      console.error("Error approving hotel:", error);
    }
  };

  if (!user?.isAdmin) {
    return <div>Access denied</div>;
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pending Hotels</h2>
          <div className="grid gap-4">
            {hotels?.filter(hotel => hotel.status === 'pending').map(hotel => (
              <Card key={hotel.id}>
                <CardHeader>
                  <CardTitle>{hotel.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{hotel.description}</p>
                  <p>Location: {hotel.location}</p>
                  <Button 
                    onClick={() => handleApproveHotel(hotel.id)}
                    className="mt-4"
                  >
                    Approve Hotel
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AdminDashboard;
