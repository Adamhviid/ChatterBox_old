import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socketRef.current = socket;

    socket.onopen = () => console.log("Connected to the server");

    socket.onmessage = async (event) => {
      const message = await event.data.text();
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    socket.onclose = () => console.log("Disconnected from the server");

    return () => socket.close();
  }, []);

  const handleSend = () => {
    if (inputValue.trim() && socketRef.current) {
      socketRef.current.send(inputValue);
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
