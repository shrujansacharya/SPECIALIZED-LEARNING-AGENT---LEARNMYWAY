import React, { useState, useEffect, useRef } from "react";
import { auth } from "../lib/firebase";

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

const VideoClasses: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [sessionName, setSessionName] = useState("");
  const [standard, setStandard] = useState("");
  const [roomName, setRoomName] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionName || !standard || !scheduledTime) {
      alert("Please enter session name, standard, and scheduled time.");
      return;
    }
    setIsCreating(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Teacher not authenticated");
      }
      const idToken = await user.getIdToken();

      const room = `${standard}-${sessionName}`.replace(/\s+/g, "");
      const joinLink = `https://meet.jit.si/${room}`;

      // Create session record in backend
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5001"}/api/create-session-simple`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            sessionName,
            subject: "Video Class",
            topic: sessionName,
            description: `Live video class for ${standard}`,
            targetClass: standard,
            teacherId: user.uid, // Use authenticated teacher's UID
            joinLink, // Ensure backend includes this in notification
            scheduledTime: new Date(scheduledTime).toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create session");
      }

      const data = await response.json();
      setRoomName(room);
      alert(`Session created successfully! Join link: ${data.joinLink}\nStudents have been notified.`);
    } catch (error) {
      console.error("Error creating session:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Load Jitsi Meet External API script dynamically
  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => console.log("Jitsi Meet API script loaded");
      script.onerror = () => setError("Failed to load Jitsi Meet API");
      document.body.appendChild(script);
    }
  }, []);

  // Initialize Jitsi Meet
  useEffect(() => {
    if (roomName && jitsiContainerRef.current && window.JitsiMeetExternalAPI) {
      const domain = "meet.jit.si";
      const options = {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: 600,
        userInfo: {
          displayName: "Teacher",
        },
      };

      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
      setApi(jitsiApi);

      return () => {
        if (jitsiApi) {
          jitsiApi.dispose();
        }
      };
    }
  }, [roomName]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {!roomName ? (
        <form onSubmit={createSession} className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Create Video Class
          </h2>
          <input
            type="text"
            placeholder="Enter Session Name"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="text"
            placeholder="Enter Standard (e.g., 8th Grade)"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Session"}
          </button>
        </form>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Video Class: {sessionName} ({standard})
          </h2>
          <div ref={jitsiContainerRef} className="w-full h-[600px]"></div>
        </div>
      )}
      <button
        onClick={onBack}
        className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
      >
        Back
      </button>
    </div>
  );
};

export default VideoClasses;