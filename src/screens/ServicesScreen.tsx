import React from "react";
import { FlatList, Text, View } from "react-native";
import { colors, styles } from "../theme";
import { listServices, type Service } from "../data/store";
import { hoursSummary } from "../data/availability";

function ServiceCard({ service }: { service: Service }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{service.name}</Text>
      <Text style={styles.cardText}>{service.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{service.priceRange}</Text>
        <Text style={[styles.meta, { color: colors.muted }]}>{service.typicalDuration}</Text>
      </View>
    </View>
  );
}

export default function ServicesScreen() {
  const services = listServices();
  return (
    <View style={styles.screen}>
      <FlatList
        data={services}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Our Services</Text>
            <Text style={styles.subtitle}>
              What we do, typical prices and how long each job usually takes.
            </Text>
            <View style={[styles.card, { marginTop: 4 }]}>
              <Text style={styles.cardTitle}>Hours</Text>
              <Text style={styles.cardText}>{hoursSummary()}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <ServiceCard service={item} />}
      />
    </View>
  );
}
