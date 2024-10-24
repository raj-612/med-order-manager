import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import axios from 'axios'
import { MessageCircle, X, Send, Mic, Keyboard, User, Bot } from 'lucide-react'

const apiKeyEndpoint = 'https://vqg2fafff0.execute-api.us-west-2.amazonaws.com/dev/';

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

const assistantId = 'asst_gY0S9rOLFhIwTJcaOZ9SM3iU';

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I assist you today?", sender: 'bot' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)
  const threadIdRef = useRef<string | null>(null)
  const runIdRef = useRef<string | null>(null)
  const transcriptRef = useRef<string>('')
  const micRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    fetchApiKey()
      .then(key => setApiKey(key))
      .catch(error => {
        console.error('Failed to fetch API key:', error);
        setError('Failed to initialize chat. Please try again later.');
      });
  }, []);

  const axiosInstance = useMemo(() => {
    if (!apiKey) return null;
    return axios.create({
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });
  }, [apiKey]);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const createThread = useCallback(async () => {
    if (threadIdRef.current) return threadIdRef.current;
    
    if (!axiosInstance) {
      throw new Error('API is not initialized');
    }

    try {
      const response = await axiosInstance.post('https://api.openai.com/v1/threads', {});
      threadIdRef.current = response.data.id;
      return response.data.id;
    } catch (error: any) {
      console.error('Error creating thread:', error);
      throw new Error(`Failed to create thread: ${error.message}`);
    }
  }, [axiosInstance]);

  const addMessageToThread = useCallback(async (threadId: string, content: string) => {
    if (!axiosInstance) {
      throw new Error('API is not initialized');
    }

    try {
      await axiosInstance.post(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        role: 'user',
        content: content
      });
    } catch (error: any) {
      console.error('Error adding message to thread:', error);
      throw new Error(`Failed to add message to thread: ${error.message}`);
    }
  }, [axiosInstance]);

  const runAssistant = useCallback(async (threadId: string) => {
    if (!axiosInstance) {
      throw new Error('API is not initialized');
    }

    try {
      const response = await axiosInstance.post(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        assistant_id: assistantId
      });
      runIdRef.current = response.data.id;
      return response.data.id;
    } catch (error: any) {
      console.error('Error running assistant:', error);
      throw new Error(`Failed to run assistant: ${error.message}`);
    }
  }, [axiosInstance]);

  const checkRunStatus = useCallback(async (threadId: string, runId: string) => {
    if (!axiosInstance) {
      throw new Error('API is not initialized');
    }

    try {
      const response = await axiosInstance.get(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`);
      return response.data.status;
    } catch (error: any) {
      console.error('Error checking run status:', error);
      throw new Error(`Failed to check run status: ${error.message}`);
    }
  }, [axiosInstance]);

  const getAssistantResponse = useCallback(async (threadId: string) => {
    if (!axiosInstance) {
      throw new Error('API is not initialized');
    }

    try {
      const response = await axiosInstance.get(`https://api.openai.com/v1/threads/${threadId}/messages`);
      return response.data.data[0].content[0].text.value;
    } catch (error: any) {
      console.error('Error getting assistant response:', error);
      throw new Error(`Failed to get assistant response: ${error.message}`);
    }
  }, [axiosInstance]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (message.trim() === '' || isLoading || !axiosInstance) {
      if (!axiosInstance) {
        setError("Chat is not ready yet. Please try again in a moment.");
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userMessage: Message = {
        id: Date.now(),
        text: message,
        sender: 'user'
      };

      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInputMessage('');

      const threadId = await createThread();
      
      if (runIdRef.current) {
        const status = await checkRunStatus(threadId, runIdRef.current);
        if (status === 'in_progress') {
          throw new Error('A previous request is still being processed. Please wait.');
        }
      }

      await addMessageToThread(threadId, message);
      const runId = await runAssistant(threadId);

      let status;
      do {
        await new Promise(resolve => setTimeout(resolve, 1000));
        status = await checkRunStatus(threadId, runId);
      } while (status === 'queued' || status === 'in_progress');

      if (status === 'completed') {
        const assistantResponse = await getAssistantResponse(threadId);
        if (assistantResponse) {
          const botMessage: Message = {
            id: Date.now(),
            text: assistantResponse,
            sender: 'bot'
          };
          setMessages(prevMessages => [...prevMessages, botMessage]);
        } else {
          throw new Error('No response from assistant');
        }
      } else {
        throw new Error(`Assistant run failed with status: ${status}`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || "An error occurred while processing your message. Please try again.");
    } finally {
      setIsLoading(false);
      runIdRef.current = null;
    }
  }, [isLoading, axiosInstance, createThread, addMessageToThread, runAssistant, checkRunStatus, getAssistantResponse]);

  const initializeSpeechRecognition = useCallback(() => {
    if (micRef.current) {
      micRef.current.stop();
    }
    micRef.current = new SpeechRecognition();
    micRef.current.continuous = true;
    micRef.current.interimResults = true;
    micRef.current.lang = 'en-US';

    micRef.current.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");
      console.log(transcript);
      transcriptRef.current = transcript;
    };

    micRef.current.onerror = (event) => {
      console.log(event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
    };

    micRef.current.onend = () => {
      console.log("Speech recognition ended");
      if (isListening) {
        startListening();
      }
    };
  }, [isListening]);

  const startListening = useCallback(() => {
    initializeSpeechRecognition();
    if (micRef.current) {
      micRef.current.start();
      setIsListening(true);
      setRecordingTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  }, [initializeSpeechRecognition]);

  const stopListening = useCallback(() => {
    if (micRef.current) {
      micRef.current.stop();
      setIsListening(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
      if (transcriptRef.current.trim()) {
        handleSendMessage(transcriptRef.current.trim());
        transcriptRef.current = '';
      }
    }
  }, [handleSendMessage]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (micRef.current) {
        micRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  }, [inputMessage, handleSendMessage]);

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-8 h-8" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white border rounded-2xl shadow-2xl w-80 sm:w-96 h-[36rem] flex flex-col overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <h2 className="font-bold text-xl">Chat Support</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors duration-200"
              aria-label="Close chat"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div id="message-container" className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex items-end space-x-2 max-w-[75%] ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`rounded-full p-2 ${
                    message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl p-3 ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    {message.text}
                  </div>
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
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-100 text-red-800 rounded-lg p-2">
                  {error}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t">
            {isListening && (
              <div className="flex justify-center items-center mb-2">
                <div className="text-sm font-medium text-gray-500">
                  <span className="flex items-center">
                    <span className="mr-2">Recording</span>
                    <span className="flex space-x-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </span>
                  </span>
                </div>
              </div>
            )}
            {showKeyboard && !isListening && (
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Chat message"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 transition-colors duration-200"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            )}
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={toggleListening}
                className={`p-3  rounded-full transition-all duration-300 flex items-center ${
                  isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                } hover:scale-110`}
                aria-label={isListening ? 'Stop listening' : 'Start listening'}
              >
                <Mic className="w-6 h-6" />
                {isListening && (
                  <span className="ml-2 text-sm font-medium">{formatTime(recordingTime)}</span>
                )}
              </button>
              <button
                onClick={() => {
                  setShowKeyboard(!showKeyboard);
                  setInputMessage('');
                }}
                className={`p-3 rounded-full transition-all duration-300 ${
                  showKeyboard ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                } hover:scale-110`}
                aria-label={showKeyboard ? 'Hide keyboard' : 'Show keyboard'}
              >
                <Keyboard className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
