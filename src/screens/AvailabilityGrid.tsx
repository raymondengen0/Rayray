/**
 * Spreadsheet-style availability grid for booking.
 *
 * Columns are days, rows are hourly time slots. Each cell shows whether
 * that day+time is bookable: tap an open cell to select it, booked or
 * closed cells are dimmed and can't be tapped.
 */
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { formatDate } from "../data/store";
import { formatSlotLabel, getSlotsForDate, type UnavailableSlots } from "../data/availability";

export interface SlotSelection {
  date: string; // ISO date, e.g. "2026-10-07"
  slot: string; // e.g. "8:00 AM"
}

// All possible slot start hours (8am–8pm). Days with shorter hours show
// the extra rows as closed.
const ALL_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const TIME_COL_WIDTH = 76;
const DAY_COL_WIDTH = 92;

export default function AvailabilityGrid({
  days,
  unavailable,
  selection,
  onSelect,
}: {
  /** ISO dates for the grid columns (open days only). */
  days: string[];
  /** Booked and buffer-blocked slots, keyed by ISO date. */
  unavailable: Map<string, UnavailableSlots>;
  selection: SlotSelection | null;
  onSelect: (s: SlotSelection) => void;
}) {
  // Precompute each day's open slots once.
  const openByDay = new Map(days.map((d) => [d, new Set(getSlotsForDate(d))]));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header row: day labels */}
        <View style={gridStyles.row}>
          <View style={[gridStyles.cell, gridStyles.cornerCell]} />
          {days.map((d) => (
            <View key={d} style={[gridStyles.cell, gridStyles.headerCell]}>
              <Text style={gridStyles.headerText}>{formatDate(d)}</Text>
            </View>
          ))}
        </View>

        {/* One row per time slot */}
        {ALL_HOURS.map((h) => {
          const label = formatSlotLabel(h);
          return (
            <View key={h} style={gridStyles.row}>
              <View style={[gridStyles.cell, gridStyles.timeCell]}>
                <Text style={gridStyles.timeText}>{label}</Text>
              </View>
              {days.map((d) => {
                const isOpen = openByDay.get(d)?.has(label) ?? false;
                const dayUnavailable = unavailable.get(d);
                const isBooked = dayUnavailable?.booked.has(label) ?? false;
                const isBuffer = !isBooked && (dayUnavailable?.buffer.has(label) ?? false);
                const isPersonal = !isBooked && !isBuffer && (dayUnavailable?.personal.has(label) ?? false);
                const isSelected = selection?.date === d && selection?.slot === label;

                if (!isOpen) {
                  return (
                    <View key={d} style={[gridStyles.cell, gridStyles.closedCell]}>
                      <Text style={gridStyles.closedText}>–</Text>
                    </View>
                  );
                }
                if (isBooked || isBuffer || isPersonal) {
                  return (
                    <View key={d} style={[gridStyles.cell, gridStyles.bookedCell]}>
                      <Text style={gridStyles.bookedText}>N/A</Text>
                    </View>
                  );
                }
                return (
                  <Pressable
                    key={d}
                    onPress={() => onSelect({ date: d, slot: label })}
                    style={[gridStyles.cell, gridStyles.openCell, isSelected && gridStyles.selectedCell]}
                  >
                    <Text style={[gridStyles.openText, isSelected && gridStyles.selectedText]}>
                      {isSelected ? "✓" : "Available"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const gridStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  cell: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minHeight: 44,
  },
  cornerCell: {
    width: TIME_COL_WIDTH,
    backgroundColor: "#f8fafc",
  },
  headerCell: {
    width: DAY_COL_WIDTH,
    backgroundColor: "#f8fafc",
  },
  headerText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  timeCell: {
    width: TIME_COL_WIDTH,
    backgroundColor: "#f8fafc",
  },
  timeText: {
    fontSize: 12,
    color: colors.muted,
  },
  openCell: {
    width: DAY_COL_WIDTH,
    backgroundColor: "#ffffff",
  },
  openText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  selectedCell: {
    backgroundColor: colors.primary,
  },
  selectedText: {
    color: "#ffffff",
    fontSize: 16,
  },
  closedCell: {
    width: DAY_COL_WIDTH,
    backgroundColor: "#f1f5f9",
  },
  closedText: {
    fontSize: 13,
    color: "#cbd5e1",
  },
  bookedCell: {
    width: DAY_COL_WIDTH,
    backgroundColor: "#fef2f2",
  },
  bookedText: {
    fontSize: 12,
    color: "#fca5a5",
    fontWeight: "600",
  },
});
