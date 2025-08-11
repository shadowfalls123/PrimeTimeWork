import { addMyCourses } from "../../../services";
import logger from "../../../util/logger";

export const processWalletPayment = async (cartItems, totalPrice, myCredits) => {
    if (myCredits < totalPrice) {
        return {
            success: false,
            message: "Insufficient credits. Please use another payment method.",
        };
    }

    try {
        logger.log("Processing wallet payment for cart items:", cartItems);
        const paymentMethod = "wallet";
        const response = await addMyCourses(cartItems, paymentMethod, totalPrice);
        logger.log("Response from addMyCourses:", response);
        if (response.status === 200) {
            return { success: true, message: "Wallet payment successful!" };
        }
        return { success: false, message: "Failed to process wallet payment." };
    } catch (error) {
        return { success: false, message: "Error processing wallet payment." };
    }
};
