import fallbackDishImage from "@assets/images/icons/empty-cart-icon.png";
import { getAvatarUrl } from "./urlHelper";

const ABSOLUTE_URL_PATTERN = /^(https?:)?\/\//i;

export const DISH_FALLBACK_IMAGE = fallbackDishImage;

export function getDishImageUrl(path) {
  if (!path) {
    return DISH_FALLBACK_IMAGE;
  }

  if (ABSOLUTE_URL_PATTERN.test(path) || path.startsWith("data:")) {
    return path;
  }

  return getAvatarUrl(path) || DISH_FALLBACK_IMAGE;
}

export function handleDishImageError(event) {
  const target = event?.currentTarget;

  if (!target || target.dataset.fallbackApplied === "true") {
    return;
  }

  target.dataset.fallbackApplied = "true";
  target.src = DISH_FALLBACK_IMAGE;
}
