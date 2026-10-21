
export const APP_NAME = "GoCab";

export const APP_CONFIG = {
  DEFAULT_CURRENCY: "INR",
  DEFAULT_LOCALE: "en-IN",
  DEFAULT_COUNTRY: "IN",
  DEFAULT_MAP_CENTER: {
    lat: 12.9716,
    lng: 77.5946,
  },
  DEFAULT_MAP_ZOOM: 13,
  API_TIMEOUT: 20000,
};

export const USER_ROLES = {
  RIDER: "rider",
  DRIVER: "driver",
  ADMIN: "admin",
};

export const RIDE_STATUS = {
  REQUESTED: "requested",
  SEARCHING: "searching",
  ACCEPTED: "accepted",
  DRIVER_ARRIVING: "driver_arriving",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
};

export const RIDE_STATUS_LABELS = {
  [RIDE_STATUS.REQUESTED]: "Ride Requested",
  [RIDE_STATUS.SEARCHING]: "Finding Driver",
  [RIDE_STATUS.ACCEPTED]: "Driver Assigned",
  [RIDE_STATUS.DRIVER_ARRIVING]: "Driver Arriving",
  [RIDE_STATUS.IN_PROGRESS]: "Ride in Progress",
  [RIDE_STATUS.COMPLETED]: "Completed",
  [RIDE_STATUS.CANCELLED]: "Cancelled",
  [RIDE_STATUS.REJECTED]: "Rejected",
};

export const RIDE_TYPES = {
  MINI: "mini",
  SEDAN: "sedan",
  SUV: "suv",
  PREMIUM: "premium",
};

export const RIDE_TYPE_OPTIONS = [
  { value: RIDE_TYPES.MINI, label: "Mini" },
  { value: RIDE_TYPES.SEDAN, label: "Sedan" },
  { value: RIDE_TYPES.SUV, label: "SUV" },
  { value: RIDE_TYPES.PREMIUM, label: "Premium" },
];

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  WALLET: "wallet",
};

export const DRIVER_VERIFICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

export const VALIDATION_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 80,
  PASSWORD_MIN: 8,
  REVIEW_MAX: 1000,
  ADDRESS_MAX: 300,
  PROMO_CODE_MAX: 30,
};

export const STORAGE_KEYS = {
  TOKEN: "access_token",
  USER: "user",
};
