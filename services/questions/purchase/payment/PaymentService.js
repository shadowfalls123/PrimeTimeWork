class PaymentService {
    constructor(userId, amount) {
      this.userId = userId;
      this.amount = amount;
    }
    async processPayment() {
      throw new Error("processPayment() must be implemented.");
    }
  }

export { PaymentService };