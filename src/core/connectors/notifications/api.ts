export interface NotifyOptions {
  title: string;
  body?: string;
  /** When to show it; default now. */
  at?: Date;
  /** Default: random. Keep it to cancel later. */
  id?: number;
  /** Handed back to onTap. */
  extra?: unknown;
}

export interface NotificationTap {
  id: number;
  extra?: unknown;
}

export interface NotificationsApi {
  /** Asks for permission if needed; true when granted. */
  ensurePermission(): Promise<boolean>;
  /** Shows or schedules a local notification; resolves with its id. */
  notify(options: NotifyOptions): Promise<number>;
  cancel(...ids: number[]): Promise<void>;
  /** Fires when the user taps one of the app's notifications. */
  onTap(callback: (tap: NotificationTap) => void): Promise<() => void>;
}
