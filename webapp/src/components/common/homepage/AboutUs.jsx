import React from "react";
import { Target, Users, TrendingUp, Award, CheckCircle, Heart } from "lucide-react";
import { Card, CardContent } from "../../ui/Card";
import { Badge } from "../../ui/Badge";

const AboutUs = () => {
  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Exclusive Mock Exam Focus",
      description: "We believe in the power of practice. Our sole focus on mock exams ensures that you get the most realistic and effective preparation experience."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Data-Driven Insights",
      description: "With detailed performance analysis, our platform helps you pinpoint strengths and work on areas that need improvement."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "User-Centric Experience",
      description: "We are committed to making exam preparation stress-free, efficient, and enjoyable."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Students Helped" },
    { number: "500+", label: "Mock Exams" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sage-50 to-wood-50 section-padding">
        <div className="container-padding content-max-width text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-sage-500 rounded-2xl">
              <Award className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Experience Success Like Never Before
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Unlock Your Potential with <strong className="text-sage-600">PrimeTime</strong>! 
            Your dedicated partner in conquering exams and certifications.
          </p>
          <Badge variant="success" size="lg" className="text-base px-6 py-2">
            Transforming Exam Preparation Since Day One
          </Badge>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding">
        <div className="container-padding content-max-width">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Welcome to <strong className="text-sage-600">PrimeTime</strong>, your dedicated partner in conquering exams and certifications. Our mission is simple yet powerful: to transform exam preparation into a structured, engaging, and confidence-boosting journey.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Specializing in high-quality mock exams, we provide a platform that empowers individuals to test their knowledge, identify areas for improvement, and step into their exams with unwavering confidence.
              </p>
            </div>
            <Card className="bg-sage-50 border-sage-200">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-8 w-8 text-sage-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Why Choose Us?</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  At PrimeTime, we understand the importance of practice and precision. Our platform is meticulously designed to simulate real exam conditions, giving you an authentic preparation experience with personalized feedback and insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-sage-600 section-padding">
        <div className="container-padding content-max-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-sage-100 text-lg">Numbers that speak for our commitment to your success</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-sage-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-padding content-max-width">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Sets Us Apart?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the unique features that make PrimeTime the preferred choice for exam preparation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                hover 
                className="text-center h-full animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-8">
                  <div className="p-4 bg-sage-100 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center text-sage-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-wood-50 section-padding">
        <div className="container-padding content-max-width">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-wood-400 rounded-full">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              To be the ultimate resource for anyone striving to excel in their exams, providing unparalleled tools and support that make the path to success not only achievable but enjoyable.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-5 w-5 text-wood-600" />
              <span className="text-wood-700 font-medium">Excellence in Education</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="section-padding">
        <div className="container-padding content-max-width">
          <Card className="bg-gradient-to-r from-sage-500 to-wood-500 border-0">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Join Us on the Journey to Success
              </h2>
              <p className="text-xl text-sage-100 mb-8 max-w-2xl mx-auto">
                PrimeTime is here to redefine how you prepare for exams. With a focus on innovation and excellence, we are committed to being your trusted partner, every step of the way.
              </p>
              <p className="text-sage-100 leading-relaxed">
                Have questions or feedback? We'd love to hear from you! Your input helps us grow and serve you better. Thank you for choosing PrimeTime—we look forward to helping you achieve your goals.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;