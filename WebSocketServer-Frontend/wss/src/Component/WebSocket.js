
import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

function WebSocket() {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const stompClient = new Client({
      webSocketFactory: () => new SockJS('/chat'),
      onConnect: () => {
        console.log('✅ Connected to WebSocket');
        setConnected(true);

        stompClient.subscribe('/topic/messages', (message) => {
          setMessages((prev) => [...prev, message.body]);
        });
      },
      onStompError: (frame) => {
        console.error('❌ STOMP error:', frame.headers['message']);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (client && connected && input.trim() !== '') {
      client.publish({
        destination: '/app/send',
        body: input,
      });
      setInput('');
    } else {
      console.warn('WebSocket not connected or message is empty');
    }
  };

  return (
    <div style={styles.container}>
      <h2>WebSocket Chat</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.message}>{msg}</div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button style={styles.button} onClick={sendMessage} disabled={!connected}>
          Send
        </button>
      </div>
      {!connected && <p style={{ color: 'gray' }}>Connecting to WebSocket...</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    fontFamily: 'Arial',
  },
  chatBox: {
    border: '1px solid #ccc',
    padding: '10px',
    height: '250px',
    overflowY: 'scroll',
    marginBottom: '10px',
    backgroundColor: '#f9f9f9',
  },
  message: {
    padding: '5px 0',
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '8px',
  },
  button: {
    padding: '8px 16px',
    cursor: 'pointer',
  },
};

export default WebSocket;
