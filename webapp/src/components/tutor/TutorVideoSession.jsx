import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const TutorVideoSession = () => {
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;

      // Send the stream to signaling server
      socket.send(JSON.stringify({ type: "offer", stream }));
    } catch (error) {
      console.error("Error accessing camera and microphone:", error);
    }
  };

  const stopStreaming = () => {
    const stream = videoRef.current.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach((track) => track.stop());
    videoRef.current.srcObject = null;

    // Notify signaling server to stop streaming
    socket.send(JSON.stringify({ type: "stop" }));
  };

  // Connect to signaling server when component mounts
  useEffect(() => {
      const socket = io("ws://127.0.0.1:8080");
//    const socket = io("http://127.0.0.1:8080"); // Connect to the signaling server
    logger.log("Connected to signaling server", socket);
    setSocket(socket);

    // Clean up on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  return (
    <div>
      <h2>Tutor Interface - Video Streaming</h2>
      <p>This is the tutor interface. You can start and stop streaming here.</p>
      <p>Click the buttons below to start and stop streaming.</p>
      <p>Note: You will need to allow camera and microphone access in your browser settings.</p>
      <p>Video will be displayed here:</p>

      <video ref={videoRef} autoPlay />
      <br />
      <button onClick={startStreaming}>Start Streaming</button>
      <button onClick={stopStreaming}>Stop Streaming</button>
    </div>
  );
};

export default TutorVideoSession;
