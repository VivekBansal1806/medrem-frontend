import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function MedicineReminderSelectScreen({ navigation }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserMedicines = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        "http://192.168.0.152:8080/api/user-medicines/get/AllUserMedicinesNames",
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      } else {
        Alert.alert("Error", "Failed to fetch medicines");
      }
    } catch (error) {
      Alert.alert("Error", "Network error while fetching medicines");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUserMedicines();
  }, []);

  const handleMedicineSelect = (medicine) => {
    if (medicine.remainingPills > 0) {
      navigation.navigate("ReminderForm", {
        userMedicine: medicine,
      });
    } else {
      Alert.alert(
        "Out of Stock",
        "Medicine stock is empty. Cannot set a reminder."
      );
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.medicineItem}
      onPress={() => handleMedicineSelect(item)}
    >
      <View style={styles.medicineInfo}>
        <Text style={styles.medicineName}>{item.medicineName}</Text>
        <Text style={styles.remainingText}>
          Remaining Pills: {item.remainingPills}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Medicine for Reminder</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={medicines}
          keyExtractor={(item) => item.userMedicineId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No medicines found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9fafd",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#051d5f",
    textAlign: "center",
  },
  medicineItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4a90e2",
  },
  remainingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },

  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 30,
    fontSize: 16,
  },
});
