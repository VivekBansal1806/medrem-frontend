import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { BACKEND_URL } from "./config";

const medicineTypes = [
  "MEDICINE",
  "TABLET",
  "CAPSULE",
  "SYRUP",
  "INJECTION",
  "OINTMENT",
  "DROPS",
  "INHALER",
];

export default function AddMedicine({ navigation, route }) {
  const [name, setName] = useState(route.params?.searchTerm || "");
  const [price, setPrice] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [medicineType, setMedicineType] = useState(medicineTypes[0]);
  const [composition1, setComposition1] = useState("");
  const [composition2, setComposition2] = useState("");
  const [about, setAbout] = useState("");
  const [pillsPerPack, setPillsPerPack] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSaveNewMedicine = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Medicine name is required");
      return;
    }
    if (
      !pillsPerPack.trim() ||
      isNaN(pillsPerPack) ||
      parseInt(pillsPerPack) <= 0
    ) {
      Alert.alert("Validation", "Pills Per Pack must be a positive number");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(
        `${BACKEND_URL}/user-medicines/add-new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            medicineName: name.trim(),
            price,
            manufacturer,
            medicineType: medicineType.toString(),
            composition1,
            composition2,
            about,
            pillsPerPack: parseInt(pillsPerPack),
          }),
        }
      );

      if (response.ok) {
        const userMedicine = await response.json();
        Alert.alert("Success", "Medicine added successfully");
        navigation.navigate("ReminderForm", { userMedicine });
      } else {
        const errorText = await response.text();
        Alert.alert("Error", `Failed to add medicine: ${errorText}`);
      }
    } catch (error) {
      Alert.alert("Error", `Failed to add medicine: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add New Medicine</Text>

        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#051d5f"
          value={name}
          onChangeText={setName}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Price"
          placeholderTextColor="#051d5f"
          value={price}
          onChangeText={setPrice}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Manufacturer"
          placeholderTextColor="#051d5f"
          value={manufacturer}
          onChangeText={setManufacturer}
          editable={!loading}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Medicine Type</Text>
          <Picker
            selectedValue={medicineType}
            onValueChange={(itemValue) => setMedicineType(itemValue)}
            enabled={!loading}
          >
            {medicineTypes.map((type) => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Composition 1"
          placeholderTextColor="#051d5f"
          value={composition1}
          onChangeText={setComposition1}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Composition 2"
          placeholderTextColor="#051d5f"
          value={composition2}
          onChangeText={setComposition2}
          editable={!loading}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="About"
          placeholderTextColor="#051d5f"
          value={about}
          onChangeText={setAbout}
          multiline
          numberOfLines={4}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Pills Per Pack"
          placeholderTextColor="#051d5f"
          value={pillsPerPack}
          onChangeText={setPillsPerPack}
          keyboardType="numeric"
          editable={!loading}
        />

        <Button
          title={loading ? "Saving..." : "Save Medicine"}
          onPress={handleSaveNewMedicine}
          disabled={loading}
        />
        <View style={{ marginTop: 10 }}>
          <Button
            title="Cancel"
            onPress={() => navigation.goBack()}
            color="gray"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafd",
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#051d5f",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 18,
    color: "#051d5f",
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#051d5f",
    marginBottom: 5,
  },
});
