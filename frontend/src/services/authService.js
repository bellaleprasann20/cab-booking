
import api from "../lib/api";

const authService = {
  async register(userData) {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch("/auth/me", profileData);
    return response.data;
  },

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },
};

export default authService;
