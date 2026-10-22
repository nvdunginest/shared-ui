import { axiosBuilder } from "@ptht365/shared-ui/platform";
import * as signalR from "@microsoft/signalr";

let hubUrl: string | null = null;

/** Sets the document hub URL of the app (e.g. `${apiHost}/hubs/vpi-adm-rept/document-hub`). Call before the first connect. */
export function configureDocumentHub(options: { hubUrl: string }): void {
  hubUrl = options.hubUrl;
}

// 📡 Global notification interfaces
export interface DocumentChangeNotification {
  documentId: string;
  companyId: string; // UUID string — dùng để so khớp với selectedCompanyId (AC5)
  updatedTime: string; // ISO 8601 string
  timestamp: string; // Server timestamp when notification sent
}

// 📡 Waiting count (badge "Chưa xử lý") change notification — chỉ báo companyId nào bị
// ảnh hưởng, client tự quyết định có refetch hay không (không mang sẵn số đếm mới).
export interface WaitingCountChangedNotification {
  companyId: string; // UUID string
  timestamp: string; // Server timestamp when notification sent
}

/**
 * Global Document Notification Connector
 * - Listens to ALL document changes globally (no groups/joins needed)
 * - Notifications contain only documentId + updatedTime
 * - Client decides whether to refresh based on current document
 * - Singleton pattern ensures single connection instance
 */
class GlobalDocumentNotificationConnector {
  private connection!: signalR.HubConnection;
  public connectionState: signalR.HubConnectionState =
    signalR.HubConnectionState.Disconnected;

  // Event handlers - using Set for better performance and cleanup
  private documentChangeHandlers = new Set<
    (notification: DocumentChangeNotification) => void
  >();
  private bulkChangeHandlers = new Set<
    (notifications: DocumentChangeNotification[]) => void
  >();
  private connectionStateHandlers = new Set<
    (state: signalR.HubConnectionState) => void
  >();
  private reconnectionHandlers = new Set<() => Promise<void>>();
  private waitingCountChangeHandlers = new Set<
    (notification: WaitingCountChangedNotification) => void
  >();

