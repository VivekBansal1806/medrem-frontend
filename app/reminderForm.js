import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  scheduleReminderNotification,
  registerForPushNotificationsAsync,
} from "./NotificationHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "./config";

const FREQUENCIES = ["ONCE", "DAILY", "WEEKLY"];

const ReminderForm = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userMedicine, reminder } = route.params || {};
  const userMedicineId = userMedicine?.userMedicineId;

  const isEdit = Boolean(reminder);

  const [time, setTime] = useState(
    isEdit ? new Date(reminder.reminderTime) : new Date()
  );
  const [message, setMessage] = useState(isEdit ? reminder.message : "");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequency, setFrequency] = useState(
    isEdit ? reminder.frequency : "ONCE"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  const onChangeTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // convert 24h to 12h format
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const handleSave = async () => {
    if (!message.trim()) {
      Alert.alert("Validation Error", "Reminder message is required.");
      return;
    }

    setLoading(true);

    // Format time as HH:mm:ss (24h) for backend
    const formattedTime = time.toTimeString().split(" ")[0];

    const reminderData = {
      userMedicineId,
      reminderTime: formattedTime,
      message: message.trim(),
      frequency,
      enabled: true,
    };

    try {
      const url = isEdit
        ? `${BACKEND_URL}/reminders/update/${reminder.reminderId}`
        : `${BACKEND_URL}/reminders/addReminder`;

      const method = isEdit ? "PUT" : "POST";
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reminderData),
      });

      if (response.ok) {
        await scheduleReminderNotification(time, message);
        Alert.alert(
          "Success",
          `Reminder ${isEdit ? "updated" : "added"} successfully`
        );
        navigation.goBack();
      } else {
        const errorText = await response.text();
        console.error("Error:", errorText);
        Alert.alert("Error", "Failed to save reminder.");
      }
    } catch (error) {
      console.error("Save Reminder Error:", error);
      Alert.alert("Error", "An error occurred while saving reminder.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{isEdit ? "Edit" : "Add"} Reminder</Text>

        <Text style={styles.label}>Reminder Time</Text>
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={styles.timeButton}
        >
          <Text style={styles.timeText}>{formatTime(time)}</Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeTime}
          />
        )}

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Enter reminder message"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.frequencyContainer}>
          {FREQUENCIES.map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.frequencyButton,
                frequency === freq && styles.frequencyButtonSelected,
              ]}
              onPress={() => setFrequency(freq)}
            >
              <Text
                style={[
                  styles.frequencyButtonText,
                  frequency === freq && styles.frequencyButtonTextSelected,
                ]}
              >
                {freq}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading || !message.trim()}
        >
          <Text style={styles.saveButtonText}>
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Reminder"
              : "Add Reminder"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: "#f0f6ff",
    flexGrow: 0,
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 50,
    color: "#003366",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#003366",
  },
  timeButton: {
    backgroundColor: "#e0e7ff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  timeText: {
    fontSize: 18,
    color: "#1a237e",
  },
  input: {
    borderWidth: 1,
    borderColor: "#b0bec5",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 25,
  },
  frequencyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },
  frequencyButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    backgroundColor: "#d1d9ff",
    borderRadius: 10,
    alignItems: "center",
  },
  frequencyButtonSelected: {
    backgroundColor: "#1a237e",
  },
  frequencyButtonText: {
    color: "#3f51b5",
    fontWeight: "600",
  },
  frequencyButtonTextSelected: {
    color: "#fff",
  },
  saveButton: {
    backgroundColor: "#003366",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#7a8bb8",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default ReminderForm;
