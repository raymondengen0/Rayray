/**
 * Invoice detail + payment screen.
 *
 * Payment flow uses Stripe's React Native SDK PaymentSheet pattern:
 *
 *   1. App calls YOUR backend to create a Stripe PaymentIntent for the invoice
 *      (backend uses the STRIPE SECRET KEY — never ship sk_... in the app).
 *   2. Backend returns { clientSecret }.
 *   3. App calls initPaymentSheet({ paymentIntentClientSecret }) then
 *      presentPaymentSheet() from @stripe/stripe-react-native.
 *   4. On success, markInvoicePaid() updates local state.
 *
 * WIRING CHECKLIST (what to change to go live):
 *   - app.json -> expo.extra.stripePublishableKey: replace "pk_test_REPLACE_ME"
 *     with your real publishable key (pk_test_... or pk_live_...).
 *   - Replace BACKEND_PAYMENT_INTENT_URL below with your server's endpoint,
 *     e.g. https://your-server.com/api/payment-intent, which creates the
 *     PaymentIntent server-side with your secret key and returns its
 *     client_secret for this invoice.
 *   - The StripeProvider (in App.tsx) is already wired to the publishable key
 *     from app config.
 *
 * Until both are real, the Pay button shows an explanatory alert instead of
 * crashing — see handlePay().
 */
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useStripe } from "@stripe/stripe-react-native";
import { colors, styles } from "../theme";
import {
  formatAmount,
  getInvoice,
  markInvoicePaid,
  type Invoice,
} from "../data/store";
import type { InvoicesStackParamList } from "./invoicesStack";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoiceDetail">;

// TODO: replace with your real backend endpoint that creates a PaymentIntent.
// It must accept the invoice id/amount and return { clientSecret: string }.
const BACKEND_PAYMENT_INTENT_URL = "https://your-server.com/api/payment-intent";

const PLACEHOLDER_KEY = "pk_test_REPLACE_ME";

function readPublishableKey(): string {
  return (Constants.expoConfig?.extra?.stripePublishableKey as string | undefined) ?? "";
}

function statusLabel(status: Invoice["status"]): string {
  return status.toUpperCase();
}

export default function InvoiceDetailScreen({ route, navigation }: Props) {
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState<Invoice | undefined>(() => getInvoice(invoiceId));
  const [paying, setPaying] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  async function handlePay() {
    if (!invoice) return;

    // -----------------------------------------------------------------------
    // Graceful placeholder handling: don't crash when Stripe isn't wired up.
    // -----------------------------------------------------------------------
    const publishableKey = readPublishableKey();
    if (!publishableKey || publishableKey === PLACEHOLDER_KEY) {
      Alert.alert(
        "Payments not enabled yet",
        "This demo isn't connected to Stripe yet. To accept payments, set a real publishable key in app.json (expo.extra.stripePublishableKey) and point BACKEND_PAYMENT_INTENT_URL at your server.",
        [{ text: "OK" }]
      );
      return;
    }
    if (BACKEND_PAYMENT_INTENT_URL.includes("your-server.com")) {
      Alert.alert(
        "Backend not connected",
        "Stripe keys look set, but there's no payment backend yet. Update BACKEND_PAYMENT_INTENT_URL in InvoiceDetailScreen.tsx to an endpoint that creates a PaymentIntent and returns its client secret.",
        [{ text: "OK" }]
      );
      return;
    }

    setPaying(true);
    try {
      // 1. Ask YOUR backend to create a PaymentIntent (secret key stays server-side).
      const res = await fetch(BACKEND_PAYMENT_INTENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id, amountCents: invoice.amountCents }),
      });
      if (!res.ok) {
        throw new Error(`Backend returned ${res.status}`);
      }
      const { clientSecret } = (await res.json()) as { clientSecret?: string };
      if (!clientSecret) {
        throw new Error("Backend did not return a client secret.");
      }

      // 2. Initialize the PaymentSheet with the client secret.
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Rayray Handyman Services",
      });
      if (initError) {
        throw new Error(initError.message);
      }

      // 3. Present the sheet and collect payment.
      const { error: sheetError } = await presentPaymentSheet();
      if (sheetError) {
        if (sheetError.code !== "Canceled") {
          Alert.alert("Payment failed", sheetError.message);
        }
        return;
      }

      // 4. Success — mark the invoice paid locally.
      markInvoicePaid(invoice.id);
      setInvoice(getInvoice(invoice.id));
      Alert.alert("Payment successful", `Invoice ${invoice.number} has been paid.`);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Payment error", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setPaying(false);
    }
  }

  if (!invoice) {
    return (
      <View style={styles.screen}>
        <View style={styles.centerBox}>
          <Text style={styles.centerTitle}>Invoice not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{invoice.number}</Text>
        <Text style={styles.subtitle}>{invoice.serviceDescription}</Text>

        <View style={styles.card}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount due</Text>
            <Text style={styles.summaryValue}>{formatAmount(invoice.amountCents)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Due date</Text>
            <Text style={styles.summaryValue}>{invoice.dueDate}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  color:
                    invoice.status === "paid"
                      ? colors.success
                      : invoice.status === "overdue"
                      ? colors.danger
                      : colors.warning,
                },
              ]}
            >
              {statusLabel(invoice.status)}
            </Text>
          </View>
        </View>

        {invoice.status === "paid" ? (
          <View style={[styles.card, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}>
            <Text style={[styles.cardText, { color: colors.success, fontWeight: "600" }]}>
              This invoice has been paid. Thank you!
            </Text>
          </View>
        ) : (
          <Pressable
            style={[styles.button, paying && styles.buttonDisabled]}
            disabled={paying}
            onPress={handlePay}
          >
            {paying ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                Pay {formatAmount(invoice.amountCents)} now
              </Text>
            )}
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}
