import { initializeApp, getApps } from "firebase/app"
import { initializeFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { onAuthStateChanged, User } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
})

export const auth = getAuth(app)

export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    // onAuthStateChanged 在訂閱時會立刻觸發一次當前（或恢復後）的登入狀態
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}
