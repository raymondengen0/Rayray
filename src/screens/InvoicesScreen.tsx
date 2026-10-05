import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors, styles } from "../theme";
import { formatAmount, listInvoices, type Invoice } from "../data/store";
import type { InvoicesStackParamList } from "./invoicesStack";

type Props = NativeStackScreenProps<InvoicesStackParamList, "InvoicesList">;

function statusColor(status: Invoice["status"]): string {
  switch (status) {
    case "paid":
      return colors.success;
    case "overdue":
      return colors.danger;
    case "unpaid":
      return colors.warning;
  }
}

function InvoiceCard({ invoice, onPress }: { invoice: Invoice; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.metaRow}>
          <Text style={styles.cardTitle}>{invoice.number}</Text>
          <Text style={[styles.meta, { color: statusColor(invoice.status) }]}>
            {invoice.status.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.cardText, { marginTop: 4 }]}>{invoice.serviceDescription}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{formatAmount(invoice.amountCents)}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>Due {invoice.dueDate}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function InvoicesScreen({ navigation }: Props) {
  const [invoices, setInvoices] = React.useState<Invoice[]>(listInvoices());

  // Refresh when returning from the payment screen so a paid invoice updates.
  useFocusEffect(
    React.useCallback(() => {
      setInvoices(listInvoices());
    }, [])
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={invoices}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Invoices</Text>
            <Text style={styles.subtitle}>
              Tap an invoice to see details and pay online.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <InvoiceCard
            invoice={item}
            onPress={() => navigation.navigate("InvoiceDetail", { invoiceId: item.id })}
          />
        )}
      />
    </View>
  );
}
