
import { PaymentService } from "../PaymentService";
import { PAYMENT_CONFIG } from "../../../utils/environment";
import fetch from "node-fetch";

const crypto = require("crypto");

class PhonePePayment extends PaymentService {
  constructor(userId, amount) {
    super(userId, amount);
  }

  async processPayment() {
    try {
      console.log("[PhonePePayment] processPayment amount ", this.amount);
      console.log("[PhonePePayment] processPayment userId ", this.userId);
      const requestPayload = {
        merchantId: PAYMENT_CONFIG.phonepe.phonepeMerchantId,
        merchantUserId: PAYMENT_CONFIG.phonepe.phonepeMerchantUserId,
        merchantTransactionId: `txn_${Date.now()}`,
        amount: this.amount,
        redirectMode: "POST",
        redirectUrl: "https://www.examsarefun.com/mylearnings",
        callbackUrl: "https://www.examsarefun.com/mylearnings",
        paymentInstrument: { type: "PAY_PAGE" },
      };
      console.log("[PhonePePayment] processPayment requestPayload ", requestPayload);

      const base64Payload = Buffer.from(JSON.stringify(requestPayload)).toString("base64");
      const rawData = base64Payload + "/pg/v1/pay" + PAYMENT_CONFIG.phonepe.phonepeKeySecret;
      const hash = crypto.createHash("sha256").update(rawData).digest("hex");
      const xVerifyHeader = hash + "###" + PAYMENT_CONFIG.phonepe.phonepeKeyIndex;

      const response = await fetch(PAYMENT_CONFIG.phonepe.phonepeUrl + "/pg/v1/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-VERIFY": xVerifyHeader },
        body: JSON.stringify({ request: base64Payload }),
      });
      console.log("[PhonePePayment] processPayment response ", response);

      const orderData = await response.json();
      console.log("[PhonePePayment] processPayment orderData ", orderData);
      if (response.status === 200 && orderData.success) {
        return { statusCode: 200, body: JSON.stringify({ paymentUrl: orderData.data.instrumentResponse.redirectInfo.url }) };
      } else {
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to create PhonePe order" }) };
      }
    } catch (error) {
      console.error("Error creating PhonePe order:", error);
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to create PhonePe order" }) };
    }
  }
}

export { PhonePePayment };