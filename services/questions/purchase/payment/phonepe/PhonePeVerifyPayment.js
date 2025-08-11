
import { PAYMENT_CONFIG } from "../../../utils/environment";
import fetch from "node-fetch";

const crypto = require("crypto");

export const VerifyPhonePePayment = async (request, response) => {

    try {
      console.log("[VerifyPhonePePayment] request ", request);
      const { transactionId } = req.body;

      const rawData = `/pg/v1/status/${PAYMENT_CONFIG.phonepe.phonepeMerchantId}/${transactionId}${PAYMENT_CONFIG.phonepe.phonepeKeySecret}`;
      const hash = crypto.createHash("sha256").update(rawData).digest("hex");
      const xVerifyHeader = hash + "###" + PAYMENT_CONFIG.phonepe.phonepeKeyIndex;

      const response = await fetch(
        `${PAYMENT_CONFIG.phonepe.phonepeUrl}/pg/v1/status/${PAYMENT_CONFIG.phonepe.phonepeMerchantId}/${transactionId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json", "X-VERIFY": xVerifyHeader }
        }
      );
  
      const verificationData = await response.json();
      console.log("[PhonePePayment] verifyPayment response: ", verificationData);
  
      if (response.status === 200 && verificationData.success) {
        return { status: "success", data: verificationData };
      } else {
        return { status: "failed", error: "Payment verification failed" };
      }
    } catch (error) {
      console.error("Error verifying PhonePe payment:", error);
      return { status: "failed", error: "Error verifying PhonePe payment" };
    }

}