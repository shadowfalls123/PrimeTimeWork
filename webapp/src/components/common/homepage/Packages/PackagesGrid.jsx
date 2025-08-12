import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import { Modal } from "../../../ui/Modal";
import { Badge } from "../../../ui/Badge";
import { ShoppingCart, X } from "lucide-react";
import { RingLoadingIcon } from "../../LoadingIcon";

const PackagesGrid = ({
  packages,
  isLoading,
  isAddedToCart,
  handleAddToCart,
  handleGoToCart,
  handleClose,
  selectedPackage,
  snackbarMessage,
  isSnackbarOpen,
  handleSnackbarClose,
  userCourses,
  handleTitleClick,
}) => {
  return (
    <div className="py-6">
      {/* Snackbar/Toast equivalent */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.length > 0 ? (
            packages.map((pkg, index) => (
              <Card 
                key={pkg.packid} 
                hover 
                className="h-full flex flex-col animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="flex-1 flex flex-col">
                  {/* Title */}
                  <h3
                    onClick={() => handleTitleClick(pkg)}
                    className="text-lg font-semibold text-sage-600 hover:text-sage-700 cursor-pointer underline mb-3 line-clamp-2 min-h-[3.5rem]"
                  >
                    {pkg.packTitle}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-4">
                    {pkg.packDesc}
                  </p>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{pkg.packPrice}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {userCourses.some((course) => course.packid === pkg.packid) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="w-full"
                      >
                        Pack Already Purchased
                      </Button>
                    ) : pkg.isInCart ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleGoToCart}
                        className="w-full"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Go to Cart
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddToCart(pkg)}
                        className="w-full"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Add to Cart
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">Packages not available.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal for Added to Cart */}
      <Modal
        isOpen={isAddedToCart}
        onClose={handleClose}
        title="Added to Cart"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {selectedPackage && selectedPackage.packTitle}
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleGoToCart}>
              Go to Cart
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

PackagesGrid.propTypes = {
  packages: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isAddedToCart: PropTypes.bool.isRequired,
  handleAddToCart: PropTypes.func.isRequired,
  handleGoToCart: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  selectedPackage: PropTypes.object,
  snackbarMessage: PropTypes.string.isRequired,
  isSnackbarOpen: PropTypes.bool.isRequired,
  handleSnackbarClose: PropTypes.func.isRequired,
  userCourses: PropTypes.array.isRequired,
  handleTitleClick: PropTypes.func.isRequired,
};

export default PackagesGrid;
