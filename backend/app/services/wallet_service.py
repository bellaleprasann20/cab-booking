
from decimal import Decimal, ROUND_HALF_UP


def normalize_amount(amount: Decimal | str | int | float) -> Decimal:
    value = Decimal(str(amount))

    if not value.is_finite() or value <= 0:
        raise ValueError("Amount must be a positive finite number.")

    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def calculate_new_balance(
    current_balance: Decimal,
    amount: Decimal,
    operation: str,
) -> Decimal:
    current_balance = Decimal(str(current_balance))
    amount = normalize_amount(amount)

    if operation == "credit":
        return current_balance + amount

    if operation == "debit":
        if current_balance < amount:
            raise ValueError("Insufficient wallet balance.")
        return current_balance - amount

    raise ValueError("Operation must be 'credit' or 'debit'.")
