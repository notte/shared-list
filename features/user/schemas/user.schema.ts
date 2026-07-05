import { UserRole } from "@/features/user/constants/user-status"

// Represents an authenticated user with their role
export interface User {
  userId: string
  userName: string
  userRole: UserRole
  color: string
}
