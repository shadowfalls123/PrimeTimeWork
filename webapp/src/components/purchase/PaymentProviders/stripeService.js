export const processStripePayment = async (elements, CardElement, totalPrice, onSuccess, onFailure) => {
    try {
        const response = await fetch("https://<your-api-gateway-url>/create-stripe-payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ amount: totalPrice }),
        });

        const paymentIntent = await response.json();

        const { error } = await elements.confirmCardPayment(paymentIntent.client_secret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: "Customer Name",
                },
            },
        });

        if (error) {
            console.error("Stripe Payment Failed: ", error);
            onFailure(error.message || "Stripe payment failed.");
        } else {
            logger.log("Stripe Payment Successful");
            onSuccess();
        }
    } catch (error) {
        console.error("Error initializing Stripe payment: ", error);
        onFailure("Error initializing Stripe payment.");
    }
};
