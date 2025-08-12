import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, Package, Filter } from "lucide-react";
import { Button } from "../../../ui/Button";
import { Input } from "../../../ui/Input";
import { Card, CardContent, CardHeader } from "../../../ui/Card";
import { Badge } from "../../../ui/Badge";
import useFetchPackages from "./useFetchPackages";

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  difficulty: string;
  examCount: number;
  duration: string;
  image?: string;
}

interface LocationState {
  searchText?: string;
}

const SearchPackagesNew: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  
  const [inputText, setInputText] = useState(locationState?.searchText || "");
  const [searchText, setSearchText] = useState(locationState?.searchText || "");
  
  const {
    packages,
    isLoading,
    snackbarMessage,
    isSnackbarOpen,
    handleAddToCart,
    setIsSnackbarOpen,
    userCourses,
  } = useFetchPackages(searchText);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputText.trim()) {
      setSearchText(inputText);
      navigate("/searchpack", { state: { searchText: inputText } });
    }
  };

  const handleTitleClick = (pkg: Package) => {
    navigate("/packdtls", { state: { pkg } });
  };

  const handleGoToCart = () => {
    navigate("/cart");
  };

  const renderPackageCard = (pkg: Package) => {
    const isOwned = userCourses?.some((course: any) => course.packid === pkg.id);
    
    return (
      <Card key={pkg.id} className="hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-sage-600 transition-colors"
                onClick={() => handleTitleClick(pkg)}
              >
                {pkg.title}
              </h3>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" size="sm">{pkg.category}</Badge>
                <Badge variant="info" size="sm">{pkg.difficulty}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-sage-600">
                ${pkg.price}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {pkg.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Package size={16} />
                <span>{pkg.examCount} exams</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>⏱️ {pkg.duration}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTitleClick(pkg)}
            >
              View Details
            </Button>
            
            {isOwned ? (
              <Badge variant="success">Owned</Badge>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAddToCart(pkg)}
              >
                <ShoppingCart size={16} className="mr-1" />
                Add to Cart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container-padding content-max-width py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Search Packages
        </h1>
        <p className="text-gray-600">
          Find the perfect exam preparation packages for your learning journey
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-8">
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for packages, topics, or subjects..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                leftIcon={<Search size={20} />}
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
            <Button type="button" variant="outline">
              <Filter size={20} className="mr-2" />
              Filters
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-500"></div>
          <span className="ml-3 text-gray-600">Loading packages...</span>
        </div>
      ) : packages && packages.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Found {packages.length} package{packages.length !== 1 ? 's' : ''}
              {searchText && (
                <span className="text-gray-600 font-normal"> for "{searchText}"</span>
              )}
            </h2>
            <Button variant="outline" onClick={handleGoToCart}>
              <ShoppingCart size={16} className="mr-2" />
              Go to Cart
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(renderPackageCard)}
          </div>
        </>
      ) : searchText ? (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No packages found
          </h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any packages matching "{searchText}". Try adjusting your search terms.
          </p>
          <Button variant="primary" onClick={() => {
            setInputText("");
            setSearchText("");
          }}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Start your search
          </h3>
          <p className="text-gray-600">
            Enter keywords to find exam preparation packages
          </p>
        </div>
      )}

      {/* Snackbar/Toast notification */}
      {isSnackbarOpen && snackbarMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-sage-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <span>{snackbarMessage}</span>
            <button
              onClick={() => setIsSnackbarOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPackagesNew;