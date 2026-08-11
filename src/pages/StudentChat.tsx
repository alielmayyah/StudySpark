import React, { useState, useRef, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
} from "@ionic/react";
import { sendOutline, menuOutline, closeOutline, chevronDownOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import OpenAI from "openai";
import { MdLogout, MdAdd } from "react-icons/md";
import { FaUser, FaBook } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// API Configuration
const endpoint = "https://studyspark-coremodels.services.ai.azure.com/openai/v1/";
const modelName = "DeepSeek-V3.1";
const deployment_name = "DeepSeek-V3.1";
const api_key = "4fJFzBHSueUNPTnpwnx3ySLJGd2c8cTUCuXLXC5CyPaWpan3xGx9JQQJ99BKACYeBjFXJ3w3AAAAACOGsvQg";

const client = new OpenAI({
  baseURL: endpoint,
  apiKey: api_key,
  dangerouslyAllowBrowser: true, // Required for browser-based apps
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout
});

interface ChatHistory {
  id: string;
  title: string;
  messages: { id: string; from: "ai" | "user"; text: string }[];
  timestamp: number;
}

const StudentChat: React.FC = () => {
  const history = useHistory();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [recentChats, setRecentChats] = useState<ChatHistory[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("General");
  const [childName, setChildName] = useState<string>("Student");
  const [childId, setChildId] = useState<string>("");
  
  // Available subjects
  const subjects = [
    "General",
    "Mathematics",
    "Science",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Geography",
    "Computer Science",
    "Economics",
    "Literature",
    "Art",
    "Music",
  ];
  
  const [messages, setMessages] = useState<
    { id: string; from: "ai" | "user"; text: string }[]
  >([
    {
      id: "m1",
      from: "ai",
      text:
        "Hi there! 👋 I'm your friendly teacher assistant! Ask me anything you'd like to learn - I'm here to help you explore and understand new things! ✨",
    },
  ]);

  // Load chat history and child name on mount
  useEffect(() => {
    try {
      // Load child data from localStorage
      const childData = localStorage.getItem('currentChild');
      if (childData) {
        const child = JSON.parse(childData);
        setChildName(child.name || 'Student');
        setChildId(child.id || '');
        
        // Load chat history specific to this child
        const chatHistoryKey = `chatHistory_${child.id}`;
        const savedChats = localStorage.getItem(chatHistoryKey);
        console.log(`Loading chat history for child ${child.name} (${child.id}):`, savedChats); // Debug log
        if (savedChats) {
          const chats: ChatHistory[] = JSON.parse(savedChats);
          const sortedChats = chats.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
          console.log('Sorted chats:', sortedChats); // Debug log
          setRecentChats(sortedChats);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    // Create a new chat ID for this session
    setCurrentChatId(Date.now().toString());
  }, []);

  const handleLogout = () => {
    // Save current chat before logout
    saveCurrentChat();
    // Redirect to choose role page (no longer deactivating the code)
    history.push('/chooserole');
  };

  const saveCurrentChat = () => {
    try {
      if (messages.length <= 1) return; // Don't save if only welcome message
      if (!childId) return; // Don't save if no child ID
      
      // Get the first user message as title (truncate to 50 chars)
      const firstUserMsg = messages.find(m => m.from === 'user');
      const title = firstUserMsg ? 
        (firstUserMsg.text.length > 50 ? firstUserMsg.text.substring(0, 50) + '...' : firstUserMsg.text) : 
        'New Chat';

      const chatToSave: ChatHistory = {
        id: currentChatId,
        title,
        messages,
        timestamp: Date.now()
      };

      // Use child-specific chat history key
      const chatHistoryKey = `chatHistory_${childId}`;
      const savedChats = localStorage.getItem(chatHistoryKey);
      let chats: ChatHistory[] = savedChats ? JSON.parse(savedChats) : [];
      
      // Update existing or add new
      const existingIndex = chats.findIndex(c => c.id === currentChatId);
      if (existingIndex >= 0) {
        chats[existingIndex] = chatToSave;
      } else {
        chats.unshift(chatToSave);
      }
      
      // Keep only last 50 chats
      chats = chats.slice(0, 50);
      
      localStorage.setItem(chatHistoryKey, JSON.stringify(chats));
      console.log(`Chat saved for child ${childId}. Total chats:`, chats.length); // Debug log
      setRecentChats(chats.slice(0, 10));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const handleNewChat = () => {
    // Save current chat first
    saveCurrentChat();
    
    // Reset to new chat
    setMessages([
      {
        id: "m1",
        from: "ai",
        text: "Hi there! 👋 I'm your friendly teacher assistant! Ask me anything you'd like to learn - I'm here to help you explore and understand new things! ✨",
      },
    ]);
    setCurrentChatId(Date.now().toString());
    setShowMenu(false);
  };

  const loadChat = (chat: ChatHistory) => {
    // Save current chat first
    saveCurrentChat();
    
    // Load selected chat
    setMessages(chat.messages);
    setCurrentChatId(chat.id);
    setShowMenu(false);
  };

  const formatChatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    
    const userMsg = { id: String(Date.now()), from: "user" as const, text: text.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setText("");
    setIsLoading(true);

    try {
      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({
        role: msg.from === "ai" ? ("assistant" as const) : ("user" as const),
        content: msg.text
      }));

      // Add the new user message
      conversationHistory.push({
        role: "user" as const,
        content: userMsg.text
      });

      // Create subject-specific system prompt
      const systemPrompt = selectedSubject === "General" 
        ? "You are a friendly teacher assistant helping students learn. Be encouraging, clear, and explain things step by step. When giving quizzes or tests, ALWAYS show the score in this format: 'Your score: X/Y' (e.g., 'Your score: 8/10'). For excellent scores (80%+), celebrate their achievement. For average scores (50-79%), encourage improvement. For low scores (below 50%), gently point out mistakes and offer to explain the concepts again. Always provide constructive feedback."
        : `You are a friendly teacher assistant specialized in ${selectedSubject}. You should ONLY answer questions related to ${selectedSubject}. If a question is not about ${selectedSubject}, politely redirect the student to ask about ${selectedSubject} topics. When asked to create quizzes, generate quizzes specifically about ${selectedSubject}. ALWAYS show quiz scores in this format: 'Your score: X/Y' (e.g., 'Your score: 9/10'). For excellent scores (80%+), celebrate their achievement. For average scores (50-79%), encourage improvement and highlight what they got right. For low scores (below 50%), kindly point out the mistakes, explain the correct answers, and offer to review the topic again. Be encouraging, clear, and explain things step by step.`;

      // Call OpenAI API
      const completion = await client.chat.completions.create({
        messages: [
          { role: "system" as const, content: systemPrompt },
          ...conversationHistory
        ],
        model: deployment_name,
      });
      // Add AI response to messages
      const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";
      const newMessages = [
        ...updatedMessages,
        {
          id: "ai-" + Date.now(),
          from: "ai" as const,
          text: aiResponse,
        },
      ];
      setMessages(newMessages);
      
      // Auto-save chat after each exchange
      setTimeout(() => saveCurrentChat(), 500);
    } catch (error) {
      console.error("Error calling AI API:", error);
      setMessages((m) => [
        ...m,
        {
          id: "ai-" + Date.now(),
          from: "ai",
          text: "Sorry, I encountered an error. Please make sure the API key is configured correctly.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent 
        style={{ '--background': '#121620' } as React.CSSProperties}
        fullscreen
        scrollY={false}
      >
        <div className="fixed inset-0 flex flex-col bg-[#121620] overflow-hidden" style={{ touchAction: 'pan-y' }}>
          
          {/* Header */}
          <div className="bg-[#191F2B] border-b border-[#2D3443] px-5 py-4 pt-12">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMenu(true)}
                  className="text-[#A1AAB7] hover:text-white transition-colors"
                >
                  <IonIcon icon={menuOutline} className="text-2xl" />
                </button>

                <img 
                  src="/public/grad.png" 
                  alt="StudySpark Logo" 
                  className="w-12 h-12 rounded-lg"
                />
                <div>
                  <h1 className="text-xl font-bold text-white">StudySpark Chat</h1>
                  <p className="text-sm text-[#A1AAB7]">Your learning companion</p>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="w-[45px] h-[45px] rounded-full bg-[#603030] flex items-center justify-center hover:bg-[#703838] transition-all"
              >
                <MdLogout size={22} className="text-[#ff4444]" />
              </button>
            </div>
            
            {/* Subject Selector - Enhanced Design */}
            <div className="mt-3">
              <div className="bg-gradient-to-r from-[#1B202D] to-[#1F2937] border border-[#3B4252] rounded-xl p-3 shadow-lg">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3EB0DC] to-[#DCC253] flex items-center justify-center flex-shrink-0 shadow-md">
                    <FaBook className="text-white text-lg" />
                  </div>
                  
                  {/* Dropdown Container */}
                  <div className="flex-1 relative">
                    <label className="text-[#8B95A8] text-xs font-semibold uppercase tracking-wider mb-1 block">
                      Subject Focus
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full bg-[#0F1419] border-2 border-[#2C3442] rounded-lg px-3 py-2.5 pr-10 text-white text-base font-semibold focus:outline-none focus:border-[#25AFF4] focus:ring-2 focus:ring-[#25AFF4]/20 transition-all cursor-pointer appearance-none hover:border-[#3EB0DC] shadow-inner"
                        style={{ 
                          backgroundImage: 'none',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        {subjects.map((subject) => (
                          <option key={subject} value={subject} className="bg-[#1B202D] py-2">
                            {subject}
                          </option>
                        ))}
                      </select>
                      {/* Custom Dropdown Arrow */}
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <IonIcon icon={chevronDownOutline} className="text-[#25AFF4] text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subject Badge/Indicator */}
                {selectedSubject !== "General" && (
                  <div className="mt-2 pt-2 border-t border-[#2C3442]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#25AFF4] animate-pulse"></div>
                      <span className="text-[#25AFF4] text-xs font-medium">
                        AI focused on {selectedSubject}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slide-in Menu */}
          <AnimatePresence>
            {showMenu && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 z-40"
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Menu Sidebar */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="fixed left-0 top-0 bottom-0 w-[280px] bg-[#1B202D] border-r border-[#2D3443] z-50 flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Menu Header */}
                  <div className="p-5 border-b border-[#2D3443] flex items-center justify-between">
                    <h2 className="text-white text-lg font-semibold">Menu</h2>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="text-[#A1AAB7] hover:text-white transition-colors"
                    >
                      <IonIcon icon={closeOutline} className="text-2xl" />
                    </button>
                  </div>

                  {/* Student Profile */}
                  <div className="p-5 border-b border-[#2D3443]">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3EB0DC] to-[#DCC253] flex items-center justify-center">
                        <FaUser className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{childName}</h3>
                        <p className="text-[#A1AAB7] text-sm">Learning Mode</p>
                      </div>
                    </div>
                  </div>

                  {/* New Chat Button */}
                  <div className="p-4">
                    <button
                      onClick={handleNewChat}
                      className="w-full bg-[#25AFF4] hover:bg-[#1e9fd8] text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <MdAdd size={22} />
                      New Chat
                    </button>
                  </div>

                  {/* Recent Chats */}
                  <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <h3 className="text-[#A1AAB7] text-sm font-semibold mb-3 px-2">Recent Chats</h3>
                    {recentChats.length === 0 ? (
                      <p className="text-[#A1AAB7] text-sm px-2 text-center mt-8">No recent chats yet</p>
                    ) : (
                      <div className="space-y-2">
                        {recentChats.map((chat) => (
                          <div
                            key={chat.id}
                            className={`bg-[#121620] hover:bg-[#1a2030] border rounded-lg p-3 cursor-pointer transition-all ${
                              chat.id === currentChatId ? 'border-[#25AFF4]' : 'border-[#2D3443]'
                            }`}
                            onClick={() => loadChat(chat)}
                          >
                            <p className="text-white text-sm font-medium truncate">{chat.title}</p>
                            <p className="text-[#A1AAB7] text-xs mt-1">{formatChatDate(chat.timestamp)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Chat messages area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-6"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="space-y-4 max-w-3xl mx-auto">
              {/* Greeting Message */}
              <div className="text-center py-4">
                <h2 className="text-2xl font-bold text-white mb-2">👋 Hey {childName}!</h2>
                <p className="text-[#A1AAB7] text-sm">Ready to learn something new today?</p>
              </div>
              {messages.map((m) =>
                m.from === "ai" ? (
                  <div key={m.id} className="flex items-start gap-3">
                    {/* AI avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3EB0DC] to-[#DCC253] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🤖</span>
                    </div>

                    {/* AI message bubble */}
                    <div className="bg-[#1B202D] border border-[#2C3442] rounded-lg p-4 max-w-[75%]">
                      <p className="text-sm text-[#E4E7EB] leading-relaxed whitespace-pre-wrap">
                        {m.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex items-end justify-end">
                    <div className="bg-[#25AFF4] rounded-lg px-4 py-3 max-w-[75%]">
                      <p className="text-sm leading-relaxed text-black">{m.text}</p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Input area */}
          <div className="bg-[#1B202D] border-t border-[#2C3442] px-5 py-4">
            <div className="flex items-center gap-3 max-w-3xl mx-auto">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading) handleSend();
                }}
                placeholder={isLoading ? "AI is thinking..." : "Ask me anything..."}
                disabled={isLoading}
                className="flex-1 bg-[#121620] border border-[#2C3442] rounded-lg px-4 py-3 text-white placeholder-[#A1AAB7] focus:outline-none focus:border-[#25AFF4] transition-colors disabled:opacity-50"
              />

              <button
                onClick={handleSend}
                disabled={!text.trim() || isLoading}
                className="w-11 h-11 rounded-lg bg-[#25AFF4] flex items-center justify-center hover:bg-[#1e9fd8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <IonIcon icon={sendOutline} className="text-white text-lg" />
                )}
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StudentChat;