  static instance: GlobalDocumentNotificationConnector;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    if (hubUrl === null) throw new Error("signalr: configureDocumentHub({ hubUrl }) was not called");
    this.connection = new signalR.HubConnectionBuilder()
      // accessTokenFactory được gọi lại mỗi lần connect/reconnect (không chỉ 1 lần lúc
      // khởi tạo) — nên luôn lấy token mới nhất, tự "refresh" qua các lần reconnect dù
      // token ban đầu có hạn ngắn.
      .withUrl(hubUrl, {
        accessTokenFactory: async () => (await axiosBuilder.getAccessToken()) ?? "",
      })
      .withAutomaticReconnect([0, 1000, 5000, 15000, 30000]) // PWA-friendly reconnect delays
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.setupEventListeners();
    this.setupConnectionEvents();
  }

  private setupEventListeners() {
    // 📡 Listen for single document changes
    this.connection.on(
      "DocumentChanged",
      (notification: DocumentChangeNotification) => {
        this.documentChangeHandlers.forEach((handler) => {
          try {
            handler(notification);
          } catch (error) {
            console.error("[SignalR] Error in document change handler:", error);
          }
        });
      },
    );

    // 📡 Listen for bulk document changes
    this.connection.on(
      "BulkDocumentsChanged",
      (notifications: DocumentChangeNotification[]) => {
        // Trigger bulk handlers
        this.bulkChangeHandlers.forEach((handler) => {
          try {
            handler(notifications);
          } catch (error) {
            console.error("[SignalR] Error in bulk change handler:", error);
          }
        });

        // Also trigger individual handlers for each document
        notifications.forEach((notification) => {
          this.documentChangeHandlers.forEach((handler) => {
            try {
              handler(notification);
            } catch (error) {
              console.error(
                "[SignalR] Error in individual change handler:",
                error,
              );
            }
          });
        });
      },
    );

    // 📡 Listen for waiting count changes (badge "Chưa xử lý")
    this.connection.on(
      "WaitingCountChanged",
      (notification: WaitingCountChangedNotification) => {
        this.waitingCountChangeHandlers.forEach((handler) => {
          try {
            handler(notification);
          } catch (error) {
            console.error(
              "[SignalR] Error in waiting count change handler:",
              error,
            );
          }
        });
      },
    );

    // 📡 Optional: Pong response for heartbeat
    this.connection.on("Pong", () => {});
  }

  private setupConnectionEvents() {
    this.connection.onreconnecting(() => {
      this.connectionState = signalR.HubConnectionState.Reconnecting;
      this.notifyConnectionStateChange(signalR.HubConnectionState.Reconnecting);
    });

    this.connection.onreconnected(async () => {
      this.connectionState = signalR.HubConnectionState.Connected;

      // 🔄 Trigger reconnection sync handlers
      await this.executeReconnectionHandlers();

      this.notifyConnectionStateChange(signalR.HubConnectionState.Connected);
    });

    this.connection.onclose(() => {
      this.connectionState = signalR.HubConnectionState.Disconnected;
      this.notifyConnectionStateChange(signalR.HubConnectionState.Disconnected);
    });
  }

  private notifyConnectionStateChange(state: signalR.HubConnectionState) {
    this.connectionStateHandlers.forEach((handler) => {
      try {
        handler(state);
      } catch (error) {
        console.error("[SignalR] Error in connection state handler:", error);
      }
    });
  }

  private async executeReconnectionHandlers() {
    const promises = Array.from(this.reconnectionHandlers).map((handler) =>
      handler().catch((error) =>
        console.error("[SignalR] Error in reconnection handler:", error),
      ),
    );

    await Promise.all(promises);
  }

  // 🚀 Public API Methods

  public async start(): Promise<boolean> {
    try {
      // Check current connection state
      const currentState = this.connection.state;

      // Only start if disconnected
      if (currentState === signalR.HubConnectionState.Disconnected) {
        await this.connection.start();
        this.connectionState = signalR.HubConnectionState.Connected;
        return true;
      } else if (currentState === signalR.HubConnectionState.Connected) {
        this.connectionState = signalR.HubConnectionState.Connected;
        return true;
      } else {
        // If connecting or reconnecting, wait for it to complete
        return new Promise((resolve) => {
          const checkConnection = () => {
            if (
              this.connection.state === signalR.HubConnectionState.Connected
            ) {
              this.connectionState = signalR.HubConnectionState.Connected;
              resolve(true);
            } else if (
              this.connection.state === signalR.HubConnectionState.Disconnected
            ) {
              // Try again if disconnected
              this.start().then(resolve);
            } else {
              // Still connecting, check again in 100ms
              setTimeout(checkConnection, 100);
            }
          };
          setTimeout(checkConnection, 100);
        });
      }
    } catch (error) {
      console.error("[SignalR] Connection failed:", error);
      this.connectionState = signalR.HubConnectionState.Disconnected;
      return false;
    }
  }

  public async stop(): Promise<void> {
    try {
      const currentState = this.connection.state;

      if (currentState !== signalR.HubConnectionState.Disconnected) {
        await this.connection.stop();
      }

      this.connectionState = signalR.HubConnectionState.Disconnected;
    } catch (error) {
      console.error("[SignalR] Error stopping connection:", error);
      this.connectionState = signalR.HubConnectionState.Disconnected;
    }
  }

  // 💓 Optional: Heartbeat method
  public async ping(): Promise<void> {
    if (this.connectionState === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke("Ping");
      } catch (error) {
        console.error("[SignalR] Ping failed:", error);
      }
    }
  }

  // 📊 Connection info
  public getConnectionState(): signalR.HubConnectionState {
    // Always return the actual connection state, not our cached version
    this.connectionState = this.connection.state;
    return this.connectionState;
  }

  public isConnected(): boolean {
    return this.connection.state === signalR.HubConnectionState.Connected;
  }

  // 🎧 Event Subscription Methods

  public onDocumentChanged(
    handler: (notification: DocumentChangeNotification) => void,
  ): () => void {
    this.documentChangeHandlers.add(handler);
    return () => this.documentChangeHandlers.delete(handler);
  }

  public onBulkDocumentsChanged(
    handler: (notifications: DocumentChangeNotification[]) => void,
  ): () => void {
    this.bulkChangeHandlers.add(handler);
    return () => this.bulkChangeHandlers.delete(handler);
  }

  public onConnectionStateChanged(
    handler: (state: signalR.HubConnectionState) => void,
  ): () => void {
    this.connectionStateHandlers.add(handler);
    return () => this.connectionStateHandlers.delete(handler);
  }

  public onReconnection(handler: () => Promise<void>): () => void {
    this.reconnectionHandlers.add(handler);
    return () => this.reconnectionHandlers.delete(handler);
  }

  public onWaitingCountChanged(
    handler: (notification: WaitingCountChangedNotification) => void,
  ): () => void {
    this.waitingCountChangeHandlers.add(handler);
    return () => this.waitingCountChangeHandlers.delete(handler);
  }

  // 🧹 Cleanup method
  public dispose(): void {
    this.documentChangeHandlers.clear();
    this.bulkChangeHandlers.clear();
    this.connectionStateHandlers.clear();
    this.reconnectionHandlers.clear();
    this.waitingCountChangeHandlers.clear();
    this.stop();
  }

  // 🔄 Singleton pattern
  public static getInstance(): GlobalDocumentNotificationConnector {
    if (!GlobalDocumentNotificationConnector.instance) {
      GlobalDocumentNotificationConnector.instance =
        new GlobalDocumentNotificationConnector();
    }
    return GlobalDocumentNotificationConnector.instance;
  }

  // 🔄 Reset singleton (useful for testing or force recreation)
  public static resetInstance(): void {
    if (GlobalDocumentNotificationConnector.instance) {
      GlobalDocumentNotificationConnector.instance.dispose();
      GlobalDocumentNotificationConnector.instance = null as never;
    }
  }
}

// Export singleton instance
export default GlobalDocumentNotificationConnector.getInstance;
