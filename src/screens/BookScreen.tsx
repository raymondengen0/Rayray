import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { colors, styles } from "../theme";
import {
  createBooking,
  findService,
  formatDate,
  listBookings,
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
    const bookedOnDay = listBookings()
      .filter((b) => b.date === d)
      .map((b) => b.timeSlot);
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

  function submit() {
    if (!service || !selection) return;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Missing details", "Please enter your name, phone number and address.");
      return;
    }
    try {
      const created = createBooking({
        serviceId: service.id,
        date: selection.date,
        timeSlot: selection.slot,
        customerName: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      setBooking(created);
      setStep("confirmed");
    } catch (e) {
      Alert.alert("Couldn't create booking", e instanceof Error ? e.message : "Unknown error");
    }
  }

  // ---- Confirmation screen ----
  if (step === "confirmed" && booking) {
    return (
      <View style={styles.screen}>
        <View style={styles.centerBox}>
          <Text style={styles.centerTitle}>Booking confirmed</Text>
          <Text style={styles.centerText}>
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Book a Service</Text>
        <Text style={styles.subtitle}>
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
                  <Text style={styles.cardTitle}>{s.name}</Text>
                  <Text style={styles.cardText}>
                    {s.priceRange} · {s.typicalDuration}
                  </Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {step === "schedule" && (
          <>
            <Text style={styles.label}>Tap an available time to book it</Text>
            <AvailabilityGrid
              days={days}
              unavailable={unavailable}
              selection={selection}
              onSelect={setSelection}
            />

            <Text style={[styles.cardText, { marginTop: 12 }]}>
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
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryValue}>{service.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>When</Text>
                <Text style={styles.summaryValue}>
                  {formatDate(selection.date)}, {selection.slot}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Estimate</Text>
                <Text style={styles.summaryValue}>{service.priceRange}</Text>
              </View>
            </View>

            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={styles.input}
              placeholder="Jane Smith"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="(306) 555-0100"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Address</Text>
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
              disabled={!name.trim() || !phone.trim() || !address.trim()}
              onPress={submit}
            >
              <Text style={styles.buttonText}>Confirm booking</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setStep("schedule")}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}
