import { savePaymentDetails } from "../savePaymentDetails";
import { addMyCourse } from "../../../student/addMyCourse";
import { PAYMENT_CONFIG } from "../../../utils/environment";
import Razorpay from "razorpay";

const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: PAYMENT_CONFIG.razorpay.razorPayKeyId, // Replace with your Razorpay Key ID
  key_secret: PAYMENT_CONFIG.razorpay.razorPayKeySecret, // Replace with your Razorpay Secret Key
});

//Verifies the payment by checking the Razorpay signature and payment status.
const verifyPayment = async (paymentId, orderId, razorpaySignature) => {
  try {
    // Step 1: Fetch payment details from Razorpay
    const paymentDetails = await razorpay.payments.fetch(paymentId);
    console.log("[verifyPayment] Payment Details: ", paymentDetails);

    // Step 2: Check if payment is captured
    if (paymentDetails.status !== "captured" || paymentDetails.order_id !== orderId) {
      return { 
        success: false, 
        message: "Payment verification failed (status/order mismatch).",
        paymentDetails // Include payment details for debugging/logging
      };
    }

    // Step 3: Verify the Razorpay signature for security
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", PAYMENT_CONFIG.razorpay.razorPayKeySecret)
      .update(body)
      .digest("hex");

    console.log("[verifyPayment] Expected Signature: ", expectedSignature);
    console.log("[verifyPayment] Razorpay Signature: ", razorpaySignature);

    if (expectedSignature !== razorpaySignature) {
      return { 
        success: false, 
        message: "Signature verification failed.", 
        paymentDetails 
      };
    }

    return { 
      success: true, 
      message: "Payment successful and verified.", 
      paymentDetails // Pass the full payment details in the response
    };
  } catch (error) {
    console.error("[verifyPayment] Error:", error);
    return { success: false, message: "Error verifying payment." };
  }
};

export const confirmRazorpayPayment = async (request, response) => {
  console.log("Inside confirmPayment request", request);
  const paymentDetails = JSON.parse(request.event.body);
  console.log("Inside confirmPayment paymentDetails", paymentDetails);
  const paymentId = paymentDetails.payment_id;
  const orderId = paymentDetails.order_id;
  const cartItems = paymentDetails.cartItems;
  const razorpaySignature = paymentDetails.signature;
  const userId = request.event.requestContext.authorizer.jwt.claims.username;
  console.log("Inside confirmPayment cartItems", cartItems);
  console.log("Inside confirmPayment userId", userId);
  console.log("Inside confirmPayment paymentId", paymentId);
  console.log("Inside confirmPayment orderId", orderId);

  if (!paymentId || !orderId || !razorpaySignature) {
    return { statusCode: 400, body: "Invalid payment details" };
  }

  const verification = await verifyPayment(paymentId, orderId, razorpaySignature);

  if (!verification.success) {
    return { statusCode: 400, body: verification.message };
  }

  // Save payment details after verification
  const saveResponse = await savePaymentDetails(verification.paymentDetails, userId, cartItems, razorpaySignature);
  if (!saveResponse.success) {
    return { statusCode: 500, body: "Error storing payment details" };
  }

  // If payment is verified, add courses
  try {
    for (const record of cartItems) {
      await addMyCourse(record, userId);
    }
    return { statusCode: 200, body: "Courses added successfully" };
  } catch (error) {
    console.error("Error inserting courses:", error);
    return { statusCode: 500, body: "Error inserting courses into database" };
  }
};

