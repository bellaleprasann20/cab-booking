
import api from "../lib/api";

const paymentService = {
  async createPaymentIntent(paymentData) {
    const response = await api.post(
      "/payments/create-intent",
      paymentData
    );
    return response.data;
  },

  async getPayment(paymentId) {
    const response = await api.get(
      `/payments/${encodeURIComponent(paymentId)}`
    );
    return response.data;
  },

  async getPaymentHistory(params = {}) {
    const response = await api.get("/payments", { params });
    return response.data;
  },

  async verifyPayment(paymentData) {
    const response = await api.post(
      "/payments/verify",
      paymentData
    );
    return response.data;
  },

  async applyPromoCode(promoCode, rideId) {
    const response = await api.post("/promos/validate", {
      code: promoCode,
      ride_id: rideId,
    });
    return response.data;
  },
};

export default paymentService;
