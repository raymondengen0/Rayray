import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { colors, styles } from "../theme";
import {
  createBooking,
  formatDate,
  listServices,
  nextDays,
  timeSlotLabel,
  type Booking,
  type Service,
  type TimeSlot,
} from "../data/store";

const TIME_SLOTS: TimeSlot[] = ["morning", "afternoon", "evening"];

type Step = "service" | "schedule" | "details" | "confirmed";

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function BookScreen() {
  const services = listServices();
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  const days = nextDays(7);

  function reset() {
    setStep("service");
    setService(null);
    setDate(null);
    setSlot(null);
    setName("");
    setPhone("");
    setAddress("");
    setBooking(null);
  }

  function submit() {
    if (!service || !date || !slot) return;
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Missing details", "Please enter your name, phone number and address.");
      return;
    }
    try {
      const created = createBooking({
        serviceId: service.id,
        date,
        timeSlot: slot,
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
            {timeSlotLabel(booking.timeSlot).toLowerCase()}.
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
            <Text style={styles.label}>Day</Text>
            <View style={styles.chipRow}>
              {days.map((d) => (
                <Chip
                  key={d}
                  label={formatDate(d)}
                  selected={date === d}
                  onPress={() => setDate(d)}
                />
              ))}
            </View>

            <Text style={styles.label}>Time slot</Text>
            <View style={styles.chipRow}>
              {TIME_SLOTS.map((t) => (
                <Chip
                  key={t}
                  label={timeSlotLabel(t)}
                  selected={slot === t}
                  onPress={() => setSlot(t)}
                />
              ))}
            </View>

            <Pressable
              style={[styles.button, (!date || !slot) && styles.buttonDisabled]}
              disabled={!date || !slot}
              onPress={() => setStep("details")}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setStep("service")}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </Pressable>
          </>
        )}

        {step === "details" && service && date && slot && (
          <>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service</Text>
                <Text style={styles.summaryValue}>{service.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>When</Text>
                <Text style={styles.summaryValue}>
                  {formatDate(date)}, {timeSlotLabel(slot)}
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
