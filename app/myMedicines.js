import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function MyMedicinesScreen({ navigation }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserMedicines(); // 👈 refresh when screen comes into focus
    });

    return unsubscribe;
  }, [navigation]);

  const fetchUserMedicines = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User not logged in");
        setLoading(false);
        return;
      }
      const response = await fetch(
        "http://192.168.0.152:8080/api/user-medicines/getAllUserMedicines",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMedicines(data);
      } else {
        Alert.alert("Error", "Failed to fetch your medicines");
      }
    } catch (error) {
      Alert.alert("Error", `Failed to fetch your medicines: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMedicines();
  }, []);

  const renderMedicineItem = ({ item }) => {
    let bgColor = "#ffffff";
    let badgeColor = "#999";
    let badgeText = "Unknown";

    if (item.remainingPills !== null) {
      if (item.remainingPills <= 5) {
        bgColor = "#ffecec";
        badgeColor = "#ff4d4d";
        badgeText = "Low";
      } else if (item.remainingPills <= 10) {
        bgColor = "#fff5e5";
        badgeColor = "#ff9900";
        badgeText = "Moderate";
      } else {
        bgColor = "#e6ffed";
        badgeColor = "#2ecc71";
        badgeText = "Sufficient";
      }
    }

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: bgColor }]}
        onPress={() =>
          navigation.navigate("UserMedicineDetail", {
            userMedicineId: item.userMedicineId,
          })
        }
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.medicineName}>{item.medicineName}</Text>
          <View style={[styles.badge, { backgroundColor: badgeColor }]}>
            <Text style={styles.badgeText}>{badgeText}</Text>
          </View>
        </View>
        <Text style={styles.medicineDetails}>
          Type: {item.medicineType || "N/A"}
        </Text>
        <Text style={styles.medicineDetails}>
          Pills per Pack: {item.pillsPerPack || "N/A"}
        </Text>
        <Text style={styles.medicineDetails}>
          Remaining Pills: {item.remainingPills ?? "N/A"}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Fetching your medicines...</Text>
      </View>
    );
  }

  if (medicines.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.emptyText}>
          😕 You haven’t added any medicines yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={medicines}
        keyExtractor={(item) =>
          item.userMedicineId?.toString() || item.medicine.medicineId.toString()
        }
        renderItem={renderMedicineItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f8",
    padding: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#f2f4f8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#888",
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
  },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  medicineName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34495e",
  },
  medicineDetails: {
    fontSize: 15,
    color: "#555",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },
});
