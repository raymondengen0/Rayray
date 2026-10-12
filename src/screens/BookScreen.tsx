import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { colors, styles } from "../theme";
import {
  createBooking,
  findService,
  formatDate,
  getBookedSlots,
  listServices,
  type Booking,
  type Service,
} from "../data/store";
import {
  getSlotsForDate,
  getUnavailableSlots,
  hoursSummary,
  nextOpenDays,
  type UnavailableSlots,
} from "../data/availability";
import AvailabilityGrid, { type SlotSelection } from "./AvailabilityGrid";
import type { TabParamList } from "../tabs";

type Step = "service" | "schedule" | "details" | "confirmed";

const BOOKING_BG = require("../../assets/booking-bg.webp");

// Brighter baby blue, booking section only — the rest of the app keeps #5DADE2.
const BOOK_BLUE = "#8FCDF6";

export default function BookScreen() {
  const route = useRoute<RouteProp<TabParamList, "Book">>();
  const services = listServices();
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [selection, setSelection] = useState<SlotSelection | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookedSlots, setBookedSlots] = useState<Map<string, Set<string>>>(new Map());
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Live booked slots from Supabase, so the grid reflects every visitor's bookings.
  useEffect(() => {
    getBookedSlots().then(setBookedSlots);
  }, []);

  // When launched from a service's detail bubble, preselect that service
  // and jump straight to the schedule step.
  useEffect(() => {
    const id = route.params?.serviceId;
    if (id) {
      const s = findService(id);
      if (s) {
        setService(s);
        setStep("schedule");
      }
    }
  }, [route.params?.serviceId]);

  // Only days we're actually open (Sundays skipped automatically).
  const days = nextOpenDays(7);

  // Slots already taken plus buffer time, so the grid can mark them.
  const unavailable = new Map<string, UnavailableSlots>();
  for (const d of days) {
    const bookedOnDay = [...(bookedSlots.get(d) ?? [])];
    unavailable.set(d, getUnavailableSlots(d, getSlotsForDate(d), bookedOnDay));
  }

  function reset() {
    setStep("service");
    setService(null);
    setSelection(null);
    setName("");
    setPhone("");
    setAddress("");
    setBooking(null);
  }

  async function submit() {
    if (!service || !selection) return;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Missing details", "Please enter your name, phone number and address.");
      setSubmitError("Missing details: please enter your name, phone number and address.");
      return;
    }
    setSubmitError(null);
    try {
      const created = await createBooking({
        serviceId: service.id,
        date: selection.date,
        timeSlot: selection.slot,
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setBooking(created);
      // Reflect the new booking in the grid immediately.
      setBookedSlots((prev) => {
        const next = new Map(prev);
        const set = new Set(next.get(created.date) ?? []);
        set.add(created.timeSlot);
        next.set(created.date, set);
        return next;
      });
      setStep("confirmed");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Couldn't create booking", msg);
      setSubmitError(`Couldn't create booking: ${msg}`);
    }
  }

  // ---- Confirmation screen ----
  if (step === "confirmed" && booking) {
    return (
      <View style={styles.screen}>
        <Image
          source={BOOKING_BG}
          style={bookStyles.backdrop}
          resizeMode="cover"
        />
        <View style={bookStyles.scrim} />
        <View style={styles.centerBox}>
          <Text style={[styles.centerTitle, bookStyles.brightText]}>Booking confirmed</Text>
          <Text style={[styles.centerText, bookStyles.brightText]}>
            Thanks {booking.customerName}! We'll call {booking.phone} to confirm your{" "}
            {booking.serviceName} visit on {formatDate(booking.date)},{" "}
            {booking.timeSlot.toLowerCase()}.
          </Text>
          <Pressable style={styles.secondaryButton} onPress={reset}>
            <Text style={styles.secondaryButtonText}>Book another service</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---- Multi-step booking form ----
  return (
    <View style={styles.screen}>
      <Image
        source={BOOKING_BG}
        style={bookStyles.backdrop}
        resizeMode="cover"
      />
      <View style={bookStyles.scrim} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, bookStyles.brightText]}>Book a Service</Text>
        <Text style={[styles.subtitle, bookStyles.brightText]}>
          {step === "service" && "Step 1 of 3 — choose a service"}
          {step === "schedule" && "Step 2 of 3 — pick a day and time"}
          {step === "details" && "Step 3 of 3 — your details"}
        </Text>

        {step === "service" && (
          <>
            {services.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => {
                  setService(s);
                  setStep("schedule");
                }}
              >
                <View style={styles.card}>
                  <Text style={[styles.cardTitle, bookStyles.brightText]}>{s.name}</Text>
                  <Text style={[styles.cardText, bookStyles.brightText]}>
                    {s.priceRange} · {s.typicalDuration}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {step === "schedule" && (
          <>
            <Text style={[styles.label, bookStyles.brightText]}>Tap an available time to book it</Text>
            <AvailabilityGrid
              days={days}
              unavailable={unavailable}
              selection={selection}
              onSelect={setSelection}
            />

            <Text style={[styles.cardText, { marginTop: 12 }, bookStyles.brightText]}>
              Hours: {hoursSummary()}
            </Text>

            <Pressable
              style={[styles.button, !selection && styles.buttonDisabled]}
              disabled={!selection}
              onPress={() => setStep("details")}
            >
              <Text style={styles.buttonText}>
                {selection
                  ? `Continue — ${formatDate(selection.date)}, ${selection.slot}`
                  : "Pick a time above"}
              </Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setStep("service")}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
          </>
        )}

        {step === "details" && service && selection && (
          <>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, bookStyles.brightText]}>Service</Text>
                <Text style={[styles.summaryValue, bookStyles.brightText]}>{service.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, bookStyles.brightText]}>When</Text>
                <Text style={[styles.summaryValue, bookStyles.brightText]}>
                  {formatDate(selection.date)}, {selection.slot}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, bookStyles.brightText]}>Estimate</Text>
                <Text style={[styles.summaryValue, bookStyles.brightText]}>{service.priceRange}</Text>
              </View>
            </View>

            <Text style={[styles.label, bookStyles.brightText]}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Jane Smith"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={[styles.label, bookStyles.brightText]}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="(306) 555-0100"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={[styles.label, bookStyles.brightText]}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main St, Saskatoon"
              value={address}
              onChangeText={setAddress}
            />

            <Pressable
              style={[
                styles.button,
                (!name.trim() || !phone.trim() || !address.trim()) && styles.buttonDisabled,
              ]}
              onPress={submit}
            >
              <Text style={styles.buttonText}>Confirm booking</Text>
            </Pressable>
            {submitError ? (
              <Text style={{ color: "#dc2626", marginTop: 8, textAlign: "center" }}>{submitError}</Text>
            ) : null}
            <Pressable style={styles.secondaryButton} onPress={() => setStep("schedule")}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const bookStyles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  // Dims the workbench background so the brighter text pops.
  scrim: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  brightText: {
    color: BOOK_BLUE,
  },
});
