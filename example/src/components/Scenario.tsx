import type { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScenarioProps = {
  /** What this screen is for and what to look at. */
  description: string;
  children: ReactNode;
  /** Render children in a ScrollView (default) or a plain full-height View. */
  scroll?: boolean;
};

export function Scenario({
  description,
  children,
  scroll = true,
}: ScenarioProps) {
  const { bottom } = useSafeAreaInsets();
  const bottomPadding = { paddingBottom: 16 + bottom };
  const content = (
    <>
      <Text style={styles.description}>{description}</Text>
      {children}
    </>
  );

  if (!scroll) {
    return <View style={[styles.fill, bottomPadding]}>{content}</View>;
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.content, bottomPadding]}
      keyboardShouldPersistTaps="handled"
    >
      {content}
    </ScrollView>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export const dropdownStyles = StyleSheet.create({
  dropdown: {
    // A minimum, not a fixed height: the field grows with large text and
    // with chips inside it (MultiSelect inside).
    minHeight: 50,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#767676",
    borderRadius: 8,
    backgroundColor: "white",
  },
});

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
  },
  fill: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  description: {
    fontSize: 15,
    color: "#333",
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
});
