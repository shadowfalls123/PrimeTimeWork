import { RazorpayPayment } from "./razorpay/razorpaypaymentservice.js";
import { PhonePePayment } from "./phonepe/PhonePePaymentService.js";
import { WalletPayment } from "./wallet/WalletPaymentService.js";

class PaymentFactory {
    static createPayment(paymentMethod, userId, amount, paymentData = null) {
      switch (paymentMethod) {
        case "wallet":
          return new WalletPayment(userId, amount);
        case "razorpay":
          return new RazorpayPayment(userId, amount*100, paymentData);
        case "phonepe":
          return new PhonePePayment(userId, amount*100);
        default:
          throw new Error("Invalid payment method");
      }
    }
  }

  export { PaymentFactory };