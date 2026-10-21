function formatINR(value) {
  if (value == null || value === "") return "—";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getLineItems(breakdown) {
  if (!breakdown) return [];

  if (Array.isArray(breakdown)) {
    return breakdown
      .filter(
        (item) =>
          item &&
          item.label != null &&
          item.amount != null &&
          Number.isFinite(Number(item.amount))
      )
      .map((item, index) => ({
        key: item.id ?? `${item.label}-${index}`,
        label: String(item.label).replaceAll("_", " "),
        amount: item.amount,
      }));
  }

  if (typeof breakdown === "object") {
    return Object.entries(breakdown)
      .filter(
        ([, amount]) =>
          amount !== "" &&
          amount != null &&
          Number.isFinite(Number(amount))
      )
      .map(([label, amount]) => ({
        key: label,
        label: label.replaceAll("_", " "),
        amount,
      }));
  }

  return [];
}

export default function FareSummary({
  fare,
  breakdown,
  title = "Fare summary",
  showBreakdown = true,
  className = "",
}) {
  const lineItems = getLineItems(breakdown);

  return (
    <section
      className={`rounded-2xl border border-white/10 bg-[#0d1523] p-5 sm:p-6 ${className}`}
    >
      <h2 className="text-base font-bold text-white">{title}</h2>

      {showBreakdown && lineItems.length > 0 && (
        <div className="mt-5 space-y-3">
          {lineItems.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 text-sm"
            >
              <span className="capitalize text-slate-400">
                {item.label}
              </span>

              <span className="shrink-0 font-medium text-slate-200">
                {formatINR(item.amount)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
        <div>
          <p className="font-bold text-white">Total fare</p>
          <p className="mt-1 text-xs text-slate-500">
            Final fare provided by the server
          </p>
        </div>

        <p className="text-2xl font-black text-lime-300">
          {formatINR(fare)}
        </p>
      </div>
    </section>
  );
}