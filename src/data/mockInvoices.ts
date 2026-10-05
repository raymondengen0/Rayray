/**
 * Mock invoice data used by the Invoices tab.
 *
 * These are placeholders so the UI and payment flow can be built and demoed
 * without a backend. When the real backend exists, replace listInvoices() in
 * store.ts with a fetch call to your API and delete this file.
 */
import type { Invoice } from "./store";

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv-001",
    number: "INV-2026-1042",
    serviceDescription: "Furniture Assembly — IKEA PAX wardrobe + MALM dresser",
    amountCents: 14500,
    dueDate: "2026-10-20",
    status: "unpaid",
  },
  {
    id: "inv-002",
    number: "INV-2026-1038",
    serviceDescription: "Minor Plumbing — kitchen faucet replacement",
    amountCents: 12900,
    dueDate: "2026-10-03",
    status: "overdue",
  },
  {
    id: "inv-003",
    number: "INV-2026-1021",
    serviceDescription: "Drywall Repair — patch & paint living room wall",
    amountCents: 21000,
    dueDate: "2026-09-15",
    status: "paid",
  },
];
