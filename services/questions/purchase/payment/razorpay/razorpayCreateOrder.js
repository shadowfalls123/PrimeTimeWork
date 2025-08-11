import { PAYMENT_CONFIG } from "../../../utils/environment";

// Razorpay createOrder API
export const razorpayCreateOrder = async (request, response) => {
  console.log("Inside createOrder request ", request);
  const requestBody = JSON.parse(request.event.body);
  console.log("Inside createOrder requestBody ", requestBody);
  const paymentData = JSON.parse(requestBody.paymentdata);
  const amount = paymentData.amount;
  console.log("Inside createOrder amount ", amount);

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid payment amount" }),
    };
}

  try {
      const order = await razorpay.orders.create({
          amount: amount, // Amount in paise
          currency: "INR",
          receipt: "receipt_" + Math.random().toString(36).substring(7),
      });
      console.log("Razorpay order created:", order);
       // Construct options object
      const options = {
        key: PAYMENT_CONFIG.razorpay.razorPayKeyId, // Fetch the key from environment variables
        amount: order.amount,
        currency: order.currency,
        name: "ExamsAreFun",
        description: "Course Purchase",
        order_id: order.id,
        prefill: {
          name: paymentData.customerName || "Customer Name",
          email: paymentData.customerEmail || "customer@example.com",
          contact: paymentData.customerContact || "9876543210",
        },
        theme: {
          color: "#3399cc",
        },
      };
      
      return {
        statusCode: 200,
//        body: JSON.stringify(order),
        body: JSON.stringify({ order, options }),
    };
  } catch (error) {
//    console.log("Error creating Razorpay order:", error);
    console.error("Error creating Razorpay order:", {
      message: error.message,
      stack: error.stack,
      raw: error,
  });
  
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create Razorpay order" }),
  };
  }
};