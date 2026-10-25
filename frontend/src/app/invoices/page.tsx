"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/layout/DashboardLayout";
import {
  ArrowLeft,
  FileText,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  Receipt,
} from "lucide-react";

interface Payment {
  id: number;
  contract_id?: number | null;
  project_id?: number | null;
  project_title?: string | null;
  amount: number | string;
  currency?: string;
  status: string;
  payment_method?: string | null;
  transaction_id?: string | null;
  created_at?: string;
  client_name?: string | null;
  freelancer_name?: string | null;
}

type UserRole = "client" | "freelancer" | "admin";

function formatAmount(amount: number | string, currency = "INR") {
  return Number(amount || 0).toLocaleString("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date?: string) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export default function InvoicesPage() {
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [role, setRole] = useState<UserRole>("client");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] =
    useState<Payment | null>(null);

  async function loadInvoices(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const userData = localStorage.getItem("user");

      if (!userData) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(userData);
      const currentRole: UserRole =
        user.role === "freelancer" || user.role === "admin"
          ? user.role
          : "client";

      setRole(currentRole);

      const token =
        user.token ||
        user.accessToken ||
        localStorage.getItem("token");

      if (!token) {
        setError("Your login token was not found. Please log in again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/payments/my-payments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to load payment records.");
        return;
      }

      const receivedPayments: Payment[] = Array.isArray(data)
        ? data
        : Array.isArray(data.payments)
          ? data.payments
          : [];

      // Only successfully recorded payments qualify for an invoice.
      const successfulPayments = receivedPayments.filter(
        (payment) => payment.status?.toLowerCase() === "successful"
      );

      setPayments(successfulPayments);
    } catch (err) {
      console.error("Load invoices error:", err);
      setError(
        "Could not connect to the backend. Check that your backend server is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  function downloadInvoice(payment: Payment) {
    const invoiceNumber = `FS-INV-${String(payment.id).padStart(5, "0")}`;
    const amount = formatAmount(
      payment.amount,
      payment.currency || "INR"
    );
    const paymentMethod =
      payment.payment_method?.toLowerCase() === "demo"
        ? "Demo payment (no real money charged)"
        : payment.payment_method || "Not specified";

    const partyName =
      role === "freelancer"
        ? payment.client_name || "Client"
        : payment.freelancer_name || "Freelancer";

    const invoiceHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(invoiceNumber)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #1e293b;
            max-width: 800px;
            margin: 40px auto;
            padding: 24px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            border-bottom: 2px solid #059669;
            padding-bottom: 20px;
          }
          h1 { color: #047857; margin-bottom: 6px; }
          .muted { color: #64748b; }
          .section { margin-top: 28px; }
          .row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding: 14px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .total {
            font-size: 22px;
            font-weight: bold;
            color: #047857;
          }
          .paid {
            color: #047857;
            background: #d1fae5;
            padding: 8px 14px;
            border-radius: 20px;
            font-weight: bold;
          }
          .note {
            margin-top: 28px;
            padding: 14px;
            background: #f1f5f9;
            border-radius: 8px;
            font-size: 12px;
          }
          @media print {
            body { margin: 0 auto; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>FreelanceShield</h1>
            <div class="muted">PAYMENT INVOICE</div>
          </div>
          <div class="paid">PAID</div>
        </div>

        <div class="section">
          <div class="row">
            <span class="muted">Invoice number</span>
            <strong>${escapeHtml(invoiceNumber)}</strong>
          </div>
          <div class="row">
            <span class="muted">Invoice date</span>
            <strong>${escapeHtml(formatDate(payment.created_at))}</strong>
          </div>
          <div class="row">
            <span class="muted">Project</span>
            <strong>${escapeHtml(payment.project_title || `Project #${payment.project_id ?? "N/A"}`)}</strong>
          </div>
          <div class="row">
            <span class="muted">${role === "freelancer" ? "Client" : "Freelancer"}</span>
            <strong>${escapeHtml(partyName)}</strong>
          </div>
          <div class="row">
            <span class="muted">Contract ID</span>
            <strong>${escapeHtml(payment.contract_id ?? "N/A")}</strong>
          </div>
          <div class="row">
            <span class="muted">Payment method</span>
            <strong>${escapeHtml(paymentMethod)}</strong>
          </div>
          <div class="row">
            <span class="muted">Transaction ID</span>
            <strong>${escapeHtml(payment.transaction_id || "N/A")}</strong>
          </div>
          <div class="row total">
            <span>Total paid</span>
            <span>${escapeHtml(amount)}</span>
          </div>
        </div>

        <div class="note">
          This invoice was generated by FreelanceShield from its payment
          record. Demo payments are simulated and do not represent a real
          transfer of funds.
        </div>

        <button class="no-print" onclick="window.print()"
          style="margin-top:24px;padding:12px 20px;background:#059669;
          color:white;border:0;border-radius:8px;cursor:pointer">
          Print / Save as PDF
        </button>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError(
        "The invoice window was blocked. Allow pop-ups for localhost and try again."
      );
      return;
    }

    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  }

  const totalInvoices = payments.length;

  const totalAmount = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  if (loading) {
    return (
      <DashboardLayout role={role}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-emerald-600" />
            <p className="text-sm text-slate-500">Loading invoices...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="mx-auto max-w-7xl space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <Receipt size={17} />
              Payment Records
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-emerald-700">
              My Invoices
            </h1>

            <p className="mt-2 text-slate-600">
              View and download invoices for your successful project payments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="min-w-36 rounded-2xl bg-emerald-50 px-5 py-4">
              <p className="text-sm text-emerald-700">Total invoices</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">
                {totalInvoices}
              </p>
            </div>

            <div className="min-w-36 rounded-2xl bg-slate-50 px-5 py-4">
              <p className="text-sm text-slate-600">Total amount</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {formatAmount(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Invoice history
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Only successful payments are shown.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadInvoices(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <FileText size={30} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                No invoices yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                An invoice will appear here after a project payment has been
                successfully recorded.
              </p>

              <button
                type="button"
                onClick={() => router.push("/payments")}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                View Payments
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Invoice</th>
                    <th className="px-5 py-4">Project</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        FS-INV-{String(payment.id).padStart(5, "0")}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-800">
                          {payment.project_title ||
                            `Project #${payment.project_id ?? "N/A"}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Contract #{payment.contract_id ?? "N/A"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatDate(payment.created_at)}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {formatAmount(payment.amount, payment.currency || "INR")}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle size={14} />
                          Paid
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPayment(payment);
                            downloadInvoice(payment);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          <Download size={15} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs leading-5 text-slate-500">
          FreelanceShield generates invoice documents from recorded payment
          data. Demo payments are simulated and do not represent real money
          transfers.
        </p>
      </div>
    </DashboardLayout>
  );
}
