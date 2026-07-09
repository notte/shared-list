import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth" // 🌟 1. 確保有引入 getAuth

// 這裡的 serviceAccount 配置請維持您原本的寫法
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string,
)

if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount),
  })
}

// 🌟 2. 確保同時 export db 與 auth
export const db = getFirestore()
export const auth = getAuth() // <-- 補上這行，錯誤就會消失了！
