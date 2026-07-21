// 樣式變體
export enum Variant {
  Default = "default",
  Primary = "primary",
  Success = "success",
  Warning = "warning",
  Danger = "danger",
  Icon = "icon",
}

// 活動/訂閱狀態
export enum EventStatus {
  Subscribed = "subscribed",
  Pending = "pending",
  Cancelled = "cancelled",
}

// 卡片類型
export enum CardType {
  Announce = "announce",
  Vote = "vote",
}

// 按鈕行為
export enum ButtonAction {
  Navigate = "navigate",
  Submit = "submit",
  Custom = "custom",
}

// 對話框角色
export enum DialogRole {
  Dialog = "dialog",
  AlertDialog = "alertdialog",
}

// 元件尺寸
export enum Size {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

// 邀請狀態
export enum InviteStatus {
  Pending = "pending",
  Joined = "joined",
}

// 使用者角色
export enum UserRole {
  Admin = "admin",
  Member = "member",
}
