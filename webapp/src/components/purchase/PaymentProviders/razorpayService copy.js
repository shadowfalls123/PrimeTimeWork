//import { razorpayCreateOrder } from "../../../services";
import { loadRazorpayScript } from "../../../util/loadRazorpayScript.js"
import logger from "../../../util/logger";
import { addMyCourses } from "../../../services";

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

        const paymentMethod = "razorpay";
        // const response = await razorpayCreateOrder(amount);
        const response = await addMyCourses(cartItems, paymentMethod, totalPrice);

        // const order = await response;
        const { order, options } = response;

        if (!order || !order.id || !options) {
            throw new Error("Invalid Razorpay order response.");
        }

        // const options = {
        //     key: "rzp_test_II3QxxJYysozxU", // Replace with your Razorpay Key ID
        //     amount: order.amount,
        //     currency: order.currency,
        //     name: "ExamsAreFun",
        //     description: "Course Purchase",
        //     order_id: order.id,
        //     handler: async (response) => {
        //         logger.log("Razorpay Payment Successful: ", response);
        //         onSuccess(response);
        //     },
        //     prefill: {
        //         name: "Customer Name",
        //         email: "customer@example.com",
        //         contact: "9876543210",
        //     },
        //     theme: {
        //         color: "#3399cc",
        //     },
        // };

        logger.log("Razorpay Options: ", options);

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
