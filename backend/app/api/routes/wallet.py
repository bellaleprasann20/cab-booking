
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import CurrentUser
from app.core.database import get_db
from app.models.wallet import Wallet, WalletTransaction

router = APIRouter()


@router.get("/")
async def get_wallet(
    user: CurrentUser,
    session: AsyncSession = Depends(get_db),
):
    wallet = await session.get(Wallet, user.id)

    if wallet is None:
        wallet = Wallet(
            user_id=user.id,
            balance=Decimal("0.00"),
        )
        session.add(wallet)
        await session.commit()
        await session.refresh(wallet)

    return {
        "user_id": str(wallet.user_id),
        "balance": str(wallet.balance),
        "currency": "INR",
        "updated_at": wallet.updated_at,
    }


@router.get("/transactions")
async def wallet_transactions(
    user: CurrentUser,
    session: AsyncSession = Depends(get_db),
):
    statement = (
        select(WalletTransaction)
        .where(WalletTransaction.user_id == user.id)
        .order_by(WalletTransaction.created_at.desc())
    )

    result = await session.exec(statement)
    transactions = result.all()

    return [
        {
            "id": str(transaction.id),
            "type": transaction.type.value,
            "amount": str(transaction.amount),
            "balance_after": str(transaction.balance_after),
            "ride_id": (
                str(transaction.ride_id)
                if transaction.ride_id
                else None
            ),
            "created_at": transaction.created_at,
        }
        for transaction in transactions
    ]
