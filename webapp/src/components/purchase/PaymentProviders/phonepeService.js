// import { phonepeCreateOrder } from "../../../services";
import { addMyCourses } from "../../../services";

export const processPhonePePayment = async (cartItems, totalPrice, onSuccess, onFailure) => {
    try {
        // Prepare payment data
        // const response = await phonepeCreateOrder(amount);
        const paymentMethod = "phonepe";
        const response = await addMyCourses(cartItems, paymentMethod, totalPrice);

        console.log("PhonePe response: ", response);

        const order = await response;

        // PhonePe redirects or opens their UI for payment handling
        const paymentUrl = order.paymentUrl;
        if (paymentUrl) {
            window.location.href = paymentUrl;
        } else {
            throw new Error("Failed to initiate PhonePe payment.");
        }
    } catch (error) {
        console.error("Error initializing PhonePe payment: ", error);
        onFailure("Error initializing PhonePe payment.");
    }
};
