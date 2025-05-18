import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox } from "react-native-paper";
import { BACKEND_URL } from "./config";

export default function ReminderScreen({ navigation }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userMedicineId, setSelectedReminderUserMedicineId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `${BACKEND_URL}/reminders/getAll`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      } else {
        Alert.alert("Error", "Failed to fetch reminders");
      }
    } catch (error) {
      Alert.alert("Error", "Network error while fetching reminders");
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchReminders();
    });
    return unsubscribe;
  }, [navigation]);

  const handleAddReminder = () => {
    navigation.navigate("MedicineReminderSelect");
  };

  const handleEditReminder = (reminder) => {
    navigation.navigate("ReminderForm", {
      reminder,
      userMedicine: { id: 1, medicineName: "Sample Medicine" },
    });
  };

  const handleDeleteReminder = (reminderId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${BACKEND_URL}/reminders/delete/reminderId/${reminderId}`,
                {
                  method: "DELETE",
                  headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                  },
                }
              );
              if (response.ok) {
                Alert.alert("Success", "Reminder deleted successfully");
                fetchReminders();
              } else {
                Alert.alert("Error", "Failed to delete reminder");
              }
            } catch (error) {
              Alert.alert("Error", "Network error while deleting reminder");
            }
          },
        },
      ]
    );
  };

  const handleCheckboxClick = (id) => {
    setSelectedReminderUserMedicineId(id);
    setShowConfirmation(true);
  };

  const confirmMedicationTaken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const pillsTaken = 1;
      const response = await fetch(
        `${BACKEND_URL}/user-medicines/take/${userMedicineId}?pillsTaken=${pillsTaken}`,
        {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );
      if (response.ok) {
        Alert.alert("Success", "Medicine marked as taken.");
        fetchReminders();
        // Optionally update checkbox state here if you want it to stay checked
        setCheckedItems((prev) => ({ ...prev, [userMedicineId]: true }));
      } else {
        Alert.alert("Error", "Failed to mark medicine as taken.");
      }
    } catch (error) {
      console.error("Error confirming medication taken:", error);
      Alert.alert("Error", "Network error while updating reminder.");
    }
    setShowConfirmation(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reminderItem}
      onPress={() => handleEditReminder(item)}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.medicineName}>{item.medicineName}</Text>
        <View style={styles.reminderInfo}>
          <Text style={styles.reminderText}>
            🕒 Time:{" "}
            <Text style={styles.highlight}>
              {item.reminderTime?.slice(0, 5)}
            </Text>
          </Text>
          <Text style={styles.reminderText}>
            🔁 Frequency: <Text style={styles.highlight}>{item.frequency}</Text>
          </Text>
          <Text style={styles.reminderText}>
            ✅ Enabled:{" "}
            <Text style={styles.highlight}>{item.enabled ? "Yes" : "No"}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Checkbox
          status={checkedItems[item.userMedicineId] ? "checked" : "unchecked"}
          onPress={() => {
            if (!checkedItems[item.userMedicineId]) {
              handleCheckboxClick(item.userMedicineId);
            }
          }}
          color="#4caf50"
          uncheckedColor="#b0b0b0"
        />

        <TouchableOpacity
          onPress={() => handleDeleteReminder(item.reminderId)}
          style={styles.deleteButton}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗓️ My Reminders</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4caf50" />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.reminderId.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reminders found.Add one!</Text>
          }
        />
      )}
      <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
        <Text style={styles.addButtonText}>＋ Add Reminder</Text>
      </TouchableOpacity>

      <Modal visible={showConfirmation} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Have you taken the medicine?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={confirmMedicationTaken}
                style={[styles.modalButton, styles.modalButtonYes]}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowConfirmation(false)}
                style={[styles.modalButton, styles.modalButtonNo]}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f0fe",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#051d5f",
    textAlign: "center",
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4a90e2",
    marginBottom: 4,
  },
  reminderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderText: {
    fontSize: 16,
    color: "#333",
  },
  actionsContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 12,
  },
  deleteButton: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#ff6b6b",
    borderRadius: 8,
    shadowColor: "#ff6b6b",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  addButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: "auto",
    shadowColor: "#4caf50",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 15,
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 15,
    elevation: 10,
  },
  modalText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 25,
    textAlign: "center",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: "center",
  },
  modalButtonYes: {
    backgroundColor: "#4caf50",
  },
  modalButtonNo: {
    backgroundColor: "#f44336",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
