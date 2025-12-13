import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

/**
 * Custom hook to use socket in components
 * Returns the current socket instance and connection status
 */
export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Get the socket instance
    const socketInstance = getSocket();
    setSocket(socketInstance);

    if (socketInstance) {
      // Update connection status
      setIsConnected(socketInstance.connected);

      // Listen for connection events
      const onConnect = () => {
        console.log("✅ Socket connected in hook");
        setIsConnected(true);
      };

      const onDisconnect = () => {
        console.log("❌ Socket disconnected in hook");
        setIsConnected(false);
      };

      socketInstance.on("connect", onConnect);
      socketInstance.on("disconnect", onDisconnect);

      // Cleanup
      return () => {
        socketInstance.off("connect", onConnect);
        socketInstance.off("disconnect", onDisconnect);
      };
    }
  }, []);

  return { socket, isConnected };
}
