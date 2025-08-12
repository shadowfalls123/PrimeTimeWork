import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/Card";
import { useAuth } from "../Auth/AuthContext";
import Testimonials from "./Testimonials";
import ExamPackages from "./Packages/ExamPackages";
import imageUrl from "../../../srcimages/welcomepageimage.jpg";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [badgeContent, setBadgeContent] = useState(0);

  const handleLogin = () => {
    navigate("/login");
  };

  const updateBadgeContent = (count) => {
    setBadgeContent((prev) => Math.max(0, prev + count));
    console.log(badgeContent);
  };

  const testimonialsData = [
    {
      id: 1,
      quote:
        "The mock exams provided by PrimeTime were a game-changer for my preparation. The realistic format and diverse question bank perfectly simulated the actual exam, boosting my confidence and performance. Highly recommended!",
      author: "Yash, Class 12, Pune",
    },
    {
      id: 2,
      quote:
        "I can not thank PrimeTime enough for their comprehensive mock exams. The detailed feedback and analysis helped me identify my weak areas and work on them effectively. A must-have tool for any student aiming for success!",
      author: "Saarthak, Class 7, Pune, India",
    },
    {
      id: 3,
      quote:
        "I highly recommend PrimeTime to all students gearing up for exams. The mock exams offered were spot-on in mirroring the actual test, and the detailed explanations helps understanding concepts better. It made exam preparation seamless and effective!",
      author: "Navin, IITM, Chicago, USA",
    },
  ];

  const features = [
    {
      title: "Comprehensive Mock Exams",
      description: "Realistic exams designed to mirror actual test conditions.",
    },
    {
      title: "Detailed Feedback",
      description: "Analyze your performance and focus on improvement areas.",
    },
    {
      title: "User-Friendly Platform",
      description: "Easy-to-use platform designed for stress-free learning.",
    },
    {
      title: "Engaging Experience",
      description: "Make exam preparation enjoyable and effective.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container-padding content-max-width py-12 lg:py-20">
        <Card className="overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <CardContent className="flex-1 p-8 lg:p-12">
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
                Welcome to PrimeTime - Your Ultimate Exam Companion!
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Whether you're a beginner or an experienced student, PrimeTime offers a comprehensive
                range of mock exams and tools tailored to help you excel. We specialize in providing realistic
                exam simulations, detailed feedback, and insights to boost your confidence and performance.
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleLogin}
                className="animate-fade-in"
              >
                Explore Now
              </Button>
            </CardContent>
            <div className="flex-1 lg:max-w-md">
              <img
                src={imageUrl}
                alt="Welcome to PrimeTime"
                className="w-full h-64 lg:h-full object-cover"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Features Section */}
      <section className="bg-sage-50 section-padding">
        <div className="container-padding content-max-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose PrimeTime?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what makes our platform the perfect choice for your exam preparation journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                hover 
                className="h-full animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      {user && (
        <section className="section-padding">
          <div className="container-padding content-max-width">
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Here are our top packages for you!
              </h2>
              <p className="text-lg text-gray-600">
                Carefully curated exam packages to help you succeed.
              </p>
            </div>
            <ExamPackages updateBadgeContent={updateBadgeContent} />
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="bg-wood-50 section-padding">
        <div className="container-padding content-max-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600">
              Real feedback from students who achieved success with PrimeTime.
            </p>
          </div>
          <Testimonials testimonials={testimonialsData} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-sage-600 section-padding">
        <div className="container-padding content-max-width text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Begin Your Success Journey?
          </h2>
          <p className="text-lg text-sage-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have transformed their exam preparation with PrimeTime.
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            onClick={() => navigate("/login")}
            className="animate-scale-in"
          >
            Sign Up Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
