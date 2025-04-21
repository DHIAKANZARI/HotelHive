import { Link } from "wouter";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white" id="contact">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">Hootili</h3>
            <p className="text-neutral-300 mb-4">Find your perfect stay in Tunisia with our handpicked selection of hotels and resorts.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-heading">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-neutral-300 hover:text-white">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/hotels">
                  <a className="text-neutral-300 hover:text-white">Hotels</a>
                </Link>
              </li>
              <li>
                <Link href="/hotels?city=Hammamet">
                  <a className="text-neutral-300 hover:text-white">Destinations</a>
                </Link>
              </li>
              <li>
                <Link href="/hotels?special=offers">
                  <a className="text-neutral-300 hover:text-white">Special Offers</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-white">About Us</a>
              </li>
              <li>
                <a href="#contact" className="text-neutral-300 hover:text-white">Contact</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-heading">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-neutral-300 hover:text-white">FAQs</a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-white">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-white">Payment Options</a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-white">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-white">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-neutral-300 hover:text-white">Cancellation Policy</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 font-heading">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-3 text-neutral-400" />
                <span className="text-neutral-300">123 Boulevard Avenue, Tunis, Tunisia</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-neutral-400" />
                <span className="text-neutral-300">+216 71 234 567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-neutral-400" />
                <span className="text-neutral-300">contact@hootili.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2 text-neutral-300">Subscribe to our newsletter</h4>
              <form className="flex">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-white text-neutral-800 rounded-r-none focus-visible:ring-primary"
                />
                <Button type="submit" className="rounded-l-none" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-12 pt-8 text-center text-neutral-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Hootili. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
