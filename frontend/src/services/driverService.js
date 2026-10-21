
import api from "../lib/api";

const driverService = {
  async getProfile() {
    const response = await api.get("/drivers/me");
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch("/drivers/me", profileData);
    return response.data;
  },

  async updateAvailability(isAvailable) {
    const response = await api.patch("/drivers/me/availability", {
      is_available: isAvailable,
    });
    return response.data;
  },

  async getDashboard() {
    const response = await api.get("/drivers/me/dashboard");
    return response.data;
  },

  async getRideRequests(params = {}) {
    const response = await api.get("/drivers/ride-requests", {
      params,
    });
    return response.data;
  },

  async acceptRide(rideId) {
    const response = await api.post(
      `/rides/${encodeURIComponent(rideId)}/accept`
    );
    return response.data;
  },

  async rejectRide(rideId, reason) {
    const response = await api.post(
      `/rides/${encodeURIComponent(rideId)}/reject`,
      reason ? { reason } : {}
    );
    return response.data;
  },
};

export default driverService;
