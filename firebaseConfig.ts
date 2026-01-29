import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { Platform } from "react-native";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// 1. Importamos las funciones normales que TypeScript SÍ reconoce
import { initializeAuth, getAuth, Auth } from "firebase/auth";

// 2. EL TRUCO: Importamos la función "problemática" en una línea aparte
// y le decimos a TypeScript que ignore esta línea específica.
// @ts-ignore
import { getReactNativePersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqCEWQo5kXEj5x4w7MN5cBr99H7mm_hrA",
  authDomain: "mainfocus-28681.firebaseapp.com",
  projectId: "mainfocus-28681",
  storageBucket: "mainfocus-28681.firebasestorage.app",
  messagingSenderId: "881342153550",
  appId: "1:881342153550:web:05b10b1b5562b37525941f",
  measurementId: "G-QBLLXQPJTG",
};

const app = initializeApp(firebaseConfig);

// --- LÓGICA HÍBRIDA (Móvil vs Web) ---
let auth: Auth;

if (Platform.OS === "web") {
  // En Web: Usamos el método estándar (sin persistencia avanzada)
  auth = getAuth(app);
} else {
  // En Móvil: Usamos la persistencia con AsyncStorage para quitar la advertencia amarilla
  // @ts-ignore: Ignoramos el error de tipo aquí también por si acaso
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

const db: Firestore = getFirestore(app);

export { auth, db };
