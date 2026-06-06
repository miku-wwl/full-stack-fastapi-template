import { useState, useEffect, useCallback } from "react";
import { OpenAPI } from "../../client";

const PAIRS = [
  "USD/EUR", "USD/GBP", "USD/JPY", "USD/CHF", "USD/AUD", "USD/CAD",
  "EUR/GBP", "EUR/JPY", "GBP/JPY", "USD/NZD", "USD/SGD", "USD/HKD",
];

interface RemittanceFormProps {
  className?: string;
}

interface RateLock {
  lock_id: string;
  pair: string;
  rate: number;
  bid: number;
  ask: number;
  fee_percentage: number;
  fee_amount: number;
  expires_at: string;
  valid_seconds: number;
}

async function apiPost(path: string, body: Record<string, unknown>) {
  const base = OpenAPI.BASE ?? "";
  const token = typeof OpenAPI.TOKEN === "function" ? await OpenAPI.TOKEN({} as any) : (OpenAPI.TOKEN ?? "");
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error: ${res.status}`);
  }
  return res.json();
}

function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s+/g, "").toUpperCase();
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(cleaned);
}

export default function RemittanceForm({ className = "" }: RemittanceFormProps) {
  // Form state
  const [pair, setPair] = useState("USD/EUR");
  const [sourceAmount, setSourceAmount] = useState("1000");
  const [recipientName, setRecipientName] = useState("");
  const [recipientIBAN, setRecipientIBAN] = useState("");
  const [purpose, setPurpose] = useState("personal");

  // Rate lock state
  const [lock, setLock] = useState<RateLock | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [locking, setLocking] = useState(false);
  const [lockError, setLockError] = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || !lock) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { setLock(null); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, lock]);

  // Lock rate
  const handleLock = useCallback(async () => {
    const amount = parseFloat(sourceAmount);
    if (!amount || amount < 1 || amount > 100000) {
      setLockError("Amount must be between 1 and 100,000");
      return;
    }
    setLockError("");
    setLocking(true);
    try {
      const query = `pair=${encodeURIComponent(pair)}&source_amount=${amount}`;
      const result = await apiPost(`/api/v1/rates/lock?${query}`, {});
      setLock(result as RateLock);
      setCountdown(result.valid_seconds);
    } catch (e: any) {
      setLockError(e.message || "Failed to lock rate");
    } finally {
      setLocking(false);
    }
  }, [pair, sourceAmount]);

  // Submit remittance
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lock) return;
    if (!validateIBAN(recipientIBAN)) {
      setSubmitResult({ success: false, message: "Invalid IBAN format" });
      return;
    }
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const result = await apiPost("/api/v1/transactions", {
        pair,
        source_amount: parseFloat(sourceAmount),
        recipient_name: recipientName,
        recipient_iban: recipientIBAN,
        purpose,
        locked_rate_id: lock.lock_id,
      });
      setSubmitResult({ success: true, message: `Transaction created: ${result.id?.substring(0, 8)}...` });
      // Reset form
      setRecipientName("");
      setRecipientIBAN("");
      setLock(null);
      setCountdown(0);
    } catch (e: any) {
      setSubmitResult({ success: false, message: e.message || "Failed to create transaction" });
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = !!lock && countdown > 0 && recipientName && recipientIBAN;
  const ibanValid = !recipientIBAN || validateIBAN(recipientIBAN);
  const targetAmount = lock ? ((parseFloat(sourceAmount) - lock.fee_amount) * lock.rate).toFixed(2) : "—";

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Currency Pair + Amount */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Currency Pair
          </label>
          <select
            value={pair}
            onChange={(e) => { setPair(e.target.value); setLock(null); }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {PAIRS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Source Amount
          </label>
          <div className="relative">
            <input
              type="number"
              value={sourceAmount}
              onChange={(e) => { setSourceAmount(e.target.value); setLock(null); }}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 pr-12 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              min="1"
              max="100000"
              step="0.01"
              required
            />
            <span className="absolute right-3 top-2.5 text-sm text-gray-400">
              {pair.split("/")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Rate Lock Section */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        {!lock && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Lock exchange rate before submitting</span>
              <button
                type="button"
                onClick={handleLock}
                disabled={locking}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {locking ? "Locking..." : "Lock Rate"}
              </button>
            </div>
            {lockError && <p className="text-sm text-red-500">{lockError}</p>}
          </div>
        )}

        {lock && countdown > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rate Locked: 1 {pair.split("/")[0]} = {lock.rate.toFixed(6)} {pair.split("/")[1]}
              </span>
              <span className={`text-sm font-mono font-semibold ${countdown <= 10 ? "text-red-500" : "text-green-600"}`}>
                {countdown}s
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Fee: {lock.fee_percentage}% = {lock.fee_amount.toFixed(2)} {pair.split("/")[0]}</span>
              <span>You'll receive: ≈ <strong className="text-gray-800 dark:text-white">{targetAmount} {pair.split("/")[1]}</strong></span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-1000 ${countdown <= 10 ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${(countdown / lock.valid_seconds) * 100}%` }}
              />
            </div>
          </div>
        )}

        {lock && countdown <= 0 && (
          <p className="text-sm text-red-500">Rate lock expired. Please lock again.</p>
        )}
      </div>

      {/* Recipient Details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipient Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g. Jean Dupont"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recipient IBAN <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={recipientIBAN}
            onChange={(e) => setRecipientIBAN(e.target.value)}
            className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm dark:bg-gray-800 dark:text-white focus:ring-2 focus:outline-none ${
              recipientIBAN && !ibanValid
                ? "border-red-400 focus:ring-red-500"
                : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
            }`}
            placeholder="e.g. FR7630001007941234567890185"
            required
          />
          {recipientIBAN && !ibanValid && (
            <p className="text-xs text-red-500 mt-1">Invalid IBAN format</p>
          )}
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose</label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="personal">Personal</option>
          <option value="family_support">Family Support</option>
          <option value="business">Business</option>
          <option value="education">Education</option>
          <option value="travel">Travel</option>
          <option value="medical">Medical</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || submitting}
        className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? "Submitting..." : "Submit Transfer"}
      </button>

      {/* Result feedback */}
      {submitResult && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          submitResult.success
            ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
            : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
        }`}>
          {submitResult.message}
        </div>
      )}
    </form>
  );
}
