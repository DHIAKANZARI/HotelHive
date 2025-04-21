import { Testimonial } from "@/types";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  return (
    <div className="bg-neutral-100 rounded-lg p-6">
      <div className="flex text-secondary mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < testimonial.rating ? "fill-current" : ""}`}
          />
        ))}
      </div>
      <p className="text-neutral-600 mb-4">"{testimonial.comment}"</p>
      <div className="flex items-center">
        <img
          className="h-10 w-10 rounded-full mr-4"
          src={testimonial.avatar}
          alt={testimonial.name}
        />
        <div>
          <h4 className="font-medium text-neutral-900">{testimonial.name}</h4>
          <p className="text-neutral-500 text-sm">
            {testimonial.hotel}, {testimonial.location}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
