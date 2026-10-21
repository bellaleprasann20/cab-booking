
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaCreditCard,
  FaClock,
  FaRotate,
  FaWallet,
  FaPlus,
  FaCircleInfo,
} from "react-icons/fa6";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/+$/, "");

const DEMO_AMOUNTS = [500, 1000, 2000, 5000];

function getErrorMessage(error, fallback) {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || JSON.stringify(item)).join(", ");
  }

  return fallback;
}

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeTransactions(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.transactions)) return data.transactions;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getTransactionType(transaction) {
  return String(
    transaction.type ??
      transaction.transaction_type ??
      transaction.kind ??
      ""
  ).toLowerCase();
}

function isCreditTransaction(transaction) {
  const type = getTransactionType(transaction);

  if (
    ["credit", "deposit", "refund", "top_up", "topup", "money_added"].includes(
      type
    )
  ) {
    return true;
  }

  if (
    ["debit", "withdrawal", "payment", "ride_payment", "money_spent"].includes(
      type
    )
  ) {
    return false;
  }

  return Number(transaction.amount ?? 0) > 0;
}

export default function WalletPage() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [demoBalance, setDemoBalance] = useState(0);
  const [demoTransactions, setDemoTransactions] = useState([]);
  const [topUpMessage, setTopUpMessage] = useState("");
  const [topUpError, setTopUpError] = useState("");

  const loadWallet = useCallback(async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      const [walletResponse, transactionResponse] = await Promise.all([
        axios.get(`${API}/wallet/`, config),
        axios.get(`${API}/wallet/transactions`, config),
      ]);

      setWallet(walletResponse.data?.wallet ?? walletResponse.data);
      setTransactions(normalizeTransactions(transactionResponse.data));
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/signin", { replace: true });
        return;
      }

      setError(
        getErrorMessage(
          err,
          "Could not load your wallet. Check your connection and wallet API."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const realBalance = useMemo(() => {
    const value =
      wallet?.balance ??
      wallet?.available_balance ??
      wallet?.wallet_balance;

    if (value === undefined || value === null) return null;

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }, [wallet]);

  const displayedBalance =
    realBalance === null ? null : realBalance + demoBalance;

  const amountToAdd =
    customAmount.trim() !== "" ? Number(customAmount) : selectedAmount;

  const handleDemoTopUp = () => {
    setTopUpError("");
    setTopUpMessage("");

    if (realBalance === null) {
      setTopUpError("Load your real wallet balance before adding demo funds.");
      return;
    }

    if (
      !Number.isFinite(amountToAdd) ||
      amountToAdd <= 0 ||
      amountToAdd > 10000
    ) {
      setTopUpError("Enter an amount greater than ₹0 and no more than ₹10,000.");
      return;
    }

    const amount = Math.round(amountToAdd * 100) / 100;
    const nextDemoBalance = demoBalance + amount;

    setDemoBalance(nextDemoBalance);

    setDemoTransactions((previous) => [
      {
        id: `demo-${Date.now()}`,
        type: "topup",
        amount,
        balance_after: realBalance + nextDemoBalance,
        created_at: new Date().toISOString(),
        description: "Demo money added",
        demo: true,
      },
      ...previous,
    ]);

    setTopUpMessage(
      `${formatCurrency(amount)} demo funds added to this page's balance.`
    );
    setCustomAmount("");
  };

  const allTransactions = useMemo(
    () => [
      ...demoTransactions,
      ...transactions.map((transaction) => ({
        ...transaction,
        demo: false,
      })),
    ].sort(
      (a, b) =>
        new Date(b.created_at ?? b.timestamp ?? 0).getTime() -
        new Date(a.created_at ?? a.timestamp ?? 0).getTime()
    ),
    [demoTransactions, transactions]
  );

  return (
    <main className="min-h-screen bg-[#080d18] text-white">
      <header className="border-b border-white/10 bg-[#0c1422]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            to="/rider/dashboard"
            className="flex items-center gap-2 text-sm text-slate-300 transition hover:text-lime-300"
          >
            <FaArrowLeft />
            Dashboard
          </Link>

          <Link to="/rider/dashboard" className="text-lg font-black">
            GoCab<span className="text-lime-300">.</span>
          </Link>

          <button
            type="button"
            onClick={loadWallet}
            disabled={loading}
            aria-label="Refresh wallet"
            title="Refresh wallet"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:border-lime-300/40 hover:text-lime-300 disabled:opacity-50"
          >
            <FaRotate className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:py-12">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-300">
            Your finances
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">My wallet</h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage your balance and review transaction activity.
          </p>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={loadWallet}
              disabled={loading}
              className="self-start font-bold underline hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="relative overflow-hidden rounded-3xl border border-lime-300/20 bg-gradient-to-br from-[#1d342c] via-[#12251f] to-[#0d1523] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[30px] border-lime-300/[0.06]" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-slate-950">
                  <FaWallet size={22} />
                </span>
                <div>
                  <p className="font-bold">Available balance</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Real balance + temporary demo funds
                  </p>
                </div>
              </div>

              <div className="mt-9">
                <p className="text-sm text-slate-400">Displayed balance</p>
                <p className="mt-2 break-words text-4xl font-black tracking-tight sm:text-5xl">
                  {loading
                    ? "Loading..."
                    : displayedBalance !== null
                      ? formatCurrency(displayedBalance)
                      : "—"}
                </p>

                <div className="mt-4 space-y-1 text-xs text-slate-400">
                  <p>Real wallet: {realBalance === null ? "—" : formatCurrency(realBalance)}</p>
                  <p>Demo funds: {formatCurrency(demoBalance)}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/rider/book"
                  className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-lime-200"
                >
                  Book a ride <FaArrowRight />
                </Link>
                <button
                  type="button"
                  onClick={loadWallet}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold transition hover:bg-white/5 disabled:opacity-50"
                >
                  <FaRotate className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#0d1523] p-6 sm:p-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300/10 text-xl text-lime-300">
              <FaPlus />
            </span>

            <h2 className="mt-5 text-xl font-bold">Add demo money</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Try adding sample rupees to preview your wallet. This does not
              process a payment or change your server balance.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {DEMO_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amount);
                    setCustomAmount("");
                    setTopUpError("");
                    setTopUpMessage("");
                  }}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${
                    customAmount === "" && selectedAmount === amount
                      ? "border-lime-300 bg-lime-300/10 text-lime-200"
                      : "border-white/10 text-slate-300 hover:border-lime-300/40"
                  }`}
                >
                  ₹{amount.toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            <label
              htmlFor="custom-amount"
              className="mt-5 block text-sm font-semibold text-slate-300"
            >
              Or enter a custom amount (max ₹10,000)
            </label>
            <input
              id="custom-amount"
              type="number"
              min="1"
              max="10000"
              step="0.01"
              value={customAmount}
              onChange={(event) => {
                setCustomAmount(event.target.value);
                setTopUpError("");
                setTopUpMessage("");
              }}
              placeholder="Enter amount in ₹"
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#080d18] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-lime-300"
            />

            {topUpError && (
              <p role="alert" className="mt-3 text-sm text-red-300">
                {topUpError}
              </p>
            )}

            {topUpMessage && (
              <p role="status" className="mt-3 text-sm text-emerald-300">
                {topUpMessage}
              </p>
            )}

            <button
              type="button"
              onClick={handleDemoTopUp}
              disabled={loading || realBalance === null}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FaPlus />
              Add {formatCurrency(amountToAdd)} demo funds
            </button>

            <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <FaCircleInfo className="mt-0.5 shrink-0" />
              Demo funds are temporary and are not real money. Reloading the
              page resets demo funds and demo transactions.
            </p>
          </section>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0d1523]">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h2 className="text-lg font-bold">Recent transactions</h2>
              <p className="mt-1 text-sm text-slate-400">
                Server transactions and temporary demo activity.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {allTransactions.length} transaction(s)
            </span>
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-lime-300" />
              <p className="mt-4 text-sm text-slate-400">
                Loading transactions...
              </p>
            </div>
          ) : allTransactions.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <FaWallet className="mx-auto text-2xl text-slate-400" />
              <h3 className="mt-4 font-bold">No transactions yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Add demo funds above to preview how wallet transactions appear.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.07]">
              {allTransactions.map((transaction, index) => {
                const id =
                  transaction.id ??
                  transaction.transaction_id ??
                  `${transaction.created_at ?? "transaction"}-${index}`;

                const amount = Number(transaction.amount ?? 0);
                const validAmount = Number.isFinite(amount);
                const credit = isCreditTransaction(transaction);
                const date =
                  transaction.created_at ??
                  transaction.timestamp ??
                  transaction.date;

                const description =
                  transaction.description ??
                  transaction.reason ??
                  transaction.type ??
                  "Wallet transaction";

                return (
                  <article
                    key={id}
                    className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center sm:px-7"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          credit
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {credit ? <FaArrowDown /> : <FaArrowUp />}
                      </span>

                      <div className="min-w-0">
                        <p className="break-words font-semibold">
                          {String(description).replaceAll("_", " ")}
                          {transaction.demo && (
                            <span className="ml-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-2 py-1 text-[10px] font-bold uppercase text-lime-200">
                              Demo
                            </span>
                          )}
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <FaClock />
                          {formatDate(date)}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p
                        className={`text-lg font-black ${
                          credit ? "text-emerald-300" : "text-white"
                        }`}
                      >
                        {credit ? "+" : "−"}
                        {validAmount
                          ? formatCurrency(Math.abs(amount))
                          : "—"}
                      </p>

                      {transaction.balance_after != null && (
                        <p className="mt-1 text-xs text-slate-500">
                          Balance: {formatCurrency(transaction.balance_after)}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-slate-500">
          <p>
            <span className="font-black text-white">
              GoCab<span className="text-lime-300">.</span>
            </span>
            <span className="ml-2">Rider Wallet</span>
          </p>

          <Link
            to="/rider/dashboard"
            className="inline-flex items-center gap-2 transition hover:text-lime-300"
          >
            Back to dashboard <FaArrowRight />
          </Link>
        </footer>
      </div>
    </main>
  );
}
