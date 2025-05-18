import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation }) {
  // Dummy data - replace with real data or state later
  const totalMedicines = 5;
  const upcomingReminders = 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MedRem</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          You have <Text style={styles.bold}>{totalMedicines}</Text> medicines registered.
        </Text>
        <Text style={styles.infoText}>
          Upcoming reminders: <Text style={styles.bold}>{upcomingReminders}</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("myMedicines")}
      >
        <Text style={styles.buttonText}>Go to My Medicines</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f9fc",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#007AFF",
  },
  infoBox: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    width: "100%",
    alignItems: "center",
  },
  infoText: {
    fontSize: 18,
    marginBottom: 10,
  },
  bold: {
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
