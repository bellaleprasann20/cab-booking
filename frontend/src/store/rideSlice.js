
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentRide: null,
  rides: [],
  fareEstimate: null,
  driverLocation: null,
  loading: false,
  error: null,
};

const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {
    setCurrentRide: (state, action) => {
      state.currentRide = action.payload;
      state.error = null;
    },

    setRides: (state, action) => {
      state.rides = Array.isArray(action.payload)
        ? action.payload
        : action.payload?.items ?? action.payload?.rides ?? [];
    },

    addRide: (state, action) => {
      const ride = action.payload;
      state.rides = [
        ride,
        ...state.rides.filter(
          (item) => (item.id ?? item._id) !== (ride.id ?? ride._id)
        ),
      ];
      state.currentRide = ride;
    },

    updateRide: (state, action) => {
      const updatedRide = action.payload;
      const updatedId = updatedRide.id ?? updatedRide._id;

      if (
        state.currentRide &&
        (state.currentRide.id ?? state.currentRide._id) === updatedId
      ) {
        state.currentRide = {
          ...state.currentRide,
          ...updatedRide,
        };
      }

      state.rides = state.rides.map((ride) =>
        (ride.id ?? ride._id) === updatedId
          ? { ...ride, ...updatedRide }
          : ride
      );
    },

    setFareEstimate: (state, action) => {
      state.fareEstimate = action.payload;
    },

    setDriverLocation: (state, action) => {
      state.driverLocation = action.payload;
    },

    setRideLoading: (state, action) => {
      state.loading = action.payload;
    },

    setRideError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    clearRideError: (state) => {
      state.error = null;
    },

    clearCurrentRide: (state) => {
      state.currentRide = null;
      state.driverLocation = null;
      state.error = null;
    },

    resetRideState: () => initialState,
  },
});

export const {
  setCurrentRide,
  setRides,
  addRide,
  updateRide,
  setFareEstimate,
  setDriverLocation,
  setRideLoading,
  setRideError,
  clearRideError,
  clearCurrentRide,
  resetRideState,
} = rideSlice.actions;

export default rideSlice.reducer;
