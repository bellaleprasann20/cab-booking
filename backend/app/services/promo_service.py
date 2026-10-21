
from datetime import datetime, timezone
from decimal import Decimal


def validate_promo(
    promo: dict,
    order_amount: Decimal,
    usage_count: int = 0,
) -> tuple[bool, str]:
    now = datetime.now(timezone.utc)

    if not promo.get("is_active", False):
        return False, "Promo code is inactive."

    starts_at = promo.get("starts_at")
    expires_at = promo.get("expires_at")

    if starts_at and now < starts_at:
        return False, "Promo code is not active yet."

    if expires_at and now >= expires_at:
        return False, "Promo code has expired."

    minimum = Decimal(str(promo.get("minimum_order_amount", 0)))

    if Decimal(str(order_amount)) < minimum:
        return False, "Order amount does not meet the minimum."

    max_uses = promo.get("max_uses")

    if max_uses is not None and usage_count >= max_uses:
        return False, "Promo code usage limit has been reached."

    return True, "Promo code is valid."


def calculate_discount(
    order_amount: Decimal,
    discount_type: str,
    discount_value: Decimal,
    max_discount: Decimal | None = None,
) -> Decimal:
    order_amount = Decimal(str(order_amount))
    discount_value = Decimal(str(discount_value))

    if order_amount < 0 or discount_value < 0:
        raise ValueError("Amounts cannot be negative.")

    if discount_type == "percentage":
        if discount_value > 100:
            raise ValueError("Percentage discount cannot exceed 100%.")
        discount = order_amount * discount_value / Decimal("100")
    elif discount_type == "fixed":
        discount = discount_value
    else:
        raise ValueError("Unsupported discount type.")

    if max_discount is not None:
        discount = min(discount, Decimal(str(max_discount)))

    return min(discount, order_amount).quantize(Decimal("0.01"))
