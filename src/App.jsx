import { useState } from 'react';
import './App.css';

// Your existing imports
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const API_KEY = "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";

// System message definition remains the same
const systemMessage = {
  "role": "system",
  "content": "Explain things like you're talking to a software professional with 2 years of experience."
};

function ChatButton({ onClick }) {
  return (
    <button className="chat-toggle-button" onClick={onClick}>Open Chat</button>
  );
}

function ChatInterface({ onClose, onClearChat, messages, handleSend, isTyping }) {
  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender === 'ChatGPT' ? 'received' : 'sent'}`}>
            {message.message}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">ChatGPT is typing...</div>}
      </div>
      <input 
        className="message-input" 
        placeholder="Type message here" 
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSend(e.target.value);
            e.target.value = '';
          }
        }} 
      />
      <button className="close-chat-button" onClick={onClose}>Close Chat</button>
      <button className="clear-chat-button" onClick={onClearChat}>Clear Chat</button>
    </div>
  );
}

function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello! I am your assistant, I work based on the chat-GPT API. Ask me any question",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleChatToggle = () => {
    setShowChat(!showChat);
  };

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  const clearChat = () => {
    setMessages([{
      message: "Chat cleared. Start a new conversation.",
      sentTime: "just now",
      sender: "system"
    }]);
    // Optionally, add setShowChat(false) and setIsTyping(false) if needed
  };

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message }
    });

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [systemMessage, ...apiMessages]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "ChatGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      {!showChat && <ChatButton onClick={handleChatToggle} />}
      {showChat && (
        <ChatInterface
          onClose={handleChatToggle}
          onClearChat={clearChat}
          messages={messages}
          handleSend={handleSend}
          isTyping={isTyping}
        />
      )}
    </div>
  );
}

export default App;
