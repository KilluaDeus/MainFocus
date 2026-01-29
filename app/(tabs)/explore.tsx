import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { StatusBar } from "expo-status-bar";

export default function SettingsScreen() {
  const [nombre, setNombre] = useState("");
  const [metaAgua, setMetaAgua] = useState(8);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ESTADO NUEVO: Modo Oscuro
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    if (!auth.currentUser) return;

    try {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.nombre) setNombre(data.nombre);
        if (data.metaAgua) setMetaAgua(data.metaAgua);
        if (data.userImage) setImageUri(data.userImage);
        // Cargamos la preferencia
        if (data.modoOscuro !== undefined) setModoOscuro(data.modoOscuro);
      }
    } catch (e) {
      console.error("Error leyendo config:", e);
    }
  };

  const guardarEnNube = async (datos: any) => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(docRef, datos, { merge: true });
  };

  // Función para activar/desactivar el modo oscuro
  const toggleModoOscuro = async (valor: boolean) => {
    setModoOscuro(valor);
    await guardarEnNube({ modoOscuro: valor });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImageUri(base64Img);
      guardarEnNube({ userImage: base64Img });
    }
  };

  const guardarNombre = async () => {
    if (nombre.trim() === "") return;
    await guardarEnNube({ nombre: nombre });
    setIsEditing(false);
  };

  const cambiarMeta = async (valor: number) => {
    const nuevaMeta = metaAgua + valor;
    if (nuevaMeta > 0 && nuevaMeta <= 20) {
      setMetaAgua(nuevaMeta);
      await guardarEnNube({ metaAgua: nuevaMeta });
    }
  };

  // --- PALETA DE COLORES INTELIGENTE ---
  const bg = modoOscuro ? "#121212" : "#f2f2f7"; // Fondo oscuro elegante, no negro puro
  const cardBg = modoOscuro ? "#1E1E1E" : "#fff"; // Tarjetas gris oscuro
  const textPrimary = modoOscuro ? "#ffffff" : "#333";
  const textSecondary = modoOscuro ? "#b0b0b0" : "#666";
  const iconColor = modoOscuro ? "#ffffff" : "#333";
  const borderColor = modoOscuro ? "#333" : "#f0f0f0";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      {/* La barra de estado cambia de color según el modo */}
      <StatusBar style={modoOscuro ? "light" : "dark"} backgroundColor={bg} />

      <ScrollView>
        <Text style={[styles.titulo, { color: textPrimary }]}>Ajustes</Text>

        <View style={[styles.perfilCard, { backgroundColor: cardBg }]}>
          <View style={styles.perfilHeader}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarContainer}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={30} color="#fff" />
                </View>
              )}
              <View
                style={[
                  styles.iconoCamara,
                  modoOscuro && {
                    backgroundColor: "#333",
                    borderColor: "#121212",
                  },
                ]}
              >
                <Ionicons name="camera" size={12} color="white" />
              </View>
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              {isEditing ? (
                <View>
                  <Text style={[styles.labelInput, { color: "#3498db" }]}>
                    Editar Nombre:
                  </Text>
                  <TextInput
                    style={[
                      styles.inputNombre,
                      { color: textPrimary, borderBottomColor: "#3498db" },
                    ]}
                    value={nombre}
                    onChangeText={setNombre}
                    autoFocus
                    placeholderTextColor={textSecondary}
                  />
                </View>
              ) : (
                <View>
                  <Text style={[styles.nombreTexto, { color: textPrimary }]}>
                    {nombre || "Usuario"}
                  </Text>
                  <Text style={[styles.nivelTexto, { color: textSecondary }]}>
                    {metaAgua >= 10 ? "Hidratado Pro 💧" : "Principiante"}
                  </Text>
                </View>
              )}
            </View>

            {!isEditing && (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={[
                  styles.btnEditar,
                  { backgroundColor: modoOscuro ? "#333" : "#f0f8ff" },
                ]}
              >
                <Ionicons name="pencil" size={20} color="#3498db" />
              </TouchableOpacity>
            )}
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.btnGuardarMini}
              onPress={guardarNombre}
            >
              <Text style={styles.txtGuardarMini}>Guardar Cambios</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.seccionHeader, { color: textSecondary }]}>
          GENERAL
        </Text>
        <View style={[styles.menuContainer, { backgroundColor: cardBg }]}>
          <View style={[styles.menuItem, { borderBottomColor: borderColor }]}>
            <View style={styles.menuIconBox}>
              <Ionicons name="water-outline" size={22} color={iconColor} />
            </View>
            <Text style={[styles.menuText, { color: textPrimary }]}>
              Meta de Agua
            </Text>
            <View
              style={[
                styles.stepper,
                { backgroundColor: modoOscuro ? "#2C2C2C" : "#f2f2f7" },
              ]}
            >
              <TouchableOpacity
                onPress={() => cambiarMeta(-1)}
                style={styles.stepBtn}
              >
                <Text style={styles.stepTxt}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.stepValue, { color: textPrimary }]}>
                {metaAgua}
              </Text>
              <TouchableOpacity
                onPress={() => cambiarMeta(1)}
                style={styles.stepBtn}
              >
                <Text style={styles.stepTxt}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- INTERRUPTOR DE MODO OSCURO --- */}
          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuIconBox}>
              <Ionicons name="moon-outline" size={22} color={iconColor} />
            </View>
            <Text style={[styles.menuText, { color: textPrimary }]}>
              Modo Oscuro
            </Text>
            <Switch
              value={modoOscuro}
              onValueChange={toggleModoOscuro}
              trackColor={{ false: "#767577", true: "#3498db" }}
              thumbColor={modoOscuro ? "#fff" : "#f4f3f4"}
            />
          </View>
        </View>

        <Text style={[styles.seccionHeader, { color: textSecondary }]}>
          CUENTA
        </Text>
        <View style={[styles.menuContainer, { backgroundColor: cardBg }]}>
          <View style={[styles.menuItem, { borderBottomWidth: 0 }]}>
            <View style={styles.menuIconBox}>
              <Ionicons name="log-out-outline" size={22} color="#ff6b6b" />
            </View>
            <TouchableOpacity onPress={() => auth.signOut()}>
              <Text
                style={{ color: "#ff6b6b", fontWeight: "bold", fontSize: 16 }}
              >
                Cerrar Sesión
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // Color dinámico en el componente
  titulo: { fontSize: 32, fontWeight: "bold", margin: 20 },
  perfilCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    elevation: 2,
  },
  perfilHeader: { flexDirection: "row", alignItems: "center", gap: 15 },
  avatarContainer: { position: "relative" },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  iconoCamara: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 4,
    borderWidth: 2,
    borderColor: "white",
  },
  nombreTexto: { fontSize: 20, fontWeight: "bold" },
  nivelTexto: { fontSize: 14, marginTop: 2 },
  btnEditar: { padding: 10, borderRadius: 20 },
  labelInput: { fontSize: 12, marginBottom: 4, fontWeight: "bold" },
  inputNombre: { borderBottomWidth: 2, fontSize: 18, paddingVertical: 4 },
  btnGuardarMini: {
    backgroundColor: "#333",
    marginTop: 15,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  txtGuardarMini: { color: "#fff", fontWeight: "bold" },
  seccionHeader: {
    marginLeft: 20,
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  menuContainer: {
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    gap: 15,
  },
  menuIconBox: { width: 30, alignItems: "center" },
  menuText: { flex: 1, fontSize: 16 },
  stepper: { flexDirection: "row", alignItems: "center", borderRadius: 8 },
  stepBtn: { paddingHorizontal: 15, paddingVertical: 8 },
  stepTxt: { fontSize: 20, fontWeight: "bold", color: "#3498db" },
  stepValue: {
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },
});
