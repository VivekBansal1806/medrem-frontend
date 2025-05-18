import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as Animatable from "react-native-animatable";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MedicineDetailScreen({ route, navigation }) {
  const { medicine } = route.params;
  const [medicineDetails, setMedicineDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        const response = await fetch(
          `http://192.168.0.152:8080/api/medicines/get/${medicine.medicineId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMedicineDetails(data);
        } else {
          Alert.alert("Error", "Failed to fetch medicine details");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch medicine details");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicineDetails();
  }, [medicine.medicineId]);

  const handleAddUserMedicine = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(
        `http://192.168.0.152:8080/api/user-medicines/add/${medicineDetails.medicineId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Medicine added to your reminders!");
        navigation.navigate("MainTabs", { screen: "myMedicines" });
      } else if (response.status === 409) {
        Alert.alert("Duplicate", "This medicine is already in your list.");
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `Failed to add medicine: ${errorText}`);
      }
    } catch (error) {
      Alert.alert("Error", `Failed to add medicine: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  if (!medicineDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Medicine details not available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Medicine Details</Text>
      <Animatable.View
        style={styles.detailContainer}
        animation="fadeInUp"
        duration={1000}
      >
        <Text style={styles.label}>Medicine Name:</Text>
        <Text style={styles.value}>{medicineDetails.medicineName}</Text>

        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>
          {medicineDetails.medicineType || "Not specified"}
        </Text>

        <Text style={styles.label}>Price:</Text>
        <Text style={styles.value}>
          {medicineDetails.price || "Not specified"}
        </Text>

        <Text style={styles.label}>Manufacturer:</Text>
        <Text style={styles.value}>
          {medicineDetails.manufacturer || "Unknown"}
        </Text>

        <Text style={styles.label}>Pills Per Pack:</Text>
        <Text style={styles.value}>
          {medicineDetails.pillsPerPack || "Not specified"}
        </Text>

        {medicineDetails.composition1 ? (
          <>
            <Text style={styles.label}>Composition 1:</Text>
            <Text style={styles.value}>{medicineDetails.composition1}</Text>
          </>
        ) : null}

        {medicineDetails.composition2 ? (
          <>
            <Text style={styles.label}>Composition 2:</Text>
            <Text style={styles.value}>{medicineDetails.composition2}</Text>
          </>
        ) : null}

        <Text style={styles.label}>About:</Text>
        <Text style={styles.value}>
          {medicineDetails.about || "No description available"}
        </Text>
      </Animatable.View>

      <Animatable.View
        style={styles.buttonContainer}
        animation="bounceIn"
        duration={1500}
      >
        <TouchableOpacity style={styles.button} onPress={handleAddUserMedicine}>
          <Text style={styles.buttonText}>
            Add Medicine Into Your Medicines{" "}
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f3f4f8",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4a90e2",
    marginBottom: 24,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  detailContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
    marginTop: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    color: "#333333",
    marginTop: 4,
    fontWeight: "500",
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#4a90e2",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});
