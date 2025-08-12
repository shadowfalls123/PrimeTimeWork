import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = ({ testimonials }) => {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => {
        const newIndex = prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1;
        return newIndex;
      });
    }, 5000); // Change testimonial every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);
  
  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) => {
      const newIndex = prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1;
      return newIndex;
    });
  };

  const handlePreviousTestimonial = () => {
    setCurrentTestimonialIndex((prevIndex) => {
      const newIndex = prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1;
      return newIndex;
    });
  };

  const currentTestimonial = testimonials[currentTestimonialIndex];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {/* Navigation Buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePreviousTestimonial}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md hover:shadow-lg -ml-4"
        >
          <ChevronLeft size={20} />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextTestimonial}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md hover:shadow-lg -mr-4"
        >
          <ChevronRight size={20} />
        </Button>

        {/* Testimonial Card */}
        <Card className="mx-8 animate-fade-in">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <svg
                className="w-8 h-8 text-sage-400 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
              </svg>
            </div>
            
            <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 italic">
              "{currentTestimonial.quote}"
            </blockquote>
            
            <cite className="text-sage-600 font-medium not-italic">
              — {currentTestimonial.author}
            </cite>
          </CardContent>
        </Card>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonialIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === currentTestimonialIndex
                  ? 'bg-sage-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

Testimonials.propTypes = {
  testimonials: PropTypes.arrayOf(
    PropTypes.shape({
      quote: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default Testimonials;
