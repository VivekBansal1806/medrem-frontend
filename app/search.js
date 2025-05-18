import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BACKEND_URL } from "./config";

export default function MedicineSearchScreen({ navigation }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  const fetchMedicines = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/medicines/search?name=${encodeURIComponent(
          term
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setNoResults(data.length === 0);
      } else {
        Alert.alert("Error", "Failed to search medicines");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to search medicines");
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchMedicines, 500), []);

  useEffect(() => {
    debouncedFetch(searchTerm);
  }, [searchTerm, debouncedFetch]);

  const handleAddMedicine = (medicine) => {
    navigation.navigate("MedicineDetail", { medicine });
  };

  const handleAddNewMedicine = () => {
    navigation.navigate("AddMedicine", { searchTerm });
  };

  const highlightText = (text, highlight) => {
    if (!highlight) return <Text style={styles.medicineName}>{text}</Text>;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
      <Text style={styles.medicineName}>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <Text key={index} style={styles.highlight}>
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Search Medicines</Text>
      <TextInput
        placeholder="Type medicine name..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        style={styles.input}
        placeholderTextColor="#aaa"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#4a90e2" style={styles.loading} />
      ) : (
        <>
          {noResults && (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                No results found for "{searchTerm}"
              </Text>
              <TouchableOpacity style={styles.addNewButton} onPress={handleAddNewMedicine}>
                <Text style={styles.addNewText}>➕ Add "{searchTerm}"</Text>
              </TouchableOpacity>
            </View>
          )}
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.medicineId.toString()}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleAddMedicine(item)}
                style={styles.item}
                activeOpacity={0.8}
              >
                {highlightText(item.medicineName, searchTerm)}
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9fafe",
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
    marginBottom: 16,
  },
  loading: {
    marginTop: 20,
  },
  noResultsContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  addNewButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#4a90e2",
    borderRadius: 8,
  },
  addNewText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  item: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  medicineName: {
    fontSize: 18,
    color: "#333",
  },
  highlight: {
    backgroundColor: "#ffe680",
    fontWeight: "bold",
  },
});
