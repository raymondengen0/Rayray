/**
 * Services tab: each service is a tappable heading. Tapping one opens a
 * detail bubble (modal) with the full description, pricing, and buttons to
 * book or request an estimate for that service.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
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

const SERVICES_BG = require("../../assets/construction-bg.webp");

function ServiceBubble({ service, onClose }: { service: Service; onClose: () => void }) {
  const navigation = useNavigation<NavigationProp<TabParamList>>();

  function goBook() {
    onClose();
    navigation.navigate("Book", { serviceId: service.id });
  }

  function goEstimate() {
    onClose();
    navigation.navigate("Estimates", { serviceId: service.id });
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={bubbleStyles.backdrop} onPress={onClose}>
        <Pressable style={bubbleStyles.bubble} onPress={() => {}}>
          <Text style={styles.cardTitle}>{service.name}</Text>
          <Text style={[styles.cardText, { marginTop: 8 }]}>{service.description}</Text>

          <Text style={[styles.cardTitle, { fontSize: 15, marginTop: 14 }]}>Optional add-ons</Text>
          {service.includes.map((item) => (
            <Text key={item} style={[styles.cardText, { marginTop: 4 }]}>
              • {item}
            </Text>
          ))}

          <View style={[styles.metaRow, { marginTop: 14 }]}>
            <Text style={styles.meta}>{service.priceRange}</Text>
            <Text style={[styles.meta, { color: colors.muted }]}>{service.typicalDuration}</Text>
          </View>

          <Pressable style={[styles.button, { marginTop: 16 }]} onPress={goBook}>
            <Text style={styles.buttonText}>Book this service</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={goEstimate}>
            <Text style={styles.secondaryButtonText}>Request an estimate</Text>
          </Pressable>
          <Pressable style={[styles.secondaryButton, { marginTop: 8 }]} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Flashing promo banner for the Total Home Winterization package. */
function WinterizationBanner({ onPress }: { onPress: () => void }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <Pressable onPress={onPress} style={{ marginTop: 8, marginBottom: 4 }}>
      <Animated.View style={[bannerStyles.banner, { opacity: pulse }]}>
        <Text style={bannerStyles.bannerTitle}>
          ❄ Total Home Winterization — $250 flat!
        </Text>
        <Text style={bannerStyles.bannerText}>
          Winterize, draft-proof & safety-check in one visit. Tap to book.
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const bannerStyles = StyleSheet.create({
  banner: {
    backgroundColor: "#f5a623",
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "#0b2545",
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0b2545",
  },
  bannerText: {
    fontSize: 13,
    color: "#0b2545",
    marginTop: 4,
  },
});

export default function ServicesScreen() {
  const services = listServices();
  const [selected, setSelected] = useState<Service | null>(null);

  return (
    <View style={styles.screen}>
      <Image
        source={SERVICES_BG}
        style={bubbleStyles.localBackdrop}
        resizeMode="cover"
      />
      <FlatList
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Our Services</Text>
            <Text style={[styles.subtitle, { color: colors.text }]}>Tap a service to see the details.</Text>
            {services.find((s) => s.id === "total-home-winterization") && (
              <WinterizationBanner
                onPress={() =>
                  setSelected(
                    services.find((s) => s.id === "total-home-winterization")!
                  )
                }
              />
            )}
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
  localBackdrop: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
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
