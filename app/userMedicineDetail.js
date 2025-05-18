import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function UserMedicineDetail({ route }) {
  const { userMedicineId } = route.params;
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [newQuantity, setNewQuantity] = useState("");
  const [packQuantity, setPackQuantity] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ["180deg", "360deg"],
  });

  const flipCard = () => {
    if (isFlipped) {
      Animated.spring(flipAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 10,
      }).start();
      setIsFlipped(false);
    } else {
      Animated.spring(flipAnim, {
        toValue: 180,
        useNativeDriver: true,
        friction: 8,
        tension: 10,
      }).start();
      setIsFlipped(true);

      setTimeout(() => {
        Animated.spring(flipAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 10,
        }).start();
        setIsFlipped(false);
      }, 5000);
    }
  };

  const fetchUserMedicineDetails = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `http://192.168.0.152:8080/api/user-medicines/get/user-medicine-id/${userMedicineId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMedicineData(data);
      } else {
        console.error("Failed to fetch medicine");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMedicineDetails();
  }, [userMedicineId]);

  const handleAddReminder = () => {
    if (medicineData.remainingPills <= 0 || !medicineData.remainingPills) {
      Alert.alert("No Pills Left", "Please refill your inventory.");
    } else {
      navigation.navigate("ReminderForm", {
        userMedicine: medicineData,
      });
    }
  };

  const handleUpdateQuantity = async () => {
    if ((packQuantity && newQuantity) || (!packQuantity && !newQuantity)) {
      Alert.alert("Invalid Input", "Please fill exactly one field.");
      return;
    }
    let quantityToSend;
    if (packQuantity) {
      const packQtyNum = Number(packQuantity);
      if (isNaN(packQtyNum) || packQtyNum < 0) {
        Alert.alert(
          "Invalid Input",
          "Please enter a valid non-negative number for pack quantity."
        );
        return;
      }
      quantityToSend = packQtyNum * Number(medicineData.pillsPerPack);
    }

    if (newQuantity) {
      const newQtyNum = Number(newQuantity);
      if (isNaN(newQtyNum) || newQtyNum < 0) {
        Alert.alert(
          "Invalid Input",
          "Please enter a valid non-negative number for new quantity."
        );
        return;
      }
      quantityToSend = newQtyNum;
    }

    setUpdateLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        "http://192.168.0.152:8080/api/user-medicines/updateQuantity",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userMedicineId,
            newQuantity: quantityToSend,
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Quantity updated successfully.");
        setModalVisible(false);
        setPackQuantity("");
        setNewQuantity("");
        await fetchUserMedicineDetails();
      } else {
        Alert.alert("Error", "Failed to update quantity.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while updating quantity.");
      console.error("Update Quantity Error:", error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteMedicine = async () => {
    setDeleteLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(
        `http://192.168.0.152:8080/api/user-medicines/delete/${userMedicineId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert("Deleted", "Medicine deleted successfully.");
        setDeleteModalVisible(false);
        navigation.navigate("MainTabs", { screen: "myMedicines" });
      } else {
        Alert.alert("Error", "Failed to delete medicine.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      Alert.alert("Error", "An error occurred while deleting.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const isUpdateDisabled =
    updateLoading ||
    (packQuantity && newQuantity) ||
    (!packQuantity && !newQuantity);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4a90e2" />
      </View>
    );
  }

  if (!medicineData) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red" }}>No data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.flipCardWrapper}>
        <Animated.View
          style={[
            styles.flipCard,
            {
              transform: [{ rotateY: frontInterpolate }],
              zIndex: isFlipped ? 0 : 1,
              position: isFlipped ? "absolute" : "relative",
            },
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
              <Text style={styles.title}>Medicine Info</Text>
              <Text style={styles.item}>Name: {medicineData.medicineName}</Text>
              <Text style={styles.item}>Type: {medicineData.medicineType}</Text>
              <Text style={styles.item}>
                Manufacturer: {medicineData.manufacturer}
              </Text>
              <Text style={styles.item}>
                Composition1: {medicineData.composition1}
              </Text>
              <Text style={styles.item}>
                Composition2: {medicineData.composition2}
              </Text>
              <Text style={styles.item}>Price: {medicineData.price}</Text>
              <Text style={styles.item}>About: {medicineData.about}</Text>
              <Text style={styles.flipHint}>Tap to see pill details</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        <Animated.View
          style={[
            styles.flipCard,
            styles.flipCardBack,
            {
              transform: [{ rotateY: backInterpolate }],
              zIndex: isFlipped ? 1 : 0,
              position: isFlipped ? "relative" : "absolute",
            },
          ]}
        >
          <TouchableOpacity onPress={flipCard} activeOpacity={0.9}>
            <Text style={[styles.title, { color: "#fff" }]}>Pill Info</Text>
            <Text style={[styles.item, { color: "#fff" }]}>
              Packs: {medicineData.quantityPacks}
            </Text>
            <Text style={[styles.item, { color: "#fff" }]}>
              Pills/Pack: {medicineData.pillsPerPack}
            </Text>
            <Text style={[styles.item, { color: "#fff" }]}>
              Added: {medicineData.addedDate}
            </Text>
            <Text style={[styles.item, { color: "#fff" }]}>
              Remaining: {medicineData.remainingPills}
            </Text>
            <Text style={[styles.item, { color: "#fff" }]}>
              Taken: {medicineData.pillsTaken}
            </Text>
            <Text style={[styles.flipHint, { color: "#eee" }]}>
              Tap to see general info
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <TouchableOpacity
        style={styles.reminderButton}
        onPress={handleAddReminder}
      >
        <Text style={styles.reminderButtonText}>Add Reminder</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fillInventoryButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fillInventoryButtonText}>Fill Inventory</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.fillInventoryButton,
          { backgroundColor: "#ff3b30", marginTop: 15 },
        ]}
        onPress={() => setDeleteModalVisible(true)}
      >
        <Text style={styles.fillInventoryButtonText}>Delete Medicine</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Quantity</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={packQuantity}
              onChangeText={(text) => {
                setPackQuantity(text);
                if (text.length > 0) setNewQuantity("");
              }}
              placeholder="Pack of Medicine"
            />
            <Text style={{ textAlign: "center", marginVertical: 8 }}>OR</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={newQuantity}
              onChangeText={(text) => {
                setNewQuantity(text);
                if (text.length > 0) setPackQuantity("");
              }}
              placeholder="New Quantity"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  isUpdateDisabled && { backgroundColor: "#a0a0a0" },
                ]}
                onPress={handleUpdateQuantity}
                disabled={isUpdateDisabled}
              >
                {updateLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Update</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Medicine</Text>
            <Text
              style={{ textAlign: "center", fontSize: 16, marginBottom: 20 }}
            >
              Are you sure you want to delete this medicine from your list?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ff3b30" }]}
                onPress={handleDeleteMedicine}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Yes, Delete</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
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
    backgroundColor: "#f0f4f8",
    padding: 20,
    justifyContent: "center",
  },

  flipCardWrapper: {
    alignSelf: "center",
    width: "90%",
    height: 500,
    marginBottom: 40,
  },

  flipCard: {
    width: "100%",
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
    backfaceVisibility: "hidden",
    justifyContent: "center",
  },

  flipCardBack: {
    backgroundColor: "#4a90e2",
    shadowColor: "#2a5db0",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 18,
    color: "#333",
  },

  item: {
    fontSize: 18,
    color: "#555",
    marginVertical: 5,
  },

  flipHint: {
    marginTop: 25,
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },

  reminderButton: {
    backgroundColor: "#34c759",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#34c759",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  reminderButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },

  fillInventoryButton: {
    backgroundColor: "#ff9500",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    shadowColor: "#ff9500",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },

  fillInventoryButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#333",
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },

  modalButtons: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  modalButton: {
    flex: 1,
    backgroundColor: "#4a90e2",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    marginHorizontal: 5,
  },

  cancelButton: {
    backgroundColor: "#ff6b6b",
  },

  modalButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
