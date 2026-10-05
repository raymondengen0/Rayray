/**
 * Local data layer for the Rayray app.
 *
 * Everything here is in-memory / mock for now. This file defines the domain
 * interfaces and the create/list functions the screens use. When a real
 * backend exists, replace the function bodies with fetch() calls to your API
 * — the interfaces and call signatures stay the same, so the screens don't
 * need to change.
 *
 * NOTE: data does NOT persist across app restarts (in-memory only). If you
 * want persistence, swap the module-level arrays below for AsyncStorage
 * (expo's @react-native-async-storage/async-storage) behind these same
 * functions.
 */
import { SERVICES, getServiceById } from "./services";
import { MOCK_INVOICES } from "./mockInvoices";
import { getSlotsForDate, getUnavailableSlots, isOpenOn } from "./availability";

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface Service {
  id: string;
  name: string;
  description: string;
  priceRange: string;
  typicalDuration: string;
}

/** A bookable time slot label, e.g. "8:00 AM". Generated from src/data/availability.ts. */
export type TimeSlot = string;

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO date, e.g. "2026-10-07"
  timeSlot: TimeSlot;
  customerName: string;
  phone: string;
  address: string;
  createdAt: string; // ISO timestamp
}

export interface QuoteRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  jobDescription: string;
  photoNote?: string; // free-text note; actual photo upload is future work
  customerName: string;
  phone: string;
  email?: string;
  createdAt: string; // ISO timestamp
}

export type InvoiceStatus = "paid" | "unpaid" | "overdue";

export interface Invoice {
  id: string;
  number: string;
  serviceDescription: string;
  amountCents: number; // Stripe-style minor units
  dueDate: string; // ISO date
  status: InvoiceStatus;
}

// ---------------------------------------------------------------------------
// In-memory storage
// ---------------------------------------------------------------------------

const bookings: Booking[] = [];
const quoteRequests: QuoteRequest[] = [];
// Invoices are served from mock data; copy locally so we could mutate status later.
const invoices: Invoice[] = MOCK_INVOICES.map((i) => ({ ...i }));

let nextId = 1;
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${nextId++}`;
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

/** All services the business offers. Reads from src/data/services.ts. */
export function listServices(): Service[] {
  return SERVICES;
}

/** Find a service by id (helper for screens). */
export function findService(id: string): Service | undefined {
  return getServiceById(id);
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export interface CreateBookingInput {
  serviceId: string;
  date: string;
  timeSlot: TimeSlot;
  customerName: string;
  phone: string;
  address: string;
}

/** Create a booking. Throws if the service id is unknown or the slot isn't available. */
export function createBooking(input: CreateBookingInput): Booking {
  const service = getServiceById(input.serviceId);
  if (!service) {
    throw new Error(`Unknown service id: ${input.serviceId}`);
  }
  const openSlots = getSlotsForDate(input.date);
  if (!isOpenOn(input.date) || !openSlots.includes(input.timeSlot)) {
    throw new Error("That time slot isn't available. Please pick another.");
  }
  const bookedOnDate = bookings.filter((b) => b.date === input.date).map((b) => b.timeSlot);
  const { booked, buffer } = getUnavailableSlots(openSlots, bookedOnDate);
  if (booked.has(input.timeSlot) || buffer.has(input.timeSlot)) {
    throw new Error("That time was just taken or is held as a buffer. Please pick another.");
  }
  const booking: Booking = {
    id: generateId("booking"),
    serviceId: service.id,
    serviceName: service.name,
    date: input.date,
    timeSlot: input.timeSlot,
    customerName: input.customerName,
    phone: input.phone,
    address: input.address,
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  return booking;
}

/** All bookings, newest first. */
export function listBookings(): Booking[] {
  return [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---------------------------------------------------------------------------
// Quote requests
// ---------------------------------------------------------------------------

export interface CreateQuoteInput {
  serviceId: string;
  jobDescription: string;
  photoNote?: string;
  customerName: string;
  phone: string;
  email?: string;
}

/** Create a quote request. Throws if the service id is unknown. */
export function createQuote(input: CreateQuoteInput): QuoteRequest {
  const service = getServiceById(input.serviceId);
  if (!service) {
    throw new Error(`Unknown service id: ${input.serviceId}`);
  }
  const quote: QuoteRequest = {
    id: generateId("quote"),
    serviceId: service.id,
    serviceName: service.name,
    jobDescription: input.jobDescription,
    photoNote: input.photoNote || undefined,
    customerName: input.customerName,
    phone: input.phone,
    email: input.email || undefined,
    createdAt: new Date().toISOString(),
  };
  quoteRequests.push(quote);
  return quote;
}

/** All quote requests, newest first. */
export function listQuotes(): QuoteRequest[] {
  return [...quoteRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---------------------------------------------------------------------------
// Invoices (mock)
// ---------------------------------------------------------------------------

/** All invoices (currently from src/data/mockInvoices.ts). */
export function listInvoices(): Invoice[] {
  return [...invoices];
}

/** Find one invoice by id. */
export function getInvoice(id: string): Invoice | undefined {
  return invoices.find((i) => i.id === id);
}

/** Mark an invoice as paid. Used after a successful Stripe payment. */
export function markInvoicePaid(id: string): void {
  const invoice = invoices.find((i) => i.id === id);
  if (invoice) {
    invoice.status = "paid";
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format minor-unit amounts as a readable string, e.g. 14500 -> "$145.00". */
export function formatAmount(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

/** Human-friendly date label for an ISO date string, e.g. "Mon, Oct 7". */
export function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00"); // noon avoids timezone day-shift
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Human label for a time slot. Slots are already labels (e.g. "8:00 AM"). */
export function timeSlotLabel(slot: TimeSlot): string {
  return slot;
}

/** Next N calendar days as ISO date strings, starting tomorrow. */
export function nextDays(count: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}
