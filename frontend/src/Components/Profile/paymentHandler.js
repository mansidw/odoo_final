import axios from "axios";
import { toast } from "react-toastify";
const API_ENDPOINT = process.env.REACT_APP_BACKEND_URL;

const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};

export const makePayment = async (price, user) => {
  // Check if  user is logged in
  if (!user) {
    toast.error("Sign in to pay", { position: "bottom-center" });
    return;
  }

  const res = await initializeRazorpay();

  if (!res) {
    alert("Razorpay SDK Failed to load");
    return;
  }

  axios
    .post(
      `${API_ENDPOINT}/api/createorder`,
      {
        amount: price,
        currency: "INR",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.data.token}`,
        },
      }
    )
    .then((res) => {
      const data = res.data;
      var options = {
        key: process.env.RAZORPAY_KEY,
        name: "Oddo Kitaab Club Pvt Ltd",
        currency: data.currency,
        amount: data.amount,
        order_id: data.id,
        description: "This is demo payment for course enrollment",
        image: "./logo.png",
        handler: function (response) {
          const paymentDetails = {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            amount: price,
            currency: "INR",
            status: "Success",
          };
        },
        modal: {
          // Cancel payment handeling
          ondismiss: function () {
            toast.error("Payment was cancelled", {
              position: "bottom-center",
            });
          },
        },
        prefill: {
          name: user.data.name,
          email: user.data.email,
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    })
    .catch((error) => {
      console.error(error);
      toast.error(error.message, { position: "bottom-center" });
    });
};
