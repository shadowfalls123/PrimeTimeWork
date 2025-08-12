import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Modal } from "../../ui/Modal";
import { saveContactUsMessage } from "../../../services";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactSuccessDialogOpen, setContactSuccessDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleContactSuccessDialogClose = () => {
    setContactSuccessDialogOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    const msgData = JSON.stringify(formData);
    
    try {
      const response = await saveContactUsMessage(msgData);
      await response;
      setContactSuccessDialogOpen(true);
      setFormData({
        name: "",
        email: "",
        message: "",
      });
      setErrors({});
    } catch (error) {
      console.error(error);
      setErrors({ submit: "Failed to send message. Please try again." });
    }
    setIsLoading(false);
  };

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email us at:",
      value: "kodinghut@gmail.com",
      href: "mailto:kodinghut@gmail.com"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      label: "Call us at:",
      value: "+91 11111 11111",
      href: "tel:+911111111111"
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      label: "Visit us at:",
      value: "123 Education Street, Learning City",
      href: null
    }
  ];

  return (
    <div className="container-padding content-max-width py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-sage-100 rounded-full">
            <MessageSquare className="h-8 w-8 text-sage-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          We'd Love to Hear From You!
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Whether you have questions, feedback, or just want to say hi, we're here to listen. 
          Your thoughts and insights help us grow and improve.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="p-2 bg-sage-100 rounded-lg text-sage-600">
                    {info.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{info.label}</p>
                    {info.href ? (
                      <a 
                        href={info.href}
                        className="text-sage-600 hover:text-sage-700 font-medium transition-colors duration-200"
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-gray-900 font-medium">{info.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Office Hours */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Office Hours</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Monday - Friday</span>
                <span className="font-medium">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Saturday</span>
                <span className="font-medium">10:00 AM - 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sunday</span>
                <span className="font-medium">Closed</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Drop Us a Message</h2>
            <p className="text-gray-600">We'll get back to you within 24 hours</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                placeholder="Enter your full name"
              />

              <Input
                label="Your Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="Enter your email address"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  placeholder="Tell us how we can help you..."
                  className={`block w-full rounded-lg border px-3 py-2 text-base placeholder-gray-400 shadow-sm transition-colors duration-200 focus:outline-none focus:ring-1 resize-none ${
                    errors.message 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-sage-500 focus:ring-sage-500'
                  }`}
                />
                {errors.message && (
                  <p className="text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={contactSuccessDialogOpen}
        onClose={handleContactSuccessDialogClose}
        title="Thank You!"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-gray-600">
              Your message has been successfully sent. We appreciate you reaching out and will respond as soon as possible.
            </p>
          </div>
          <div className="flex justify-center">
            <Button variant="primary" onClick={handleContactSuccessDialogClose}>
              Got it!
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContactUs;
