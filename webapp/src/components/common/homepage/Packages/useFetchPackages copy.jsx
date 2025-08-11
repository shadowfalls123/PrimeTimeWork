import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTopRatedPackages, getMyCoursesForUser, searchPack } from "../../../../services";
import { addToCart } from "../../../../store";
import { encryptData, decryptData } from "../../../../util/cryptoUtils";

const CACHE_KEY_USER_COURSES = 'userCoursesData';
const CACHE_KEY_PACKAGES = 'packagesData';
const CACHE_EXPIRY_KEY_USER_COURSES = 'userCoursesDataExpiry';
const CACHE_EXPIRY_KEY_PACKAGES = 'packagesDataExpiry';

const CACHE_EXPIRY_TIME = 3600000; // 1 hour in milliseconds

const useFetchPackages = (searchText) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const [packages, setPackagesState] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [userCourses, setUserCoursesState] = useState([]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log("CME_Message - Loading data from server!!");
      
      // Fetch user courses
      const userCoursesResponse = await getMyCoursesForUser();
      const userCoursesData = userCoursesResponse?.data?.packageDetails || []; // Default to empty array
      setUserCoursesState(userCoursesData);

      // Cache user courses
      localStorage.setItem(CACHE_KEY_USER_COURSES, encryptData(userCoursesData));
      localStorage.setItem(CACHE_EXPIRY_KEY_USER_COURSES, Date.now());

      // Fetch packages
      const packagesResponse = searchText ? await searchPack(searchText) : await getTopRatedPackages();
      const packagesData = packagesResponse;

      // Update packages with purchase and cart status
      const updatedPackages = packagesData.map((pkg) => {
        const isPurchased = (userCoursesData ?? []).some(course => course.packid === pkg.packid);
        const isInCart = (cartItems ?? []).some(item => item.itemId === pkg.packid);
        return { ...pkg, isPurchased, isInCart };
      });

      setPackagesState(updatedPackages);

      // Cache packages (only if not searching)
      if (!searchText) {
        localStorage.setItem(CACHE_KEY_PACKAGES, encryptData(updatedPackages));
        localStorage.setItem(CACHE_EXPIRY_KEY_PACKAGES, Date.now());
      }
    } catch (err) {
      console.error(err);
      setSnackbarMessage("Failed to fetch data");
      setIsSnackbarOpen(true);
    }
    setIsLoading(false);
  };

  const isCacheValid = (expiryKey) => {
    const cachedTime = localStorage.getItem(expiryKey);
    if (!cachedTime) return false;
    return (Date.now() - cachedTime) < CACHE_EXPIRY_TIME;
  };

  useEffect(() => {
    if (searchText) {
      // Always fetch fresh data for searches
      fetchData();
    } else if (isCacheValid(CACHE_EXPIRY_KEY_USER_COURSES) && isCacheValid(CACHE_EXPIRY_KEY_PACKAGES)) {
      const cachedUserCourses = localStorage.getItem(CACHE_KEY_USER_COURSES);
      const cachedPackages = localStorage.getItem(CACHE_KEY_PACKAGES);
      if (cachedUserCourses && cachedPackages) {
        setUserCoursesState(decryptData(cachedUserCourses));
        setPackagesState(decryptData(cachedPackages));
      }
    } else {
      fetchData();
    }
  }, [cartItems, searchText]);

  const handleAddToCart = (pkg) => {
    const price = parseFloat(pkg.packPrice);
    const itemId = pkg.packid;
    const title = pkg.packTitle;
    const itemCat = "package";
    dispatch(addToCart({ title, itemId, itemCat, price }));

    const updatedPackages = packages.map((p) => {
      if (p.packid === pkg.packid) {
        return { ...p, isInCart: true };
      }
      return p;
    });
    setPackagesState(updatedPackages);
  };

  return {
    packages,
    isLoading,
    snackbarMessage,
    isSnackbarOpen,
    handleAddToCart,
    setSnackbarMessage,
    setIsSnackbarOpen,
    userCourses,
  };
};

export default useFetchPackages;
