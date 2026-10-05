/**
 * Rayray — handyman services app.
 *
 * Entry point. Wires up:
 *  - StripeProvider (reads the publishable key from app.json extras; the
 *    payment screens no-op gracefully when it's the placeholder).
 *  - Bottom tab navigation: Services | Book | Quotes | Invoices.
 */
import React from "react";
import { Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StripeProvider } from "./src/stripe/provider";

import ServicesScreen from "./src/screens/ServicesScreen";
import BookScreen from "./src/screens/BookScreen";
import QuotesScreen from "./src/screens/QuotesScreen";
import InvoicesStack from "./src/screens/invoicesStack";
import { colors } from "./src/theme";
import type { TabParamList } from "./src/tabs";

const Tab = createBottomTabNavigator<TabParamList>();

// Simple emoji tab icons — no icon library needed.
const TAB_ICONS: Record<keyof TabParamList, string> = {
  Services: "🛠️",
  Book: "📅",
  Quotes: "💬",
  Invoices: "🧾",
};

const STRIPE_PLACEHOLDER_KEY = "pk_test_REPLACE_ME";

export default function App() {
  // Publishable key from app.json -> expo.extra.stripePublishableKey.
  // The PaymentSheet only works once this is a real key from your Stripe
  // dashboard (pk_test_... or pk_live_...). With the placeholder, the Pay
  // button shows an explanatory message instead of failing.
  const publishableKey =
    (Constants.expoConfig?.extra?.stripePublishableKey as string | undefined) ?? "";

  return (
    <StripeProvider
      publishableKey={publishableKey || STRIPE_PLACEHOLDER_KEY}
      merchantIdentifier="" // TODO: add your Apple merchant ID for Apple Pay
    >
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: () => (
              <Text style={{ fontSize: 22 }}>{TAB_ICONS[route.name]}</Text>
            ),
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.muted,
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: "#ffffff",
            headerTitleStyle: { fontWeight: "700" },
          })}
        >
          <Tab.Screen name="Services" component={ServicesScreen} options={{ title: "Services" }} />
          <Tab.Screen name="Book" component={BookScreen} options={{ title: "Book" }} />
          <Tab.Screen name="Quotes" component={QuotesScreen} options={{ title: "Quotes" }} />
          <Tab.Screen
            name="Invoices"
            component={InvoicesStack}
            options={{ title: "Invoices", headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </StripeProvider>
  );
}
