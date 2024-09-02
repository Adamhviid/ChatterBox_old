import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import "./App.css";

interface Message {
  message: string;
  userId: string;
  sentAt: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WSS_URL || "");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to the server");
      // Request the last 25 messages
      socket.send(JSON.stringify({ type: "load_messages" }));
    };

    socket.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      console.log(messageData);

      if (messageData.type === "load_messages" && Array.isArray(messageData.messages)) {
        // Handle the initial load of messages
        const formattedMessages = messageData.messages.map((msg: Message) => {
          const { message, userId, sentAt } = msg;
          const date = moment(sentAt);
          if (!date.isValid()) {
            console.error("Invalid date:", sentAt);
            return `(${sentAt}) ${userId}: ${message}`;
          }
          const formattedDate = date.calendar();
          return `(${formattedDate}) ${userId}: ${message}`;
        });
        setMessages(formattedMessages);
      } else {
        // Handle a single incoming message
        const { message, userId, sentAt } = messageData;
        const date = moment(sentAt);
        if (!date.isValid()) {
          console.error("Invalid date:", sentAt);
          setMessages((prevMessages) => [...prevMessages, `(${sentAt}) ${userId}: ${message}`]);
          return;
        }
        const formattedDate = date.calendar();
        const formattedMessage = `(${formattedDate}) ${userId}: ${message}`;
        setMessages((prevMessages) => [...prevMessages, formattedMessage]);
      }
    };

    socket.onclose = () => console.log("Disconnected from the server");

    return () => socket.close();
  }, []);

  const handleSend = () => {
    if (inputValue.trim() && socketRef.current) {
      const message = JSON.stringify({ message: inputValue });
      socketRef.current.send(message);
      setInputValue("");
    }
  };

  return (
    <div className="container">
      <h1>Chatterbox</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button
        type="submit"
        onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

export default App;
