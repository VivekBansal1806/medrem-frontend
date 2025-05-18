import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Button,
  Alert,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "./config";

const DEFAULT_PROFILE_PIC = "https://www.gravatar.com/avatar/?d=mp";

export default function ProfileScreen({ navigation }) {
  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    phone: "",
    dob: "",
    profilePictureUrl: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editDetails, setEditDetails] = useState({
    email: "",
    dob: "",
    profilePictureUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      if (!userId) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(`${BACKEND_URL}/users/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (response.ok) {
        const user = await response.json();
        setUserDetails({
          username: user.username || "",
          email: user.email || "",
          phone: user.phone || "",
          dob: user.dob || "",
          profilePictureUrl: user.profilePictureUrl || "",
        });
        setEditDetails({
          email: user.email || "",
          dob: user.dob || "",
          profilePictureUrl: user.profilePictureUrl || "",
        });
      } else {
        Alert.alert("Error", "Failed to load user details");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const handleUpdate = async () => {
    if (!editDetails.email || !/\S+@\S+\.\S+/.test(editDetails.email)) {
      Alert.alert("Validation Error", "Please enter a valid email.");
      return;
    }
    if (editDetails.dob && !/^\d{4}-\d{2}-\d{2}$/.test(editDetails.dob)) {
      Alert.alert(
        "Validation Error",
        "Date of Birth must be in YYYY-MM-DD format."
      );
      return;
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("token");
      if (!userId) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/users/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            email: editDetails.email,
            dob: editDetails.dob,
            profilePictureUrl: editDetails.profilePictureUrl,
          }),
        }
      );

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully");
        setUserDetails((prev) => ({
          ...prev,
          email: editDetails.email,
          dob: editDetails.dob,
          profilePictureUrl: editDetails.profilePictureUrl,
        }));
        setIsEditing(false);
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", "An error occurred while updating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : !isEditing ? (
        <>
          <View style={styles.profileCard}>
            <Image
              source={{
                uri: userDetails.profilePictureUrl || DEFAULT_PROFILE_PIC,
              }}
              style={styles.profileImage}
            />
            <Text style={styles.username}>{userDetails.username}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.input}>{userDetails.email}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.input}>{userDetails.phone}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.input}>{userDetails.dob}</Text>
          </View>

          <Button title="Update" onPress={() => setIsEditing(true)} />
          <View style={{ marginTop: 10 }}>
            <Button
              title="Refresh"
              onPress={fetchUserDetails}
              color="#28a745"
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.profileCard}>
            <TouchableOpacity
              onPress={() => {
                Alert.prompt(
                  "Change Profile Picture",
                  "Enter the new image URL",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "OK",
                      onPress: (url) => {
                        if (url)
                          setEditDetails((prev) => ({
                            ...prev,
                            profilePictureUrl: url,
                          }));
                      },
                    },
                  ],
                  "plain-text",
                  editDetails.profilePictureUrl
                );
              }}
            >
              <Image
                source={{
                  uri: editDetails.profilePictureUrl || DEFAULT_PROFILE_PIC,
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <Text style={styles.username}>{userDetails.username}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={userDetails.username}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.input}>{userDetails.phone}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.editingInput}
              placeholder="Enter email"
              placeholderTextColor="#999"
              value={editDetails.email}
              onChangeText={(text) =>
                setEditDetails({ ...editDetails, email: text })
              }
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              style={styles.editingInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#999"
              value={editDetails.dob}
              onChangeText={(text) =>
                setEditDetails({ ...editDetails, dob: text })
              }
            />
          </View>

          <Button title="Save" onPress={handleUpdate} />
          <View style={{ marginTop: 10 }}>
            <Button
              title="Cancel"
              onPress={() => setIsEditing(false)}
              color="gray"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f9fafd",
    flexGrow: 1,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#051d5f",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: "#051d5f",
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    color: "#333",
  },
  editingInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#007bff",
    fontSize: 16,
    color: "#333",
  },
});
