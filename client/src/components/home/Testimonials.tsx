import { Testimonial } from "@/types";
import TestimonialCard from "./TestimonialCard";

const Testimonials = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      hotel: "Royal Azur Thalasso",
      location: "Hammamet",
      comment:
        "The hotel was amazing! The staff was incredibly friendly and the facilities were top-notch. The beach access was perfect and the food was delicious. Will definitely come back!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: 2,
      name: "Michael Thompson",
      hotel: "Djerba Aqua Resort",
      location: "Djerba",
      comment:
        "We had a wonderful family vacation at Djerba Aqua Resort. The kids loved the water park and activities, while we enjoyed the spa and restaurants. Perfect for families!",
      rating: 5,
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      hotel: "Dar El Jeld Hotel",
      location: "Tunis",
      comment:
        "The boutique hotel in Tunis exceeded all our expectations. The authentic architecture and design were stunning, and the location made it easy to explore the city. Highly recommend!",
      rating: 4.5,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 font-heading">
            What Our Guests Say
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-neutral-500 sm:mt-4">
            Real experiences from satisfied travelers
          </p>
        </div>

        <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
