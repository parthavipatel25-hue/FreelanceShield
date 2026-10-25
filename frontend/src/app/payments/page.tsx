"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Contract {
  id?: number;
  contract_id?: number;
  project_id: number;
  project_title: string;
  amount: number | string;
  currency?: string;
  status: string;
}

export default function PaymentsPage() {
  const router = useRouter();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractId, setContractId] = useState("");
  const [message, setMessage] = useState("");
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function loadContracts() {
      setLoadingContracts(true);
      setMessage("");

      const requestedContractId = new URLSearchParams(
        window.location.search
      ).get("contractId");

      try {
        const userData = localStorage.getItem("user");

        if (!userData) {
          setMessage("Please log in before continuing.");
          router.push("/login");
          return;
        }

        const user = JSON.parse(userData);
        const userId = user.id;
        const token =
          user.token ||
          user.accessToken ||
          localStorage.getItem("token");

        if (!userId || !token) {
          setMessage("Your login details are missing. Please log in again.");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/contracts/client/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.message || "Unable to load your contracts.");
          return;
        }

        const receivedContracts: Contract[] = Array.isArray(data)
          ? data
          : Array.isArray(data.contracts)
            ? data.contracts
            : [];

        const activeContracts = receivedContracts.filter(
          (contract) => contract.status === "active"
        );

        setContracts(activeContracts);

        if (requestedContractId) {
          const matchingContract = activeContracts.find((contract) => {
            const id = contract.contract_id ?? contract.id;
            return id != null && String(id) === requestedContractId;
          });

          if (matchingContract) {
            const id =
              matchingContract.contract_id ?? matchingContract.id;
            setContractId(String(id));
          } else {
            setContractId("");
            setMessage(
              "The selected contract was not found among your active contracts. Please refresh your contracts and try again."
            );
          }
        } else {
          setContractId("");
        }
      } catch (error) {
        console.error("Load contracts error:", error);
        setMessage(
          "Could not load contracts. Check the backend connection and contract endpoint."
        );
      } finally {
        setLoadingContracts(false);
      }
    }

    loadContracts();
  }, [router]);

  const selectedContract = contracts.find((contract) => {
    const id = contract.contract_id ?? contract.id;
    return id != null && String(id) === contractId;
  });

  const formattedAmount = selectedContract
    ? Number(selectedContract.amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "";

  async function handlePayment() {
    setMessage("");

    if (!selectedContract) {
      setMessage("Please select a project.");
      return;
    }

    const selectedId =
      selectedContract.contract_id ?? selectedContract.id;

    if (!selectedId) {
      setMessage("The selected contract has no valid ID.");
      return;
    }

    const userData = localStorage.getItem("user");

    if (!userData) {
      setMessage("Please log in before continuing.");
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);
      const token =
        user.token ||
        user.accessToken ||
        localStorage.getItem("token");

      if (!token) {
        setMessage("Your login token was not found. Please log in again.");
        return;
      }

      setPaying(true);

      const response = await fetch(
        "http://localhost:5000/api/payments/demo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            contractId: Number(selectedId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Demo payment failed. Please try again."
        );
        return;
      }

      setMessage(
        data.message ||
          `Demo payment successful for ${selectedContract.project_title}. No real money was charged.`
      );

      // Remove the paid contract from the available payment options.
      setContracts((previousContracts) =>
        previousContracts.filter((contract) => {
          const id = contract.contract_id ?? contract.id;
          return String(id) !== String(selectedId);
        })
      );

      setContractId("");
    } catch (error) {
      console.error("Demo payment error:", error);
      setMessage(
        "Could not connect to the backend. Check that it is running."
      );
    } finally {
      setPaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-800">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
        >
          <span aria-hidden="true">←</span>
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-emerald-700">
          Payments
        </h1>

        <p className="mt-2 text-slate-600">
          Manage project payments securely through FreelanceShield.
        </p>

        <div className="mt-8 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Make a payment</h2>

          <label
            htmlFor="contractId"
            className="mt-6 block text-sm font-medium"
          >
            Select Project
          </label>

          <select
            id="contractId"
            value={contractId}
            onChange={(event) => {
              setContractId(event.target.value);
              setMessage("");
            }}
            disabled={
              loadingContracts ||
              contracts.length === 0 ||
              paying
            }
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">
              {loadingContracts
                ? "Loading projects..."
                : contracts.length === 0
                  ? "No active projects available"
                  : "Choose a project"}
            </option>

            {contracts.map((contract) => {
              const id = contract.contract_id ?? contract.id;

              if (id == null) return null;

              return (
                <option key={id} value={String(id)}>
                  {contract.project_title}
                </option>
              );
            })}
          </select>

          <label
            htmlFor="amount"
            className="mt-4 block text-sm font-medium"
          >
            Amount (INR)
          </label>

          <input
            id="amount"
            type="text"
            value={formattedAmount ? `₹${formattedAmount}` : ""}
            readOnly
            placeholder="Select a project to view its amount"
            className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-700 outline-none"
          />

          <button
            type="button"
            onClick={handlePayment}
            disabled={
              !selectedContract ||
              paying ||
              loadingContracts
            }
            className="mt-6 w-full rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {paying ? "Processing..." : "Pay Now"}
          </button>

          {message && (
            <p
              role="status"
              className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {message}
            </p>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Payment Successful!
          </p>
        </div>
      </div>
    </main>
  );
}
