import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import SearchForm from "@/components/home/SearchForm";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import FeaturedHotels from "@/components/home/FeaturedHotels";
import Testimonials from "@/components/home/Testimonials";
import CallToAction from "@/components/home/CallToAction";
import { Helmet } from "react-helmet";

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>Hootili - Book Your Perfect Hotel in Tunisia</title>
        <meta
          name="description"
          content="Find and book the perfect hotel in Tunisia with Hootili. Explore our selection of luxury resorts, beach hotels, and city accommodations."
        />
      </Helmet>
      
      <Navbar />
      
      <main>
        <Hero />
        <SearchForm />
        <FeaturedDestinations />
        <FeaturedHotels />
        <Testimonials />
        <CallToAction />
      </main>
      
      <Footer />
    </>
  );
};

export default HomePage;
