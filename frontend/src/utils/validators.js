
import { VALIDATION_LIMITS } from "./constants";

export function isRequired(value) {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== null && value !== undefined && value !== "";
}

export function validateName(name) {
  if (!isRequired(name)) {
    return "Name is required.";
  }

  const value = name.trim();

  if (value.length < VALIDATION_LIMITS.NAME_MIN) {
    return `Name must contain at least ${VALIDATION_LIMITS.NAME_MIN} characters.`;
  }

  if (value.length > VALIDATION_LIMITS.NAME_MAX) {
    return `Name cannot exceed ${VALIDATION_LIMITS.NAME_MAX} characters.`;
  }

  return "";
}

export function validateEmail(email) {
  if (!isRequired(email)) {
    return "Email is required.";
  }

  const value = email.trim();

  if (value.length > 254) {
    return "Email address is too long.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(value) ? "" : "Enter a valid email address.";
}

export function validatePhone(phone) {
  if (!isRequired(phone)) {
    return "Phone number is required.";
  }

  // Accepts common Indian formats, including an optional +91 prefix.
  const normalized = phone.replace(/[\s()-]/g, "");
  const phonePattern = /^(?:\+91|91)?[6-9]\d{9}$/;

  return phonePattern.test(normalized)
    ? ""
    : "Enter a valid Indian mobile number.";
}

export function validatePassword(password) {
  if (!isRequired(password)) {
    return "Password is required.";
  }

  if (password.length < VALIDATION_LIMITS.PASSWORD_MIN) {
    return `Password must contain at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters.`;
  }

  if (password.length > 128) {
    return "Password cannot exceed 128 characters.";
  }

  return "";
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!isRequired(confirmPassword)) {
    return "Please confirm your password.";
  }

  return password === confirmPassword
    ? ""
    : "Passwords do not match.";
}

export function validateAddress(address) {
  if (!isRequired(address)) {
    return "Address is required.";
  }

  if (address.trim().length > VALIDATION_LIMITS.ADDRESS_MAX) {
    return `Address cannot exceed ${VALIDATION_LIMITS.ADDRESS_MAX} characters.`;
  }

  return "";
}

export function validatePromoCode(code) {
  if (!isRequired(code)) {
    return "Enter a promo code.";
  }

  const value = code.trim();

  if (value.length > VALIDATION_LIMITS.PROMO_CODE_MAX) {
    return "Promo code is too long.";
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
    return "Promo code contains invalid characters.";
  }

  return "";
}

export function validateRating(rating) {
  const value = Number(rating);

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return "Rating must be between 1 and 5.";
  }

  return "";
}

export function validateReview(review) {
  if (!isRequired(review)) {
    return "Review cannot be empty.";
  }

  if (review.trim().length > VALIDATION_LIMITS.REVIEW_MAX) {
    return `Review cannot exceed ${VALIDATION_LIMITS.REVIEW_MAX} characters.`;
  }

  return "";
}

export function validateCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    latitude === "" ||
    longitude === "" ||
    latitude === null ||
    longitude === null ||
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return "Valid latitude and longitude are required.";
  }

  if (lat < -90 || lat > 90) {
    return "Latitude must be between -90 and 90.";
  }

  if (lng < -180 || lng > 180) {
    return "Longitude must be between -180 and 180.";
  }

  return "";
}
