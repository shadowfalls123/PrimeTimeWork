import { PaymentFactory } from "./payment/paymentFactory";
import { getPaperPrice } from "../common_functions/getPaperPrice"; 
import { getPackagePrice } from "../common_functions/getPackagePrice";
import { addMyCourse } from "../student/addMyCourse"; 


export const addMyCoursesForUser = async (request, response) => {
  console.log("Inside addMyCoursesForUser request ", request);
  const records = JSON.parse(request.event.body);
  
  if (!records) return { statusCode: 400, body: "No JSON data provided" };
  const cartItemsRecords = records.cartItems;
  const paymentMethod = records.paymentMethod || "wallet"; // Default to wallet
  const paymentData = records.amount || {}; // Additional payment data for Razorpay/PhonePe
  console.log("cartItemsRecords -> ", cartItemsRecords);
  const userId = request.event.requestContext.authorizer.jwt.claims.username;
  
  // Filter packages and papers
  const purchasedpackages = cartItemsRecords.filter((record) => record.itemCat === "package");
  const purchasedpapers = cartItemsRecords.filter((record) => record.itemCat === "paper");

  console.log("Packages:", purchasedpackages);
  console.log("Papers:", purchasedpapers);

  // Get package and paper IDs
  const purchasedpackageIds = purchasedpackages.map((record) => record.itemId);
  const purchasedpaperIds = purchasedpapers.map((record) => record.itemId);

  console.log("Package IDs:", purchasedpackageIds);
  console.log("Paper IDs:", purchasedpaperIds);

  // Calculate total purchase price from request
  const totalPurchasePrice = calculateTotalPrice(cartItemsRecords);
  
  try {
    let totalPaperPriceFromDB = 0;
    let totalPackagePriceFromDB = 0;

    if (purchasedpaperIds.length > 0) {
      totalPaperPriceFromDB = await getPaperPrice(purchasedpaperIds);
      console.log("totalPaperPriceFromDB -->> ", totalPaperPriceFromDB);
      if (!totalPaperPriceFromDB || totalPaperPriceFromDB.error) {
        console.log("Error fetching paper price. Please try again later.");
        return { statusCode: 500, body: "Error fetching paper price. Please try again later." };
      }
    }

    if (purchasedpackageIds.length > 0) {
      totalPackagePriceFromDB = await getPackagePrice(purchasedpackageIds);
      console.log("totalPackagePriceFromDB -->> ", totalPackagePriceFromDB);
      if (!totalPackagePriceFromDB || totalPackagePriceFromDB.error) {
        console.log("Error fetching package price. Please try again later.");
        return { statusCode: 500, body: "Error fetching package price. Please try again later." };
      }
    }

    const totalPriceFromDB = totalPaperPriceFromDB + totalPackagePriceFromDB;
    console.log("totalPriceFromDB = (totalPaperPriceFromDB + totalPackagePriceFromDB) -->> ", totalPriceFromDB);

    // Check if total price matches expected price (prevention against price tampering)
    if (totalPurchasePrice !== totalPriceFromDB) {
      console.log("Suspecting price alteration. Please contact the admin team.");
      return { statusCode: 200, body: "Suspecting price alteration. Please contact the admin team." };
    }
  } catch (err) {
    console.log("Error getting paper/package price:", err);
    return { statusCode: 500, body: "Error getting paper/package price" };
  }

  try {
    console.log("[addMyCoursesForUser] - paymentMethod -->> ", paymentMethod);
    console.log("[addMyCoursesForUser] - userId -->> ", userId);
    console.log("[addMyCoursesForUser] - totalPurchasePrice -->> ", totalPurchasePrice);
    console.log("[addMyCoursesForUser] - paymentData -->> ", paymentData);
    const paymentInstance = PaymentFactory.createPayment(paymentMethod, userId, totalPurchasePrice, paymentData);
    const paymentResponse = await paymentInstance.processPayment();
    console.log("Inside addMyCoursesForUser - paymentResponse ", paymentResponse);

    if (paymentMethod === "wallet") {
      console.log("Inside addMyCoursesForUser - paymentMethod === ", paymentMethod);
      if (paymentResponse.statusCode === 200) {
          // If payment is verified, add courses
          try {
            for (const record of purchasedpackages) {
              console.log(`In addMyCoursesForUser - Processing record-> `, record);
              await addMyCourse(record, userId);
            }
            return { statusCode: 200, body: "Courses added successfully" };
          } catch (error) {
            console.error("Error inserting courses:", error);
            return { statusCode: 500, body: "Error inserting courses into database" };
          }
        } else {
          return { statusCode: 200, body: "Payment failed using wallet" };
        }
    }

    if (paymentMethod === "razorpay") {
      if (paymentResponse.statusCode === 200) {
          return paymentResponse;
        } else {
          return { statusCode: 200, body: "Payment failed" };
        }
    }

    if (paymentMethod === "phonepe") {
      if (paymentResponse.statusCode === 200) {
          return paymentResponse;
        } else {
          return { statusCode: 200, body: "Payment failed" };
        }
    }

    // console.log("Inside addMyCoursesForUser - Storing purchased courses");
    // for (const record of cartItemsRecords) {
    //   try {
    //     console.log(`In addMyCoursesForUser - Processing record -> `, record);
    //     await addMyCourse(record, userId);
    //   } catch (err) {
    //     console.log("Error inserting JSON data into Database:", err);
    //     return { statusCode: 500, body: "Error inserting JSON data into Database" };
    //   }
    // }

    // return { statusCode: 200, body: "Data uploaded successfully" };
  } catch (error) {
    console.error("Error processing payment:", error);
    return { statusCode: 500, body: "Error processing payment" };
  }
};

const calculateTotalPrice = (papers) => {
  return papers.reduce((total, paper) => total + parseFloat(paper.price), 0);
};