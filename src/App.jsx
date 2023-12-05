import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

const API_KEY = "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";

const footballKeywords = ['football', 'soccer', 'FIFA', 'UEFA', 'goal', 'World Cup', 'player', 'match', 'league', 'team'];

function isFootballQuestion(message) {
  return footballKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

function ChatButton({ onClick }) {
  return (
    <button className="chat-toggle-button" onClick={onClick}>Open Chat</button>
  );
}

function ChatInterface({ onClose, onClearChat, messages, handleSend, isTyping, handleAnswerLengthChange, answerLength }) {
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
      <div className="answer-length-controls">
        <label style={{color:'black'}}>
          <input 
            type="radio" 
            name="answerLength" 
            value="short"
            checked={answerLength === 'short'}
            onChange={handleAnswerLengthChange} 
          />
          Short Answer
        </label>
        <label style={{color:'black'}}>
          <input 
            type="radio" 
            name="answerLength" 
            value="full"
            checked={answerLength === 'full'}
            onChange={handleAnswerLengthChange} 
          />
          Full Answer
        </label>
      </div>
      <button className="close-chat-button" onClick={onClose}>Close Chat</button>
      <button className="clear-chat-button" onClick={onClearChat}>Clear Chat</button>
    </div>
  );
}

function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello! I am your assistant, I work based on the chat-GPT API. Ask me any football-related question",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [answerLength, setAnswerLength] = useState('full'); // State for answer length preference

  const handleChatToggle = () => {
    setShowChat(!showChat);
  };

  const handleAnswerLengthChange = (e) => {
    setAnswerLength(e.target.value);
  };

  const handleSend = async (message) => {
    if (!isFootballQuestion(message)) {
      setMessages([...messages, {
        message: "I can only answer football-related questions. Please ask a question about football.",
        sender: "system"
      }]);
      return;
    }

    const newMessage = {
      message,
      sender: "user"
    };

    setMessages([...messages, newMessage]);

    setIsTyping(true);
    await processMessageToChatGPT(messages.concat(newMessage));
  };

  const clearChat = () => {
    setMessages([{
      message: "Chat cleared. Start a new conversation.",
      sentTime: "just now",
      sender: "system"
    }]);
  };

  async function processMessageToChatGPT(chatMessages) {
    const apiMessages = chatMessages.map((messageObject) => ({
      role: messageObject.sender === "ChatGPT" ? "assistant" : "user",
      content: messageObject.message
    }));
  
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: apiMessages
    };
  
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });
  
      if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
      }
  
      const data = await response.json();
  
      if (data.choices && data.choices.length > 0) {
        setMessages([...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]);
      } else {
        console.error('No valid response received from API');
      }
    } catch (error) {
      console.error('Fetch error:', error.message);
      setMessages([...chatMessages, {
        message: "An error occurred while processing your request.",
        sender: "system"
      }]);
    } finally {
      setIsTyping(false);
    }
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
          handleAnswerLengthChange={handleAnswerLengthChange}
          answerLength={answerLength}
        />
      )}
    </div>
  );
}

export default App;
