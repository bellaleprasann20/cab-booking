
import api from "../lib/api";

const walletService = {
  async getWallet() {
    const response = await api.get("/wallet");
    return response.data;
  },

  async getTransactions(params = {}) {
    const response = await api.get("/wallet/transactions", {
      params,
    });
    return response.data;
  },

  async getTransactionById(transactionId) {
    const response = await api.get(
      `/wallet/transactions/${encodeURIComponent(transactionId)}`
    );
    return response.data;
  },

  async addFunds(paymentData) {
    const response = await api.post(
      "/wallet/add-funds",
      paymentData
    );
    return response.data;
  },

  async payWithWallet(paymentData) {
    const response = await api.post(
      "/wallet/pay",
      paymentData
    );
    return response.data;
  },
};

export default walletService;
