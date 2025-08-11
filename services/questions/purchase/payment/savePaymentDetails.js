import { TABLE_NAMES } from "../../utils/environment";
import { AWSClients } from "../../../common";

// Utilize the DynamoDB Document Client
const dynamoDBExam = AWSClients.dynamoDB();

export const savePaymentDetails = async (paymentDetails, userId, cartItems, razorpaySignature) => {
  try {
    console.log("Inside savePaymentDetails userId", userId);
    console.log("Inside savePaymentDetails cartItems", cartItems);
    console.log("Inside savePaymentDetails paymentDetails", paymentDetails);  
    const params = {
      TableName: TABLE_NAMES.paymentHistoryTable,
      Item: {
        paymentid: paymentDetails.id,             // Razorpay payment ID
        orderid: paymentDetails.order_id,        // Order ID
        userid: userId,                           // Buyer ID
        amount: paymentDetails.amount,           // Amount paid
        currency: paymentDetails.currency,       // INR, USD, etc.
        status: paymentDetails.status,           // captured, failed, etc.
        paymentmethod: paymentDetails.method,    // upi, card, wallet, etc.
        upitransactionid: paymentDetails.acquirer_data?.upi_transaction_id || null, // UPI txn ID
        bankreference: paymentDetails.acquirer_data?.rrn || null,  // Bank reference
        email: paymentDetails.email,             // Customer email
        contact: paymentDetails.contact,         // Customer phone number
        fee: paymentDetails.fee,                 // Razorpay fee
        tax: paymentDetails.tax,                 // Tax applied
        amountrefunded: paymentDetails.amount_refunded,  // Refund status
        refundstatus: paymentDetails.refund_status || null, 
        paymentdescription: paymentDetails.description || null,
        custemail: paymentDetails.email || null,
        custcontact: paymentDetails.contact || null,
        createdat: new Date(paymentDetails.created_at * 1000).toISOString(), // Payment timestamp
        cartitems: cartItems || [], // Store purchased items
        razorpaysignature: razorpaySignature || null, // Signature for verification
        errordetails: paymentDetails.error_description || null // Error (if any)
      },
    };

    console.log("Saving payment details:", params);

    await dynamoDBExam.put(params).promise();
    return { success: true, message: "Payment details saved successfully." };
  } catch (error) {
    console.error("Error saving payment details:", error);
    return { success: false, message: "Error saving payment details.", error };
  }
};