import { useState } from 'react';
import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';

const API_KEY = "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";

const medicalKeywords = [
  'Medicine', 'Pharmaceuticals', 'Prescription', 'Drug', 'Pharmacy',
  'Medication', 'Health', 'Treatment', 'Pill', 'Capsule',
  'Therapy', 'Antibiotics', 'Vitamins', 'Supplements', 'Dosage',
  'Clinical', 'Pharmacology', 'Biomedicine', 'Vaccine', 'OTC',
  'Pharmacotherapy', 'Chemotherapy', 'Side Effects', 'Drug Interaction', 'Medical Research',
  'Pharmacodynamics', 'Pharmacokinetics', 'Generic Drug', 'Brand-name Drug', 'Drug Formulation',
  'Drug Administration', 'Drug Safety', 'Clinical Trials', 'FDA', 'Drug Development',
  'Drug Discovery', 'Drug Approval', 'Medical Prescription', 'Drug Resistance', 'Drug Compliance',
  'Drug Therapy', 'Pharmaceutical Industry', 'Pharmaceutics', 'Drug Delivery', 'Drug Efficacy',
  'Drug Regulation', 'Biopharmaceutics', 'Pharmacovigilance', 'Medicinal Chemistry', 'Drug Metabolism'
];

function isMedicalQuestion(message) {
  const foundKeyword = medicalKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
  console.log(`Message: ${message}, Found Keyword: ${foundKeyword}`);
  return foundKeyword;
}

function ChatButton({ onClick }) {
  return (
    <Button variant="contained" color="primary" onClick={onClick} startIcon={<ChatIcon />}>
      Open Chat
    </Button>
  );
}

function ChatInterface({ onClose, onClearChat, messages, handleSend, isTyping }) {
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = () => {
    if (inputMessage.trim() !== '') {
      handleSend(inputMessage);
      setInputMessage('');
    }
  };

  return (
    <Paper elevation={3} className="chat-container">
      <Box className="message-list">
        {messages.map((message, index) => (
          <Paper key={index} elevation={1} className={`message ${message.sender === 'ChatGPT' ? 'received' : 'sent'}`}>
            <Typography variant="body1">{message.message}</Typography>
          </Paper>
        ))}
        {isTyping && <Typography className="typing-indicator">Chat is typing...</Typography>}
      </Box>

      <Box display="flex" alignItems="center" p={1}  >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type message here"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
          style={{ marginRight: '8px' }}
        />
        <IconButton color="primary" onClick={handleSubmit}>
          <SendIcon />
        </IconButton>
      </Box>

      <Box display="flex" justifyContent="flex-end" p={1}>
        <IconButton color="secondary" onClick={onClose}>
          <CloseIcon />
          <Typography variant="caption">Close Chat</Typography>
        </IconButton>
        <IconButton onClick={onClearChat}>
          <ClearIcon />
          <Typography variant="caption">Clear</Typography>
        </IconButton>
      </Box>
    </Paper>
  );
}

function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello! I am your assistant, Ask me any questions.",
      sentTime: "just now",
      sender: "ChatGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleChatToggle = () => {
    setShowChat(!showChat);
  };

  const handleSend = async (message) => {
    console.log("Message sent:", message); // Debugging log
    if (!isMedicalQuestion(message)) {
      setMessages([...messages, {
        message: "I can only answer medication-related questions. Please ask a question about medication.",
        sender: "system"
      }]);
      return;
    }

    const newMessage = {
      message,
      sender: "user"
    };

    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];
      processMessageToChatGPT(updatedMessages);
      return updatedMessages;
    });

    setIsTyping(true);
  };

  const clearChat = () => {
    setMessages([{
      message: "Chat cleared. Start a new conversation.",
      sentTime: "just now",
      sender: "system"
    }]);
  };

  // async function processMessageToChatGPT(chatMessages) {
  //   const apiMessages = chatMessages.map((messageObject) => ({
  //     role: messageObject.sender === "ChatGPT" ? "assistant" : "user",
  //     content: messageObject.message
  //   }));

  //   const apiRequestBody = {
  //     model: "gpt-3.5-turbo",
  //     messages: apiMessages
  //   };

  //   try {
  //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
  //       method: "POST",
  //       headers: {
  //         "Authorization": `Bearer ${API_KEY}`,
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify(apiRequestBody)
  //     });

  //     if (!response.ok) {
  //       const errorDetails = await response.text();
  //       throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
  //     }

  //     const data = await response.json();
  //     console.log("API Response:", data); // Debugging log

  //     if (data.choices && data.choices.length > 0) {
  //       setMessages(prevMessages => [...prevMessages, {
  //         message: data.choices[0].message.content,
  //         sender: "ChatGPT"
  //       }]);
  //     } else {
  //       console.error('No valid response received from API');
  //     }
  //   } catch (error) {
  //     console.error('Fetch error:', error.message);
  //     setMessages(prevMessages => [...prevMessages, {
  //       message: "An error occurred while processing your request.",
  //       sender: "system"
  //     }]);
  //   } finally {
  //     setIsTyping(false);
  //   }
  // }





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
        setMessages(prevMessages => [...prevMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT"
        }]);
      } else {
        console.error('No valid response received from API');
      }
    } catch (error) {
      console.error('Fetch error:', error.message);
      setMessages(prevMessages => [...prevMessages, {
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
        />
      )}
    </div>
  );
}

export default App;
