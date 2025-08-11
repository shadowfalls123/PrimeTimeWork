//This function is not getting used as of now

import { PAYMENT_CONFIG } from "../../../utils/environment";
import fetch from "node-fetch";

const crypto = require("crypto");


// PhonePe createOrder API
export const phonepeCreateOrder = async (request, response) => {
  console.log("[phonepeCreateOrder] request ", request);
  const requestBody = JSON.parse(request.event.body);
  console.log("[phonepeCreateOrder] requestBody ", requestBody);
  const paymentData = JSON.parse(requestBody.paymentdata);
  const amount = paymentData.amount;
  console.log("[phonepeCreateOrder] amount ", amount);

  try {
      // Prepare data for PhonePe order API
      const requestPayload = {
          merchantId: PAYMENT_CONFIG.phonepe.phonepeMerchantId, //"YOUR_PHONEPE_MERCHANT_ID",
          merchantUserId: PAYMENT_CONFIG.phonepe.phonepeMerchantUserId,
          merchantTransactionId: "txn_" + Math.random().toString(36).substring(7),
          amount: amount, // Amount in paise
          redirectMode: "POST",
//          currency: "INR",
          redirectUrl: "https://www.examsarefun.com/mylearnings", // Replace with your redirect URL
          callbackUrl: "https://www.examsarefun.com/mylearnings", // Replace with your callback URL
          paymentInstrument: {
            type: "PAY_PAGE",
          }
      };
      const jsonRequestPayload = JSON.stringify(requestPayload);
      console.log("[phonepeCreateOrder] PhonePe request jsonRequestPayload -->>", jsonRequestPayload);

      const base64Payload = Buffer.from(jsonRequestPayload).toString("base64");
      console.log("[phonepeCreateOrder] base64PayLoad -->> ", base64Payload);
      
      const endpointPath="/pg/v1/pay";
      // Generate X-VERIFY signature
      const rawData = base64Payload + endpointPath + PAYMENT_CONFIG.phonepe.phonepeKeySecret; // Concatenate payload, endpoint, and salt
      console.log("[phonepeCreateOrder] rawData ", rawData);
      const hash = crypto.createHash("sha256").update(rawData).digest("hex"); // Compute SHA-256 hash
      console.log("[phonepeCreateOrder] hash ", hash);
      xVerifyHeader = hash + "###" + PAYMENT_CONFIG.phonepe.phonepeKeyIndex; // Append salt index

      // const xVerifyHeader = generatePhonePeSignature(
      //   base64Payload, 
      //   endpointPath, 
      //   PAYMENT_CONFIG.phonepe.phonepeKeySecret
      // );
      console.log("[phonepeCreateOrder] X-VERIFY header:", xVerifyHeader);

      const apiCallURL =  PAYMENT_CONFIG.phonepe.phonepeUrl+"/pg/v1/pay";
      console.log("PhonePe API call URL:", apiCallURL);

      const options = {
        method: 'POST',
        headers: {
          // accept: 'text/plain',
          'Content-Type' : 'application/json',
          "X-VERIFY": xVerifyHeader, // Pass the generated signature here
          },
 //         body: JSON.stringify(base64Payload),
          body: JSON.stringify({ request: base64Payload }),

        };
      console.log("PhonePe options:", options);

      // // Call PhonePe API for creating the order
      // const orderResponse = await fetch(apiCallURL, {
      //   method: "POST",
      //   headers: {
      //       "Content-Type": "application/json",
      //       "X-VERIFY": xVerifyHeader, // Pass the generated signature here
      //   },
      //   body: base64Payload,
      // });
      const orderResponse = await fetch(apiCallURL, options)
      console.log("PhonePe order response:", orderResponse);

      const orderData = await orderResponse.json(); // Properly parse the response
      console.log("PhonePe order created:", orderData);
      
      // let orderData;
      // try {
      //     orderData = await orderResponse.json();
      // } catch (err) {
      //     orderData = await orderResponse.text(); // Fallback to text if JSON parsing fails
      //     console.log("Non-JSON response from PhonePe:", orderData);
      // }
      // console.log("PhonePe order created:", orderData);

      if (orderResponse.status === 200 && orderData.success) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                paymentUrl: orderData.data.instrumentResponse.redirectInfo.url, // Extract actual payment URL
            }),
        };
    } else {
          throw new Error("Failed to create PhonePe order.");
      }
  } catch (error) {
      console.log("Error creating PhonePe order:", error);
      return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to create PhonePe order." }),
      };
  }
};