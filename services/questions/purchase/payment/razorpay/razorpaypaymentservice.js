import { PaymentService } from "../PaymentService";
import { PAYMENT_CONFIG } from "../../../utils/environment";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: PAYMENT_CONFIG.razorpay.razorPayKeyId, // Replace with your Razorpay Key ID
  key_secret: PAYMENT_CONFIG.razorpay.razorPayKeySecret, // Replace with your Razorpay Secret Key
});

class RazorpayPayment extends PaymentService {
    constructor(userId, amount, paymentData) {
      super(userId, amount);
      this.paymentData = paymentData;
    }
  
    async processPayment() {
      try {
        console.log("[RazorpayPayment] processPayment amount ", this.amount);
        console.log("[RazorpayPayment] processPayment userId ", this.userId);
        const order = await razorpay.orders.create({
          amount: this.amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        });
        console.log("[RazorpayPayment] processPayment order ", order);
  
        return {
          statusCode: 200,
          body: JSON.stringify({ order, options: this.getPaymentOptions(order) }),
        };
      } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to create Razorpay order" }) };
      }
    }
  
    getPaymentOptions(order) {
      return {
        key: PAYMENT_CONFIG.razorpay.razorPayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: "ExamsAreFun",
        description: "Course Purchase",
        order_id: order.id,
        prefill: {
          name: this.paymentData.customerName || "Customer Name",
          email: this.paymentData.customerEmail || "customer@example.com",
          contact: this.paymentData.customerContact || "9876543210",
        },
        theme: { color: "#3399cc" },
      };
    }
  }
  
  export { RazorpayPayment };