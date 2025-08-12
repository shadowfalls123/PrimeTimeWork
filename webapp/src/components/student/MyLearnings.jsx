import React, { useState, useEffect } from "react";
import logger from "../../util/logger";
import { useNavigate } from "react-router-dom";
import { BookOpen, Star, Search, X } from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { getMyLearningPacks } from "../../services";
import { RingLoadingIcon } from "../common/LoadingIcon";

// Check the environment variable to determine the current environment
const isDevelopment = process.env.REACT_APP_ENV === "development";

const MyLearnings = () => {
  const navigate = useNavigate();

  const [packs, setPacks] = useState([]);
  const [trasformedPacks, setTrasformedPacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const cachedMyLearnings = localStorage.getItem("cachedMyLearnings ------");
      if (cachedMyLearnings) {
        setTrasformedPacks(JSON.parse(cachedMyLearnings));
      } else {
        await fetchMyPacks();
      }
    };

    fetchData();
  }, []);

  const fetchMyPacks = async () => {
    setIsLoading(true);
    try {
      //#PROD logger.log("In MyLearnings Webapp 1.0 ->");
      const response = await getMyLearningPacks();
      //#PROD logger.log("In MyLearnings Webapp 1.1 response -->", response);
      const responseData = response.data;
      setPacks(responseData);

      logger.log("In MyLearnings Webapp 1.2 responseData -->", responseData);
      if (Array.isArray(responseData)) {
        const transformedArray = responseData.map((item) => ({
          packid: item.packid,
          packdesc: item.packDesc,
          packtitle: item.packTitle,
          prating: parseInt(4),
          avatarUrl: "https://randomuser.me/api/portraits/men/1.jpg",
          noofreviews: 3,
        }));

        //#PROD logger.log("transformedArray -->> ", transformedArray);
        
        setTrasformedPacks(transformedArray);

        // Cache packs data
        if (isDevelopment) {
          localStorage.setItem(
            "cachedMyLearnings",
            JSON.stringify(transformedArray)
          );
        }
      } else {
        // Handle no packs available
        setTrasformedPacks([]);
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Failed to fetch Courses");
      setIsSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = () => {
    navigate("/searchpack");
  };

  const handleViewSelect = (selectedPack) => {
    logger.log("In MyLearnings Webapp 1.4 selectedPack -->", selectedPack);
    logger.log("In MyLearnings Webapp 1.3 packs -->", packs);
    // Filter packs to get the pack with the same packid
    const filteredPack = packs.filter((pack) => pack.packid === selectedPack.packid);
    logger.log("In MyLearnings Webapp 1.3 filteredPack -->", filteredPack);
    logger.log("In MyLearnings Webapp 1.3 filteredPack[0] -->", filteredPack[0]);
   
    navigate("/mycourses", {
      state: {
        selectedPack: filteredPack[0], // Since filter returns an array, we take the first element
      },
    });

  };

  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learnings</h1>
        <p className="text-gray-600">Track your purchased courses and continue your learning journey</p>
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
          {trasformedPacks.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-sage-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-sage-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Start Your Learning Journey
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                It looks like you haven't purchased any exam courses yet. Don't worry, it's not too late! 
                Our expert-led courses are designed to help you succeed and ace your exams. Get started today and unlock your potential.
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={handleSearchClick}
              >
                <Search className="h-4 w-4 mr-2" />
                Search Packages
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trasformedPacks.map((pack, index) => (
                <Card 
                  key={pack.packid} 
                  hover 
                  className="h-full flex flex-col animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="flex-1 flex flex-col">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                      {pack.packtitle}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-4">
                      {pack.packdesc}
                    </p>

                    {/* Rating */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-1">
                        {renderStars(pack.prating)}
                        <span className="text-sm font-medium text-gray-700">
                          {pack.prating}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {pack.noofreviews} {pack.noofreviews === 1 ? "rating" : "ratings"}
                      </p>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewSelect(pack)}
                        className="w-full"
                      >
                        <BookOpen size={16} className="mr-2" />
                        View Pack
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyLearnings;
