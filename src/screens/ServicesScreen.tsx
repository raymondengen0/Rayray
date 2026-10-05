/**
 * Services tab: each service is a tappable heading. Tapping one opens a
 * detail bubble (modal) with the full description, pricing, and buttons to
 * book or request a quote for that service.
 */
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import { colors, styles } from "../theme";
import { listServices, type Service } from "../data/store";
import { hoursSummary } from "../data/availability";
import type { TabParamList } from "../tabs";

function ServiceBubble({ service, onClose }: { service: Service; onClose: () => void }) {
  const navigation = useNavigation<NavigationProp<TabParamList>>();

  function goBook() {
    onClose();
    navigation.navigate("Book", { serviceId: service.id });
  }

  function goQuote() {
    onClose();
    navigation.navigate("Quotes", { serviceId: service.id });
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={bubbleStyles.backdrop} onPress={onClose}>
        <Pressable style={bubbleStyles.bubble} onPress={() => {}}>
          <Text style={styles.cardTitle}>{service.name}</Text>
          <Text style={[styles.cardText, { marginTop: 8 }]}>{service.description}</Text>
          <View style={[styles.metaRow, { marginTop: 12 }]}>
            <Text style={styles.meta}>{service.priceRange}</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>{service.typicalDuration}</Text>
          </View>

          <Pressable style={[styles.button, { marginTop: 16 }]} onPress={goBook}>
            <Text style={styles.buttonText}>Book this service</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={goQuote}>
            <Text style={styles.secondaryButtonText}>Request a quote</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function ServicesScreen() {
  const services = listServices();
  const [selected, setSelected] = useState<Service | null>(null);

  return (
    <View style={styles.screen}>
      <FlatList
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Our Services</Text>
            <Text style={styles.subtitle}>Tap a service to see the details.</Text>
            <View style={[styles.card, { marginTop: 4, marginBottom: 8 }]}>
              <Text style={styles.cardTitle}>Hours</Text>
              <Text style={styles.cardText}>{hoursSummary()}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)} style={bubbleStyles.headingRow}>
            <Text style={bubbleStyles.heading}>{item.name}</Text>
            <Text style={bubbleStyles.chevron}>›</Text>
          </Pressable>
        )}
      />
      {selected && (
        <ServiceBubble service={selected} onClose={() => setSelected(null)} />
      )}
    </View>
  );
}

const bubbleStyles = StyleSheet.create({
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  chevron: {
    fontSize: 24,
    color: colors.muted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  bubble: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
