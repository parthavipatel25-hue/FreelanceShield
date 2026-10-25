"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  Clock3,
  CheckCircle2,
  CircleDollarSign,
  RefreshCw,
} from "lucide-react";

interface Payment {
  id: number;
  project_id: number;
  amount: number | string;
  currency: string;
  status: "pending" | "successful" | "failed" | "refunded";
  transaction_id?: string | null;
  created_at: string;
}

export default function EarningsPage() {
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function fetchPayments() {
    setLoading(true);
    setError("");

    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      const token =
        user.token ||
        user.accessToken ||
        localStorage.getItem("token");

      if (!token) {
        setError("Your login session has expired. Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/payments/my-payments",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load your earnings."
        );
      }

      const records = Array.isArray(data)
        ? data
        : data.payments || data.data || [];

      setPayments(records);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  const successfulPayments = payments.filter(
    (payment) => payment.status === "successful"
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending"
  );

  const totalEarned = successfulPayments.reduce(
    (total, payment) => total + Number(payment.amount),
    0
  );

  const pendingAmount = pendingPayments.reduce(
    (total, payment) => total + Number(payment.amount),
    0
  );

  const filteredPayments = payments.filter((payment) =>
    filter === "all" ? true : payment.status === filter
  );

  const formatCurrency = (amount: number | string, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));

  const formatDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusStyle: Record<Payment["status"], string> = {
    successful: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-slate-100 text-slate-700",
  };

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-800 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back and refresh buttons */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <button
            type="button"
            onClick={fetchPayments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Heading */}
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Wallet size={27} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">My Earnings</h1>
              <p className="mt-1 text-sm text-slate-500">
                Track your freelance income and payment history.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-emerald-800">
                Total Earned
              </p>
              <CheckCircle2 className="text-emerald-600" size={22} />
            </div>

            <p className="mt-4 text-3xl font-bold text-emerald-800">
              {formatCurrency(totalEarned)}
            </p>

            <p className="mt-2 text-xs text-emerald-700">
              Verified successful payments
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-amber-800">
                Pending Payments
              </p>
              <Clock3 className="text-amber-600" size={22} />
            </div>

            <p className="mt-4 text-3xl font-bold text-amber-800">
              {formatCurrency(pendingAmount)}
            </p>

            <p className="mt-2 text-xs text-amber-700">
              Payments not yet completed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">
                Total Transactions
              </p>
              <CircleDollarSign className="text-slate-500" size={22} />
            </div>

            <p className="mt-4 text-3xl font-bold text-slate-800">
              {payments.length}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              All recorded payment transactions
            </p>
          </div>
        </div>

        {/* Payment history */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Payment History</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review payments associated with your projects.
              </p>
            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
              aria-label="Filter payments by status"
            >
              <option value="all">All Payments</option>
              <option value="successful">Successful</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Loading your earnings...
            </div>
          ) : error ? (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
              <p className="mt-2 text-xs">
                If the payment endpoint is not implemented yet, connect it
                to the backend before testing this page.
              </p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <Wallet
                size={38}
                className="mx-auto text-slate-300"
              />
              <h3 className="mt-4 font-semibold text-slate-700">
                No payments found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Your payment records will appear here when available.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Transaction</th>
                    <th className="px-5 py-4">Project ID</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium">
                        {payment.transaction_id || `PAY-${payment.id}`}
                      </td>

                      <td className="px-5 py-4">
                        #{payment.project_id}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(payment.created_at)}
                      </td>

                      <td className="px-5 py-4 font-semibold">
                        {formatCurrency(
                          payment.amount,
                          payment.currency || "INR"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            statusStyle[payment.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-5 text-xs text-slate-500">
          Earnings are calculated from payment records returned by the
          backend. Pending payments are not included in Total Earned.
        </p>
      </div>
    </main>
  );
}