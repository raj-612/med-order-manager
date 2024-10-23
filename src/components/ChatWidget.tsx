import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { MessageCircle, X, Send } from 'lucide-react'

const apiKeyEndpoint = 'https://vqg2fafff0.execute-api.us-west-2.amazonaws.com/dev/';

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

async function fetchApiKey(): Promise<string> {
  try {
    const response = await axios.post(apiKeyEndpoint);
    const parsedBody = JSON.parse(response.data.body);
    const apiKey = parsedBody.data.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('API key not found in response');
    }
    return apiKey.trim();
  } catch (error: any) {
    console.error('Error fetching API key:', error.message);
    throw error;
  }
}

function MicrophoneIcon({ isListening }: { isListening: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-all duration-300 ${isListening ? 'text-red-500' : 'text-gray-600'}`}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I assist you today?", sender: 'bot' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    // Fetch API key when component mounts
    fetchApiKey()
      .then(key => setApiKey(key))
      .catch(error => console.error('Error fetching API key:', error))

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();

      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          setInputMessage(transcript);
          console.log('Live audio preview:', transcript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
      setIsListening(!isListening);
    }
  };

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() === '' || isLoading || !apiKey) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user'
    }

    setMessages(prevMessages => [...prevMessages, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.',
          },
          {
            role: 'user',
            content: inputMessage,
          },
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const botResponse = response.data?.choices?.[0]?.message?.content;

      if (botResponse) {
        const botMessage: Message = {
          id: messages.length + 2,
          text: botResponse,
          sender: 'bot'
        }
        setMessages(prevMessages => [...prevMessages, botMessage])
      } else {
        throw new Error('No content returned from API');
      }
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I'm sorry, but I encountered an error. Please try again later.",
        sender: 'bot'
      }
      setMessages(prevMessages => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [inputMessage, isLoading, messages, apiKey])

  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-12 h-12 bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center shadow-lg transition-colors duration-200"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white border rounded-lg shadow-lg w-80 sm:w-96 h-[32rem] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b bg-blue-500 text-white rounded-t-lg">
            <h2 className="font-semibold text-lg">Chat Support</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors duration-200"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div id="message-container" className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg p-2">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Chat message"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isListening
                    ? 'bg-red-100 hover:bg-red-200'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
              >
                <MicrophoneIcon isListening={isListening} />
                {isListening && (
                  <span className="absolute top-0 right-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                aria-label="Send message"
                disabled={isLoading}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
