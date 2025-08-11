import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const StudentVideoSession = () => {
  const videoRef = useRef(null);
  const [studentSocket, setStudentSocket] = useState(null);

  useEffect(() => {
    // Connect to signaling server when component mounts
    const socket = io("http://localhost:8080"); // Connect to the signaling server

    setStudentSocket(socket);
    logger.log(studentSocket);

    // Handle incoming messages from signaling server
    socket.on("message", (message) => {
      const data = JSON.parse(message);
      if (data.type === "offer") {
        // Handle offer from tutor
        handleOffer(data.stream);
      } else if (data.type === "stop") {
        // Handle stop signal from tutor
        handleStop();
      }
    });

    // Clean up on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const handleOffer = (stream) => {
    // Display stream from tutor
    videoRef.current.srcObject = stream;
  };

  const handleStop = () => {
    // Clear video stream
    videoRef.current.srcObject = null;
  };

  return (
    <div>
      <h2>Student Interface - Video Streaming</h2>
      <p>This is the student interface. You can watch the tutor&apos;s stream here.</p>
      <p>Video will be displayed here:</p>

      <video ref={videoRef} autoPlay />
    </div>
  );
};

export default StudentVideoSession;
