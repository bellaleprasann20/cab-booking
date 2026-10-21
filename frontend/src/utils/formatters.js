
import { APP_CONFIG } from "./constants";

const locale = APP_CONFIG.DEFAULT_LOCALE;
const currency = APP_CONFIG.DEFAULT_CURRENCY;

export function formatCurrency(amount, options = {}) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "—";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

export function formatDate(date, options = {}) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(parsedDate);
}

export function formatDateTime(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export function formatTime(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export function formatDistance(distanceKm, options = {}) {
  const distance = Number(distanceKm);

  if (!Number.isFinite(distance) || distance < 0) {
    return "—";
  }

  if (distance < 1) {
    const meters = Math.round(distance * 1000);
    return `${meters} m`;
  }

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: options.maximumFractionDigits ?? 1,
  }).format(distance)} km`;
}

export function formatDuration(minutes) {
  const value = Number(minutes);

  if (!Number.isFinite(value) || value < 0) {
    return "—";
  }

  const totalMinutes = Math.round(value);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

export function formatNumber(value, options = {}) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return new Intl.NumberFormat(locale, options).format(number);
}

export function formatPercentage(value, fractionDigits = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: fractionDigits,
  }).format(number)}%`;
}

export function formatPhoneNumber(phone) {
  if (!phone) return "—";

  return String(phone).trim();
}

export function formatRideStatus(status) {
  if (!status) return "Unknown";

  return String(status)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
