import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from './config';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const backendUrl = `${BACKEND_URL}/users/register`;

  const validateInputs = () => {
    if (!username.trim()) {
      setErrorMessage('Username is required');
      return false;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Valid email is required');
      return false;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return false;
    }
    if (!phone.trim() || !/^\d{10}$/.test(phone)) {
      setErrorMessage('Phone number must be 10 digits');
      return false;
    }
    if (!dob.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      setErrorMessage('Date of Birth must be in YYYY-MM-DD format');
      return false;
    }
    if (profilePictureUrl && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(profilePictureUrl)) {
      setErrorMessage('Profile picture URL must be a valid image link');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleRegister = async () => {
    if (!validateInputs() || loading) return;
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, phone: Number(phone), dob, profilePictureUrl }),
      });
      if (response.ok) {
        setSuccessMessage('🎉 Registration successful! Tap here to login.');
        resetForm();
      } else {
        setErrorMessage('Registration failed. Please check your details and try again.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage('Failed to register. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setPhone('');
    setDob('');
    setProfilePictureUrl('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Register</Text>

        <InputField
          label="Username"
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
        />

        <InputField
          label="Email"
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Enter password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { flex: 1 }]}
              secureTextEntry={!showPassword}
              editable={!loading}
              returnKeyType="next"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showPasswordText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <InputField
          label="Phone"
          placeholder="Enter phone number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <InputField
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          value={dob}
          onChangeText={setDob}
        />

        <InputField
          label="Profile Picture URL"
          placeholder="Enter profile picture URL"
          value={profilePictureUrl}
          onChangeText={setProfilePictureUrl}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        {successMessage ? (
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={styles.successText}>{successMessage}</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Register</Text>}
        </TouchableOpacity>

        <Text style={styles.loginText} onPress={() => navigation.navigate('login')} disabled={loading}>
          Already have an account? Login
        </Text>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

function InputField({ label, placeholder, value, onChangeText, keyboardType = 'default' }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999999"
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
        keyboardType={keyboardType}
        editable={true}
        autoCapitalize="none"
        returnKeyType="next"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#ffffff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4a90e2',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#4a90e2',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a90e2',
    fontSize: 16,
    color: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showPasswordText: {
    marginLeft: 10,
    color: '#4a90e2',
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    color: '#28a745',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginText: {
    marginTop: 24,
    color: '#4a90e2',
    textAlign: 'center',
    fontSize: 16,
  },
});
