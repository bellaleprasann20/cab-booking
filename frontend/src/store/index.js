
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import rideReducer from "./rideSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    ride: rideReducer,
  },
});

export default store;
