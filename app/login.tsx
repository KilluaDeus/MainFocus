import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebaseConfig"; // Importamos tu configuración
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // Para cambiar entre Login y Registro

  const handleAuth = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        // CREAR CUENTA NUEVA
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert("¡Bienvenido!", "Tu cuenta ha sido creada con éxito.");
      } else {
        // INICIAR SESIÓN
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Si todo sale bien, el _layout nos redirigirá automáticamente
    } catch (error: any) {
      let msg = error.message;
      if (msg.includes("auth/invalid-email")) msg = "El correo no es válido";
      if (msg.includes("auth/user-not-found")) msg = "Usuario no encontrado";
      if (msg.includes("auth/wrong-password")) msg = "Contraseña incorrecta";
      if (msg.includes("auth/email-already-in-use"))
        msg = "Este correo ya está registrado";
      if (msg.includes("auth/weak-password"))
        msg = "La contraseña es muy débil (mínimo 6 caracteres)";

      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.formContainer}
      >
        <View style={styles.header}>
          <Ionicons name="water" size={80} color="#3498db" />
          <Text style={styles.titulo}>MainFocus</Text>
          <Text style={styles.subtitulo}>
            {isRegistering
              ? "Crea tu cuenta gratis"
              : "Inicia sesión para ver tu progreso"}
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="gray"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.boton}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.textoBoton}>
              {isRegistering ? "Registrarse" : "Entrar"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsRegistering(!isRegistering)}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {isRegistering
              ? "¿Ya tienes cuenta? Inicia sesión"
              : "¿Nuevo aquí? Regístrate"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center" },
  formContainer: { padding: 30, width: "100%" },
  header: { alignItems: "center", marginBottom: 40 },
  titulo: { fontSize: 32, fontWeight: "bold", color: "#333", marginTop: 10 },
  subtitulo: { fontSize: 16, color: "gray", marginTop: 5, textAlign: "center" },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16 },
  boton: {
    backgroundColor: "#3498db",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#3498db",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  textoBoton: { color: "white", fontSize: 18, fontWeight: "bold" },
  switchButton: { marginTop: 25, alignItems: "center" },
  switchText: { color: "#3498db", fontWeight: "600" },
});
