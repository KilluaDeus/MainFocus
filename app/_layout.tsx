import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { View, ActivityIndicator, LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./login";

// --- SILENCIADOR DE ADVERTENCIAS ---
// Hemos agregado las frases exactas para que la consola quede limpia
LogBox.ignoreLogs([
  "AsyncStorage has been extracted from react-native",
  "You are initializing Firebase Auth",
  "@firebase/auth:",
  "Auth (12.8.0):",
]);

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
      setUser(usuarioFirebase);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style="dark" backgroundColor="#fff" />
        <LoginScreen />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
