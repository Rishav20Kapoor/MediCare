import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const VerifyPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const params = new URLSearchParams(location.search || "");
      const razorpayOrderId = params.get("razorpay_order_id");
      const razorpayPaymentId = params.get("razorpay_payment_id");
      const razorpaySignature = params.get("razorpay_signature");

      if (location.pathname === "/appointment/cancel" || location.pathname === "/appointments/cancel") {
        if (!cancelled) {
          navigate("/appointments?payment_status=Cancelled", { replace: true });
        }
        return;
      }

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        if (!cancelled) {
          navigate("/appointments?payment_status=Failed", { replace: true });
        }
        return;
      }

      try {
        const url = new URL(`${API_BASE}/api/appointments/confirm`);
        url.searchParams.set("razorpay_order_id", razorpayOrderId);
        url.searchParams.set("razorpay_payment_id", razorpayPaymentId);
        url.searchParams.set("razorpay_signature", razorpaySignature);

        const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
        const data = await res.json().catch(() => null);

        if (cancelled) return;
        if (res.ok && data?.success) {
          navigate("/appointments?payment_status=Paid", { replace: true });
        } else {
          navigate("/appointments?payment_status=Failed", { replace: true });
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        if (!cancelled) {
          navigate("/appointments?payment_status=Failed", { replace: true });
        }
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [location, navigate]);

  return null;
};

export default VerifyPaymentPage;
