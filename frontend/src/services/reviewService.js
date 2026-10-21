
import api from "../lib/api";

const reviewService = {
  async createReview(reviewData) {
    const response = await api.post("/reviews", reviewData);
    return response.data;
  },

  async getReviews(params = {}) {
    const response = await api.get("/reviews", { params });
    return response.data;
  },

  async getReviewById(reviewId) {
    const response = await api.get(
      `/reviews/${encodeURIComponent(reviewId)}`
    );
    return response.data;
  },

  async updateReview(reviewId, reviewData) {
    const response = await api.patch(
      `/reviews/${encodeURIComponent(reviewId)}`,
      reviewData
    );
    return response.data;
  },

  async deleteReview(reviewId) {
    const response = await api.delete(
      `/reviews/${encodeURIComponent(reviewId)}`
    );
    return response.data;
  },
};

export default reviewService;
