import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Plus, 
  Save, 
  Clock, 
  Users, 
  BookOpen,
  Settings,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { Badge } from "../ui/Badge";

interface ExamFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  difficulty: string;
  duration: number;
  totalQuestions: number;
  price: number;
  instructions: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: { id: string; name: string; }[];
}

const CreateExamNew: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ExamFormData>({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    difficulty: "medium",
    duration: 60,
    totalQuestions: 10,
    price: 0,
    instructions: ""
  });

  const [categories] = useState<Category[]>([
    {
      id: "math",
      name: "Mathematics",
      subcategories: [
        { id: "algebra", name: "Algebra" },
        { id: "geometry", name: "Geometry" },
        { id: "calculus", name: "Calculus" }
      ]
    },
    {
      id: "science",
      name: "Science",
      subcategories: [
        { id: "physics", name: "Physics" },
        { id: "chemistry", name: "Chemistry" },
        { id: "biology", name: "Biology" }
      ]
    },
    {
      id: "language",
      name: "Language Arts",
      subcategories: [
        { id: "english", name: "English" },
        { id: "literature", name: "Literature" },
        { id: "writing", name: "Writing" }
      ]
    }
  ]);

  const [errors, setErrors] = useState<Partial<ExamFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const difficultyOptions = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" }
  ];

  const durationOptions = [
    { value: "30", label: "30 minutes" },
    { value: "45", label: "45 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
    { value: "180", label: "3 hours" }
  ];

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const subcategoryOptions = formData.category 
    ? categories.find(cat => cat.id === formData.category)?.subcategories.map(sub => ({
        value: sub.id,
        label: sub.name
      })) || []
    : [];

  const handleInputChange = (field: keyof ExamFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        subcategory: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ExamFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.subcategory) {
      newErrors.subcategory = "Subcategory is required";
    }

    if (formData.duration < 15) {
      newErrors.duration = "Duration must be at least 15 minutes";
    }

    if (formData.totalQuestions < 1) {
      newErrors.totalQuestions = "Must have at least 1 question";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Here you would typically call your API to create the exam
      console.log("Creating exam with data:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to add questions page or exam list
      navigate("/addquestions", { state: { examData: formData } });
    } catch (error) {
      console.error("Error creating exam:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsLoading(true);
    
    try {
      // Save as draft logic
      console.log("Saving draft:", formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message or navigate
      alert("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-padding content-max-width py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-sage-100 rounded-lg">
            <FileText className="h-6 w-6 text-sage-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
            <p className="text-gray-600">Set up your exam details and configuration</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="info" size="sm">Step 1 of 2</Badge>
          <span className="text-sm text-gray-500">Exam Setup</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Exam Title"
                  placeholder="Enter exam title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  required
                />

                <Textarea
                  label="Description"
                  placeholder="Describe what this exam covers..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  error={errors.description}
                  rows={4}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    options={categoryOptions}
                    value={formData.category}
                    onChange={(value) => handleInputChange('category', value as string)}
                    placeholder="Select category"
                    error={errors.category}
                    required
                  />

                  <Select
                    label="Subcategory"
                    options={subcategoryOptions}
                    value={formData.subcategory}
                    onChange={(value) => handleInputChange('subcategory', value as string)}
                    placeholder="Select subcategory"
                    error={errors.subcategory}
                    disabled={!formData.category}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Exam Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-sage-600" />
                  <h2 className="text-xl font-semibold">Exam Configuration</h2>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Difficulty Level"
                    options={difficultyOptions}
                    value={formData.difficulty}
                    onChange={(value) => handleInputChange('difficulty', value as string)}
                  />

                  <Select
                    label="Duration"
                    options={durationOptions}
                    value={formData.duration.toString()}
                    onChange={(value) => handleInputChange('duration', parseInt(value as string))}
                  />

                  <Input
                    label="Total Questions"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.totalQuestions}
                    onChange={(e) => handleInputChange('totalQuestions', parseInt(e.target.value) || 0)}
                    error={errors.totalQuestions}
                  />
                </div>

                <Input
                  label="Price ($)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  error={errors.price}
                  helperText="Set to 0 for free exam"
                />

                <Textarea
                  label="Instructions"
                  placeholder="Enter exam instructions for students..."
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  rows={3}
                  helperText="These instructions will be shown to students before they start the exam"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Exam Preview</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formData.duration} minutes
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formData.totalQuestions} questions
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 capitalize">
                      {formData.difficulty} level
                    </span>
                  </div>
                  
                  {formData.price > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        ${formData.price.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {formData.category && formData.subcategory && (
                  <div className="pt-3 border-t border-gray-200">
                    <Badge variant="outline" size="sm">
                      {categories.find(c => c.id === formData.category)?.name} - {
                        categories.find(c => c.id === formData.category)
                          ?.subcategories.find(s => s.id === formData.subcategory)?.name
                      }
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-sage-50 border-sage-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-sage-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sage-900 mb-2">Tips for Creating Great Exams</h4>
                    <ul className="text-sm text-sage-700 space-y-1">
                      <li>• Write clear, concise questions</li>
                      <li>• Include detailed explanations</li>
                      <li>• Test difficulty progression</li>
                      <li>• Review before publishing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              loading={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create & Add Questions
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateExamNew;