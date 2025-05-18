import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to MedRem</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4a90e2",
  },
  text: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
});
