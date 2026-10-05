import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { styles } from "../theme";
import { createQuote, listServices, type Service } from "../data/store";

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

export default function QuotesScreen() {
  const services = listServices();
  const [service, setService] = useState<Service | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [photoNote, setPhotoNote] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function reset() {
    setService(null);
    setJobDescription("");
    setPhotoNote("");
    setName("");
    setPhone("");
    setEmail("");
    setSubmitted(false);
  }

  function submit() {
    if (!service) {
      Alert.alert("Choose a category", "Please pick a service category first.");
      return;
    }
    if (!jobDescription.trim()) {
      Alert.alert("Describe the job", "Please tell us a little about the work you need.");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing contact info", "Please enter your name and phone number.");
      return;
    }
    try {
      createQuote({
        serviceId: service.id,
        jobDescription: jobDescription.trim(),
        photoNote: photoNote.trim() || undefined,
        customerName: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
      });
      setSubmitted(true);
    } catch (e) {
      Alert.alert("Couldn't send request", e instanceof Error ? e.message : "Unknown error");
    }
  }

  if (submitted && service) {
    return (
      <View style={styles.screen}>
        <View style={styles.centerBox}>
          <Text style={styles.centerTitle}>Quote request sent</Text>
          <Text style={styles.centerText}>
            Thanks {name.trim()}! We'll review your {service.name} request and get back to you at{" "}
            {phone.trim()} with a quote.
          </Text>
          <Pressable style={styles.secondaryButton} onPress={reset}>
            <Text style={styles.secondaryButtonText}>Request another quote</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Request a Quote</Text>
        <Text style={styles.subtitle}>
          Tell us about the job and we'll send you a price.
        </Text>

        <Text style={styles.label}>Service category</Text>
        <View style={styles.chipRow}>
          {services.map((s) => (
            <Chip
              key={s.id}
              label={s.name}
              selected={service?.id === s.id}
              onPress={() => setService(s)}
            />
          ))}
        </View>

        <Text style={styles.label}>Job description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. Two bedroom walls need patching and repainting after moving furniture…"
          value={jobDescription}
          onChangeText={setJobDescription}
          multiline
        />

        <Text style={styles.label}>Photos (optional)</Text>
        <Text style={[styles.cardText, { marginBottom: 6 }]}>
          Photo upload isn't available in this version yet. Describe anything visible below and
          we'll arrange photos when we contact you.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. photo of the damaged drywall corner"
          value={photoNote}
          onChangeText={setPhotoNote}
        />

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

        <Text style={styles.label}>Email (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="jane@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Pressable
          style={[
            styles.button,
            (!service || !jobDescription.trim() || !name.trim() || !phone.trim()) &&
              styles.buttonDisabled,
          ]}
          disabled={!service || !jobDescription.trim() || !name.trim() || !phone.trim()}
          onPress={submit}
        >
          <Text style={styles.buttonText}>Send quote request</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
