import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../firebaseConfig";

interface Tarea {
  id: number;
  texto: string;
  completada: boolean;
}

const DESAFIOS_DEFAULT: Tarea[] = [
  { id: 1, texto: "Hacer la cama 🛏️", completada: false },
  { id: 2, texto: "Caminar 20 min 🚶", completada: false },
  { id: 3, texto: "Leer 10 páginas 📖", completada: false },
  { id: 4, texto: "Ordenar mi espacio 🧹", completada: false },
  { id: 5, texto: "Agradecer 3 cosas 🙏", completada: false },
];

export default function HomeScreen() {
  const [nombre, setNombre] = useState("Cargando...");
  const [userImage, setUserImage] = useState<string | null>(null);
  const [metaAgua, setMetaAgua] = useState(8);
  const [agua, setAgua] = useState(0);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  const [cargando, setCargando] = useState(true);
  const [celebrando, setCelebrando] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const docRef = doc(db, "users", auth.currentUser.uid);

    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      const hoy = new Date().toISOString().split("T")[0];

      if (docSnap.exists()) {
        const data = docSnap.data();

        setNombre(data.nombre || "Usuario");
        setMetaAgua(data.metaAgua || 8);
        setUserImage(data.userImage || null);
        setModoOscuro(data.modoOscuro || false);

        if (data.ultimoIngreso !== hoy) {
          const tareasReset = (data.misTareas || DESAFIOS_DEFAULT).map(
            (t: Tarea) => ({ ...t, completada: false }),
          );
          await updateDoc(docRef, {
            ultimoIngreso: hoy,
            contadorAgua: 0,
            misTareas: tareasReset,
          });
        } else {
          setAgua(data.contadorAgua || 0);
          setTareas(data.misTareas || DESAFIOS_DEFAULT);
        }
      } else {
        await setDoc(docRef, {
          nombre: auth.currentUser?.email?.split("@")[0] || "Usuario",
          metaAgua: 8,
          ultimoIngreso: hoy,
          contadorAgua: 0,
          misTareas: DESAFIOS_DEFAULT,
          modoOscuro: false,
        });
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const actualizarNube = async (campo: string, valor: any) => {
    if (!auth.currentUser) return;
    const docRef = doc(db, "users", auth.currentUser.uid);
    await updateDoc(docRef, { [campo]: valor });
  };

  const guardarAgua = async (valor: number) => {
    if (valor > metaAgua + 5) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    actualizarNube("contadorAgua", valor);
    if (valor === metaAgua) {
      setCelebrando(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const agregarTarea = async () => {
    if (nuevaTarea.trim() === "") return;
    const nuevaLista = [
      ...tareas,
      { id: Date.now(), texto: nuevaTarea, completada: false },
    ];
    setNuevaTarea("");
    actualizarNube("misTareas", nuevaLista);
  };

  const toggleTarea = async (id: number) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const nuevaLista = tareas.map((t) =>
      t.id === id ? { ...t, completada: !t.completada } : t,
    );
    const completadas = nuevaLista.filter((t) => t.completada).length;
    if (completadas === nuevaLista.length && nuevaLista.length > 0)
      setCelebrando(true);
    actualizarNube("misTareas", nuevaLista);
  };

  const eliminarTarea = async (id: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nuevaLista = tareas.filter((t) => t.id !== id);
    actualizarNube("misTareas", nuevaLista);
  };

  const recargarDesafios = async () => {
    Alert.alert("¿Recargar Misiones?", "Se agregarán los hábitos básicos.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí",
        onPress: async () => {
          const nuevaLista = [...tareas, ...DESAFIOS_DEFAULT];
          actualizarNube("misTareas", nuevaLista);
        },
      },
    ]);
  };

  const tareasCompletadas = tareas.filter((t) => t.completada).length;
  const porcentaje =
    tareas.length > 0 ? (tareasCompletadas / tareas.length) * 100 : 0;
  const progresoAgua = metaAgua > 0 ? (agua / metaAgua) * 100 : 0;

  // --- COLORES DINÁMICOS ---
  const bg = modoOscuro ? "#121212" : "#f2f2f7";
  const textPrimary = modoOscuro ? "#ffffff" : "#1c1c1e";
  const textSecondary = modoOscuro ? "#b0b0b0" : "#8e8e93";
  const cardBg = modoOscuro ? "#1E1E1E" : "#ffffff";
  const borderColor = modoOscuro ? "#333" : "transparent";
  const inputBg = modoOscuro ? "#2C2C2C" : "#ffffff";
  // Color de la barra inactiva: Un gris medio para que se vea bien sobre blanco
  const barraBg = modoOscuro ? "#333" : "#E0E0E0";

  if (cargando)
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar style={modoOscuro ? "light" : "dark"} backgroundColor={bg} />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerContainer}>
              <View>
                <Text style={[styles.titulo, { color: textPrimary }]}>
                  Hola, {nombre} 👋
                </Text>
                <Text style={[styles.fecha, { color: textSecondary }]}>
                  {new Date().toLocaleDateString()}
                </Text>
              </View>
              {userImage ? (
                <Image
                  source={{ uri: userImage }}
                  style={[styles.avatarMini, { borderColor: "#3498db" }]}
                />
              ) : (
                <View style={styles.avatarMiniPlaceholder}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
              )}
            </View>

            <View
              style={[
                styles.cardAgua,
                modoOscuro && { backgroundColor: "#0A1A2F" },
              ]}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={styles.numeroGigante}>{agua}</Text>
                  <Text style={styles.metaTexto}>/{metaAgua}</Text>
                </View>
                <Text style={styles.etiqueta}>Vasos de agua</Text>
                <View
                  style={[
                    styles.barraAguaFondo,
                    modoOscuro && { backgroundColor: "#162C46" },
                  ]}
                >
                  <View
                    style={[
                      styles.barraAguaRelleno,
                      { width: `${Math.min(progresoAgua, 100)}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.botonesAgua}>
                <TouchableOpacity
                  style={[
                    styles.botonResta,
                    modoOscuro && { backgroundColor: "#162C46" },
                  ]}
                  onPress={() => agua > 0 && guardarAgua(agua - 1)}
                >
                  <Text style={styles.textoBotonSecundario}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.botonAgua}
                  onPress={() => guardarAgua(agua + 1)}
                >
                  <Ionicons name="water" size={20} color="white" />
                  <Text style={styles.textoBotonAgua}>+1</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* --- SECCIÓN DE PROGRESO (AHORA ES UNA TARJETA) --- */}
            <View
              style={[styles.progresoContainer, { backgroundColor: cardBg }]}
            >
              <View style={styles.barraInfo}>
                <Text style={[styles.progresoTexto, { color: textSecondary }]}>
                  Tu progreso
                </Text>
                <Text
                  style={[styles.progresoPorcentaje, { color: textPrimary }]}
                >
                  {Math.round(porcentaje)}%
                </Text>
              </View>
              <View
                style={[
                  styles.barraFondo,
                  { backgroundColor: barraBg }, // Usamos el nuevo color contrastante
                ]}
              >
                <View
                  style={[
                    styles.barraRelleno,
                    {
                      width: `${porcentaje}%`,
                      backgroundColor:
                        porcentaje === 100 ? "#4cd137" : "#3498db",
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: inputBg,
                    color: textPrimary,
                    borderColor: borderColor,
                  },
                ]}
                placeholder="Nueva misión..."
                placeholderTextColor={textSecondary}
                value={nuevaTarea}
                onChangeText={setNuevaTarea}
              />
              <TouchableOpacity
                onPress={agregarTarea}
                style={[
                  styles.botonAgregar,
                  modoOscuro && { backgroundColor: "#ffffff" },
                ]}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={modoOscuro ? "#000" : "white"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.lista}>
              {tareas.map((tarea, index) => (
                <View
                  key={`${tarea.id}-${index}`}
                  style={[
                    styles.tareaItem,
                    { backgroundColor: cardBg, borderColor: borderColor },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      tarea.completada && styles.checkboxChecked,
                      modoOscuro &&
                        !tarea.completada && { borderColor: "#fff" },
                    ]}
                    onPress={() => toggleTarea(tarea.id)}
                  >
                    {tarea.completada && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.textoTarea,
                      { color: textPrimary },
                      tarea.completada && styles.textoTachado,
                    ]}
                  >
                    {tarea.texto}
                  </Text>

                  <TouchableOpacity
                    onPress={() => eliminarTarea(tarea.id)}
                    style={{ padding: 5 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {tareas.length === 0 && (
              <TouchableOpacity
                onPress={recargarDesafios}
                style={{ alignItems: "center", marginTop: 20 }}
              >
                <Text style={{ color: "#3498db", fontWeight: "bold" }}>
                  🔄 Cargar hábitos
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {celebrando && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: "transparent",
          }}
          pointerEvents="none"
        >
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            autoStart={true}
            fadeOut={true}
            onAnimationEnd={() => setCelebrando(false)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20, paddingBottom: 50 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  titulo: { fontSize: 28, fontWeight: "bold" },
  fecha: { textTransform: "capitalize", fontSize: 14 },
  avatarMini: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#3498db",
  },
  avatarMiniPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  cardAgua: {
    backgroundColor: "#e3f2fd",
    padding: 20,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    elevation: 3,
  },
  numeroGigante: { fontSize: 36, fontWeight: "bold", color: "#1e88e5" },
  metaTexto: {
    fontSize: 18,
    color: "#90caf9",
    marginLeft: 2,
    fontWeight: "600",
  },
  etiqueta: { fontSize: 13, color: "#1565c0", marginBottom: 8 },
  barraAguaFondo: {
    height: 6,
    backgroundColor: "#bbdefb",
    borderRadius: 5,
    width: "80%",
  },
  barraAguaRelleno: {
    height: "100%",
    backgroundColor: "#1e88e5",
    borderRadius: 5,
  },
  botonesAgua: { flexDirection: "row", gap: 10, alignItems: "center" },
  botonAgua: {
    backgroundColor: "#1e88e5",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  botonResta: {
    backgroundColor: "#bbdefb",
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  textoBotonAgua: { color: "white", fontWeight: "bold", fontSize: 16 },
  textoBotonSecundario: {
    color: "#1565c0",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: -2,
  },

  // --- ESTILOS DE LA NUEVA TARJETA DE PROGRESO ---
  progresoContainer: {
    marginBottom: 25,
    padding: 20, // Relleno interno
    borderRadius: 20, // Bordes redondeados
    // No ponemos elevation aquí para que sea sutil, pero se puede poner si quieres sombra
  },
  barraInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progresoTexto: { fontSize: 14, fontWeight: "600" },
  progresoPorcentaje: { fontWeight: "bold" },
  barraFondo: {
    height: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
  barraRelleno: { height: "100%", borderRadius: 10 },

  inputContainer: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  input: { flex: 1, padding: 15, borderRadius: 15, borderWidth: 1 },
  botonAgregar: {
    backgroundColor: "#333",
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
  },
  lista: { gap: 10 },
  tareaItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#333",
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#333", borderColor: "#333" },
  textoTarea: { fontSize: 16, flex: 1 },
  textoTachado: { textDecorationLine: "line-through", color: "#aaa" },
});
