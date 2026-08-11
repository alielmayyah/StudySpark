import React, { useState, useRef, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonIcon,
} from "@ionic/react";
import { arrowBackOutline, sendOutline, menuOutline, closeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import OpenAI from "openai";
import { getCurrentUser, getUserData } from "../firebase/auth";
import { getChildren } from "../firebase/firestore";
import { Child } from "../types";
import { MdAdd } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// API Configuration
const endpoint = "https://studyspark-coremodels.services.ai.azure.com/openai/v1/";
const modelName = "DeepSeek-V3.1";
const deployment_name = "DeepSeek-V3.1";
const api_key = "4fJFzBHSueUNPTnpwnx3ySLJGd2c8cTUCuXLXC5CyPaWpan3xGx9JQQJ99BKACYeBjFXJ3w3AAAAACOGsvQg";

const client = new OpenAI({
  baseURL: endpoint,
  apiKey: api_key,
  dangerouslyAllowBrowser: true // Required for browser-based apps
});

interface ChatHistory {
  id: string;
  title: string;
  messages: { id: string; from: "ai" | "user"; text: string }[];
  timestamp: number;
}

const ParentChat: React.FC = () => {
  const history = useHistory();
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenData, setChildrenData] = useState<string>("");
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [parentName, setParentName] = useState<string>("Parent");
  const [parentId, setParentId] = useState<string>("");
  const [showMenu, setShowMenu] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string>("");
  const [recentChats, setRecentChats] = useState<ChatHistory[]>([]);
  const [messages, setMessages] = useState<
    { id: string; from: "ai" | "user"; text: string }[]
  >([
    {
      id: "m1",
      from: "ai",
      text:
        "Hello! 👋 I'm your AI assistant for tracking and understanding your child's learning progress. Feel free to ask me about their strengths, areas for improvement, study recommendations, or any educational concerns you may have! 📊✨",
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Load parent's chat history on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setParentId(currentUser.uid);
      
      // Load parent's chat history
      try {
        const chatHistoryKey = `parentChatHistory_${currentUser.uid}`;
        const savedChats = localStorage.getItem(chatHistoryKey);
        if (savedChats) {
          const chats: ChatHistory[] = JSON.parse(savedChats);
          const sortedChats = chats.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
          setRecentChats(sortedChats);
        }
      } catch (error) {
        console.error('Error loading parent chat history:', error);
      }
      
      // Create new chat ID
      setCurrentChatId(Date.now().toString());
    }
  }, []);

  // Load parent's children and their chat histories
  useEffect(() => {
    const loadChildrenData = async () => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          history.push('/login');
          return;
        }

        // Load parent's name
        try {
          const userData = await getUserData(currentUser.uid);
          if (userData && userData.displayName) {
            setParentName(userData.displayName);
          } else if (currentUser.displayName) {
            setParentName(currentUser.displayName);
          } else if (currentUser.email) {
            setParentName(currentUser.email.split('@')[0]);
          }
        } catch (error) {
          console.error('Error loading parent name:', error);
        }

        // Get parent's children
        const childrenList = await getChildren(currentUser.uid);
        setChildren(childrenList);

        // Load each child's chat history
        let dataText = "\n\n=== YOUR CHILDREN'S LEARNING DATA ===\n\n";
        
        if (childrenList.length === 0) {
          dataText += "You don't have any children registered yet.\n";
        } else {
          for (const child of childrenList) {
            dataText += `\n--- ${child.name} (Age: ${child.age}, Grade: ${child.grade}) ---\n`;
            dataText += `Access Code: ${child.accessCode}\n`;
            
            // Load child's chat history from localStorage
            const chatHistoryKey = `chatHistory_${child.id}`;
            const savedChats = localStorage.getItem(chatHistoryKey);
            
            if (savedChats) {
              const chats = JSON.parse(savedChats);
              dataText += `\nRecent Learning Sessions (${chats.length} total):\n`;
              
              // Get last 5 chats for analysis
              const recentChats = chats.slice(0, 5);
              recentChats.forEach((chat: any, index: number) => {
                dataText += `\n  Session ${index + 1}: ${chat.title}\n`;
                dataText += `  Date: ${new Date(chat.timestamp).toLocaleString()}\n`;
                dataText += `  Conversation:\n`;
                
                // Include conversation messages
                chat.messages.forEach((msg: any) => {
                  if (msg.from === 'user') {
                    dataText += `    ${child.name} asked: ${msg.text}\n`;
                  } else {
                    // Only include first 200 chars of AI response to keep context manageable
                    const aiText = msg.text.length > 200 ? msg.text.substring(0, 200) + '...' : msg.text;
                    dataText += `    AI responded: ${aiText}\n`;
                  }
                });
              });
            } else {
              dataText += `\nNo learning sessions yet for ${child.name}.\n`;
            }
            dataText += "\n" + "=".repeat(50) + "\n";
          }
        }

        setChildrenData(dataText);
        console.log('Children data loaded:', dataText);
        
        // Update welcome message with children's names
        if (childrenList.length > 0) {
          const childNames = childrenList.map(c => c.name).join(', ');
          const welcomeText = childrenList.length === 1 
            ? `Hello! 👋 I'm your AI assistant tracking ${childNames}'s learning progress. Ask me anything about their studies, progress, or what they've been learning! 📊✨`
            : `Hello! 👋 I'm your AI assistant tracking your children's learning progress (${childNames}). Ask me about any of them - their studies, progress, or what they've been learning! 📊✨`;
          
          setMessages([{
            id: "m1",
            from: "ai",
            text: welcomeText,
          }]);
        }
      } catch (error) {
        console.error('Error loading children data:', error);
      } finally {
        setLoadingChildren(false);
      }
    };

    loadChildrenData();
  }, [history]);

  useEffect(() => {
    // scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-save chat when messages change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messages.length > 1) {
        saveCurrentChat();
      }
    }, 2000); // Save 2 seconds after last message

    return () => clearTimeout(timer);
  }, [messages]);

  const saveCurrentChat = () => {
    try {
      if (messages.length <= 1) return; // Don't save if only welcome message
      if (!parentId) return; // Don't save if no parent ID
      
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

      // Use parent-specific chat history key
      const chatHistoryKey = `parentChatHistory_${parentId}`;
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
      console.log(`Chat saved for parent ${parentId}. Total chats:`, chats.length);
      setRecentChats(chats.slice(0, 10));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const handleNewChat = () => {
    // Save current chat first
    saveCurrentChat();
    
    // Reset to new chat
    const welcomeText = children.length > 0 
      ? (children.length === 1 
        ? `Hello! 👋 I'm your AI assistant tracking ${children[0].name}'s learning progress. Ask me anything about their studies, progress, or what they've been learning! 📊✨`
        : `Hello! 👋 I'm your AI assistant tracking your children's learning progress (${children.map(c => c.name).join(', ')}). Ask me about any of them - their studies, progress, or what they've been learning! 📊✨`)
      : "Hello! 👋 I'm your AI assistant for tracking and understanding your child's learning progress. Feel free to ask me about their strengths, areas for improvement, study recommendations, or any educational concerns you may have! 📊✨";
    
    setMessages([
      {
        id: "m1",
        from: "ai",
        text: welcomeText,
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

  const handleSend = async () => {
    if (!text.trim() || isLoading) return;
    
    const userMsg = { id: String(Date.now()), from: "user" as const, text: text.trim() };
    setMessages((m) => [...m, userMsg]);
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

      // Build system prompt with children's data
      const systemPrompt = `You are an AI assistant helping parents track and understand their child's learning progress. You have access to real data about their children's learning activities.

${childrenData}

Based on the learning data above, you can:
- Tell the parent about what their child has been learning
- Identify topics their child asked about
- Analyze their child's interests and curiosity patterns
- Suggest areas where the child might need more support
- Recommend study plans or learning resources
- Provide insights about their learning behavior

When the parent asks about their child:
1. Reference specific questions or topics from their chat history
2. Mention recent learning sessions and dates
3. Identify patterns in what they're studying
4. Be specific and data-driven in your responses
5. Be supportive, informative, and professional

If no learning data exists for a child yet, gently let the parent know and encourage their child to start using StudySpark.`;

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
      setMessages((m) => [
        ...m,
        {
          id: "ai-" + Date.now(),
          from: "ai",
          text: aiResponse,
        },
      ]);
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
      >
        <div className="fixed inset-0 flex flex-col bg-[#121620] overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#191F2B] border-b border-[#2D3443] px-5 py-4 pt-12">
            <div className="flex items-center justify-between gap-3 mb-3">
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
                  <h1 className="text-xl font-bold text-white">Parent Assistant</h1>
                  <p className="text-sm text-[#A1AAB7]">Track your child's progress</p>
                </div>
              </div>
              
              <button
                onClick={() => history.goBack()}
                className="text-[#A1AAB7] hover:text-white transition-colors"
              >
                <IonIcon icon={arrowBackOutline} className="text-2xl" />
              </button>
            </div>
            
            {/* Parent Greeting */}
            <div className="mt-2">
              <h2 className="text-white text-lg font-semibold">
                👋 Hi {parentName}!
              </h2>
              <p className="text-[#A1AAB7] text-sm mt-1">
                Let's see how your {children.length === 1 ? 'child is' : 'children are'} doing
              </p>
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

                  {/* Parent Profile */}
                  <div className="p-5 border-b border-[#2D3443]">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3EB0DC] to-[#DCC253] flex items-center justify-center">
                        <FaUser className="text-white text-xl" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{parentName}</h3>
                        <p className="text-[#A1AAB7] text-sm">Parent Mode</p>
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
                placeholder={isLoading ? "AI is thinking..." : "Ask about your child's progress..."}
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

export default ParentChat;
