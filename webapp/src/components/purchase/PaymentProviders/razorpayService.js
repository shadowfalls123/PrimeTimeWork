//import { razorpayCreateOrder } from "../../../services";
import { loadRazorpayScript } from "../../../util/loadRazorpayScript.js"
import logger from "../../../util/logger";
import { addMyCourses, verifyRazorpayPayment } from "../../../services";

export const processRazorpayPayment = async (cartItems, totalPrice, onSuccess, onFailure) => {
    try {

        // Dynamically load Razorpay script
        const isRazorpayLoaded = await loadRazorpayScript();
        // if (!isRazorpayLoaded) {
        //     throw new Error("Failed to load Razorpay SDK.");
        // }
        if (!isRazorpayLoaded) {
            onFailure("Failed to load payment gateway. Please try again.");
            return;
        }
        
        // Step 1: Create an order by calling the backend
        const paymentMethod = "razorpay";
        // const response = await razorpayCreateOrder(amount);
        const response = await addMyCourses(cartItems, paymentMethod, totalPrice);
        logger.log("Razorpay response: ", response);

        // const order = await response;
        const { order, options } = response.data;
        logger.log("Razorpay order: ", order);
        logger.log("Razorpay options: ", options);

        if (!order || !order.id || !options) {
            throw new Error("Invalid Razorpay order response.");
        }

        // Step 2: Add a handler to verify payment after success
        options.handler = async (razorpayResponse) => {
            logger.log("Razorpay Payment Successful: ", razorpayResponse);
            logger.log("Razorpay cartItems: ", cartItems);
            
            try {
                // Step 3: Call backend to verify payment
                const verificationResponse = await verifyRazorpayPayment({
                    order_id: order.id,
                    payment_id: razorpayResponse.razorpay_payment_id,
                    signature: razorpayResponse.razorpay_signature,
                    cartItems: cartItems
                });

                if (verificationResponse.status === 200) {
                    onSuccess(verificationResponse.data);
                } else {
                    onFailure("Payment verification failed. Please contact support.");
                }
            } catch (error) {
                console.error("Error verifying payment: ", error);
                onFailure("Error verifying payment. Please contact support.");
            }
        };

        logger.log("Razorpay Options: ", options);
        
        // Step 4: Handle payment failure
        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", (response) => {
            console.error("Razorpay Payment Failed: ", response);
            onFailure(response.error.description || "Payment failed.");
        });

        razorpay.open();
    } catch (error) {
        console.error("Error initializing Razorpay payment: ", error);
        onFailure("Error initializing Razorpay payment.");
    }
};
