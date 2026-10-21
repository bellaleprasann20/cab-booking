
import api from "../lib/api";

const rideService = {
  async estimateFare(rideData) {
    const response = await api.post("/rides/estimate", rideData);
    return response.data;
  },

  async createRide(rideData) {
    const response = await api.post("/rides", rideData);
    return response.data;
  },

  async getRides(params = {}) {
    const response = await api.get("/rides", { params });
    return response.data;
  },

  async getRideById(rideId) {
    const response = await api.get(
      `/rides/${encodeURIComponent(rideId)}`
    );
    return response.data;
  },

  async cancelRide(rideId, reason) {
    const response = await api.post(
      `/rides/${encodeURIComponent(rideId)}/cancel`,
      reason ? { reason } : {}
    );
    return response.data;
  },

  async getRideStatus(rideId) {
    const response = await api.get(
      `/rides/${encodeURIComponent(rideId)}/status`
    );
    return response.data;
  },
};

export default rideService;
