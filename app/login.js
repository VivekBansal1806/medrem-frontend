import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = "http://192.168.0.104:8080/api/users/login";

export default function LoginScreen({ onLogin }) {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const validateInputs = () => {
    if (!username.trim()) {
      setErrorMessage("Username is required");
      return false;
    }
    if (!password.trim()) {
      setErrorMessage("Password is required");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;
    setLoading(true);
    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        await AsyncStorage.setItem("userId", data.userId.toString());
        if (data.token) {
          await AsyncStorage.setItem("token", data.token);
        }
        if (onLogin) {
          onLogin();
        }
      } else {
        setErrorMessage(data.message || "Invalid username or password");
      }
    } catch (error) {
      console.error(error); 
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            placeholder="Enter username"
            placeholderTextColor="#aaaaaa"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter password"
            placeholderTextColor="#aaaaaa"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
            editable={!loading}
          />
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("register")}
          disabled={loading}
          style={styles.registerContainer}
        >
          <Text style={styles.registerText}>
            Don't have an account?{" "}
            <Text style={styles.registerLink}>Register</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#ffffff",
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4a90e2",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: "#4a90e2",
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4a90e2",
    fontSize: 16,
    color: "#333333",
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4a90e2",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  registerContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  registerText: {
    color: "#4a90e2",
    fontSize: 16,
  },
  registerLink: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});
