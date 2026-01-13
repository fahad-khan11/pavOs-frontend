import { io, Socket } from "socket.io-client";

// Use NEXT_PUBLIC_SOCKET_URL if set, otherwise derive from NEXT_PUBLIC_API_URL
// Remove /api/v1 suffix if present, as Socket.io connects to the root server
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  
  if (process.env.NEXT_PUBLIC_API_URL) {
    // Remove /api/v1 suffix if present
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1$/, '');
  }
  
  // Fallback to localhost for development
  return "http://localhost:5000";
};

const SOCKET_URL = getSocketUrl();

let socket: Socket | null = null;

export const connectSocket = (whopUserId: string, whopCompanyId: string) => {
  if (socket?.connected) {
    socket.disconnect();
  }

  console.log("🔌 Connecting socket with Whop context:", { whopUserId, whopCompanyId });

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    auth: {
      whopUserId,
      whopCompanyId,
    },
  });

  socket.connect();

  socket.on("connect", () => {
    console.log("✅ Socket connected");
    socket?.emit("join-user", whopUserId);
    socket?.emit("join-company", whopCompanyId);
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
    if (reason === "io server disconnect" || reason === "transport error") {
      console.error("Socket disconnected:", reason);
    }
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

