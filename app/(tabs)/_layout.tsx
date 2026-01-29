import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

export default function TabLayout() {
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setModoOscuro(data.modoOscuro || false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarItemStyle: {
          justifyContent: "center", // Centra verticalmente
          alignItems: "center", // Centra horizontalmente
          paddingVertical: 5, // Un poco de aire arriba y abajo
        },
        // --------------------------------------------------------
        tabBarStyle: {
          position: "absolute",
          shadowColor: "transparent",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
          height: Platform.OS === "ios" ? 80 : 60,
          paddingBottom: 0,
          paddingTop: Platform.OS === "android" ? 0 : 0,
          borderTopWidth: 0,
          elevation: 0,
          // AQUÍ ESTÁ EL CAMBIO SOLICITADO:
          // Usa el color de la tarjeta de perfil (#1E1E1E) en oscuro, y blanco en claro.
          backgroundColor: modoOscuro ? "#1E1E1E" : "#ffffff",
        },
        tabBarActiveTintColor: "#3498db",
        tabBarInactiveTintColor: modoOscuro ? "#999" : "#95a5a6",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mi Día",
          tabBarIcon: ({ color }) => (
            <Ionicons name="today" size={28} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-sharp" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
