import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Clock, AlertCircle } from "lucide-react";
import io from "socket.io-client";

// Types for session notifications
interface SessionNotification {
  sessionId: string;
  sessionName: string;
  subject: string;
  description: string;
  joinLink: string;
  scheduledTime: Date;
  targetClass: string;
}

const StudyGroups: React.FC = () => {
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionNotifications, setSessionNotifications] = useState<SessionNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection without authentication
  const initializeSocket = useCallback(async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      console.log("Attempting to connect to backend:", backendUrl);

      // Initialize socket without auth token
      const socketInstance = io(backendUrl, {
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
      });

      socketInstance.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
        setError("Disconnected from server. Trying to reconnect...");
      });

      socketInstance.on("session-notification", (session: SessionNotification) => {
        console.log("Received session notification:", session);
        setSessionNotifications((prev) => {
          const exists = prev.some((s) => s.sessionId === session.sessionId);
          return exists ? prev : [session, ...prev];
        });
      });

      setSocket(socketInstance);
    } catch (error) {
      console.error("Failed to initialize socket:", error);
      setError(`Failed to connect: ${error instanceof Error ? error.message : "Unknown error"}`);
      setIsLoading(false);
    }
  }, []);

  // Initialize socket on component mount
  useEffect(() => {
    initializeSocket();
  }, [initializeSocket]);

  // Join classroom
  const joinClassroom = useCallback((joinLink: string) => {
    window.open(joinLink, "_blank");
  }, []);



  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  };

  // Check if session is joinable
  const isSessionJoinable = (scheduledTime: Date) => {
    return new Date(scheduledTime) <= new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              setError(null);
              initializeSocket();
            }}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Classroom Sessions</h1>
        <p className="text-gray-400 mb-6">Join live video classes</p>

        {sessionNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No Active Sessions</h3>
            <p className="text-gray-500">You'll be notified when your teacher creates a new session.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {sessionNotifications.map((session) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                >
                  <h3 className="text-lg font-semibold text-white">{session.sessionName}</h3>
                  <p className="text-gray-400 text-sm mb-2">{session.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300 mb-3">
                    <div>
                      <span className="font-medium">Standard:</span> {session.targetClass}
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span> {session.subject}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <Clock size={16} className="text-blue-400" />
                    <span>{formatTime(session.scheduledTime)}</span>
                  </div>
                  <motion.button
                    onClick={() => joinClassroom(session.joinLink)}
                    disabled={!isSessionJoinable(session.scheduledTime)}
                    className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                      isSessionJoinable(session.scheduledTime)
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                    whileHover={{ scale: isSessionJoinable(session.scheduledTime) ? 1.02 : 1 }}
                    whileTap={{ scale: isSessionJoinable(session.scheduledTime) ? 0.98 : 1 }}
                  >
                    <ExternalLink size={18} />
                    Join Classroom
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyGroups;