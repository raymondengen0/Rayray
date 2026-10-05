/**
 * Invoices stack — Invoices list -> Invoice detail.
 * Nested inside the "Invoices" bottom tab.
 */
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InvoicesScreen from "./InvoicesScreen";
import InvoiceDetailScreen from "./InvoiceDetailScreen";

export type InvoicesStackParamList = {
  InvoicesList: undefined;
  InvoiceDetail: { invoiceId: string };
};

const Stack = createNativeStackNavigator<InvoicesStackParamList>();

export default function InvoicesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InvoicesList"
        component={InvoicesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InvoiceDetail"
        component={InvoiceDetailScreen}
        options={{ title: "Invoice" }}
      />
    </Stack.Navigator>
  );
}
