import React, { useState, useEffect } from 'react';
import logger from "../../util/logger";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Star, User, Clock, Target, ArrowLeft, X, Play, RotateCcw } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { getPackCoursesForUser } from "../../services";
import { RingLoadingIcon } from '../common/LoadingIcon';



// Check the environment variable to determine the current environment
const isDevelopment = process.env.REACT_APP_ENV === 'development';

const MyCourses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pack, setPack] = useState();

  const selectedPack = location.state?.selectedPack || null;
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

useEffect(() => {
  if (selectedPack) {
    setPack(selectedPack);
  }
}, [selectedPack]);

  useEffect(() => {
    const fetchData = async () => {
      const cachedMyCourses = localStorage.getItem('cachedMyCourses-----');
      if (cachedMyCourses) {
        setPapers(JSON.parse(cachedMyCourses));
      } else {
        await fetchMyPapers();
      }
    };

    fetchData();
  }, []);

  const fetchMyPapers = async () => {
    setIsLoading(true);
    try {
      logger.log("In MyCourses Webapp 1.0 -> selectedPack is -->> ", selectedPack, pack);
      logger.log("selectedPack.paperid -->> ", selectedPack.selectedPapers);
      const paperIDsString = selectedPack.selectedPapers;

      logger.log("In MyCourses Webapp 1.0 -> paperIDsString is -->> ", ""+paperIDsString);
      const response = await getPackCoursesForUser(selectedPack.selectedPapers);
      logger.log("In MyCourses Webapp 1.1 response -->", response);
      const responseData = response.data.enrichedPaperData;

        if (Array.isArray(responseData)) {
          const transformedArray = responseData.map((item) => ({
            pid: item.pid,
            papertitle: item.papertitle,
            paperdesc: item.paperdesc,
            category: item.category,
            subcategory: item.subcategory,
            subcategorylvl2: item.subcategorylvl2,
            difflvl: item.difflvl,
            qcount: parseInt(item.qcount),
            examtime: parseInt(item.examtime),
            price: parseInt(item.price),
            noofreviews: parseInt(item.noofreviews),
            examtaken: parseInt(item.examtaken),
            prating: parseInt(item.rating),
            sections: item.sections.map((section) => ({
              name: section.name,
              negativeMarks: parseInt(section.negativeMarks),
              marks: parseInt(section.marks),
            })),
            firstname: item.firstname,
            lastname: item.lastname,
            guruname: `${item.firstname} ${item.lastname}`,
            avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg', // Example: Replace with dynamic logic if required
          }));
  
        //#PROD logger.log("transformedArray -->> ", transformedArray);
        setPapers(transformedArray);
         
        // Cache papers data
        if (isDevelopment) {
         localStorage.setItem('cachedMyCourses', JSON.stringify(transformedArray));
        }

      } else {
        // Handle no papers available
        setPapers([]);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage('Failed to fetch Courses');
      setIsSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeExam = (paper) => {
    if (paper.examtaken === 1) {
      // If exam is taken, navigate to reviewexam
//      navigate("/result", { state: { paper } });
      navigate("/reviewans", {
        state: {
          selectedPack,
          paper
        },
      });
    } else {
      // If exam is not taken, navigate to examinstructions
      navigate("/examinstructions", { state: { selectedPack, paper } });
    }
  };

  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
  };

  const getUserColor = (firstName, lastName) => {
    const fullName = firstName.toLowerCase() + lastName.toLowerCase();
    const hash = fullName.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    const colors = ['#8FBC8F', '#d4a574', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444'];
    const index = Math.abs(hash % colors.length);
    return colors[index];
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="container-padding content-max-width py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <BookOpen className="h-8 w-8 text-sage-600" />
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        </div>
        {selectedPack && (
          <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-sage-800 mb-1">
              {selectedPack.packTitle}
            </h2>
            <p className="text-sage-600 text-sm">
              {selectedPack.packDesc}
            </p>
          </div>
        )}
      </div>

      {/* Toast/Snackbar */}
      {isSnackbarOpen && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-center space-x-3">
            <div className="text-red-800">{snackbarMessage}</div>
            <button
              onClick={handleSnackbarClose}
              className="text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <RingLoadingIcon />
        </div>
      ) : (
        <>
          {papers.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-sage-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-sage-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                No Courses Available
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Currently, you have not purchased any exam courses. Enhance your learning journey by acquiring our courses and unlock the path to success.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {papers.map((paper, index) => (
                <Card 
                  key={paper.pid} 
                  hover 
                  className="h-full flex flex-col animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                      {paper.papertitle}
                    </h3>

                    {/* Instructor */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: getUserColor(paper.firstname, paper.lastname) }}
                      >
                        {paper.firstname.charAt(0)}{paper.lastname.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          by {paper.guruname}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">
                      {paper.paperdesc}
                    </p>

                    {/* Course Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{paper.qcount} questions</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{paper.examtime} min</span>
                      </div>
                    </div>

                    {/* Difficulty and Category */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="outline" size="sm">
                        {paper.category}
                      </Badge>
                      <Badge variant="info" size="sm">
                        {paper.difflvl}
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-1">
                        {renderStars(paper.prating)}
                        <span className="text-sm font-medium text-gray-700">
                          {paper.prating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {paper.noofreviews} {paper.noofreviews === 1 ? "rating" : "ratings"}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <Button
                        variant={paper.examtaken === 1 ? "outline" : "primary"}
                        size="sm"
                        onClick={() => handleTakeExam(paper)}
                        className="w-full"
                      >
                        {paper.examtaken === 1 ? (
                          <>
                            <RotateCcw size={16} className="mr-2" />
                            Review Exam
                          </>
                        ) : (
                          <>
                            <Play size={16} className="mr-2" />
                            Take Exam
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Back Button */}
      <div className="mt-8 flex justify-start">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
};

export default MyCourses;
