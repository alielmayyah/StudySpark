import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaBookOpen, FaChartLine } from "react-icons/fa";
import { MdSchool, MdDelete, MdEmail } from "react-icons/md";
import { getCurrentUser, generateAccessCode } from "../firebase/auth";
import { getChildren, deleteChild } from "../firebase/firestore";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import { Child } from "../types";
import { sendAccessCodeEmail } from "../services/emailService";
import { useAuth } from "../contexts/AuthContext";

const MyChildren = () => {
  const history = useHistory();
  const { currentUser } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const loadChildren = async () => {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        setError('Please sign in to view your children.');
        setTimeout(() => history.push('/login'), 2000);
        return;
      }

      try {
        const childrenData = await getChildren(currentUser.uid);
        setChildren(childrenData);
      } catch (err: any) {
        setError(err.message || 'Failed to load children');
        console.error('Error loading children:', err);
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, [history]);

  // Refresh progress when page becomes visible (e.g., returning from child's activity)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setRefreshTrigger(prev => prev + 1); // Trigger progress recalculation
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle sending access code to email
  const handleSendAccessCode = async () => {
    // Get the current Firebase user
    const firebaseUser = getCurrentUser();
    
    if (!firebaseUser || !firebaseUser.email) {
      setError('Unable to send email. Please make sure you are signed in.');
      alert('Please sign in to send access codes.');
      return;
    }

    const currentChild = children[selectedChildIndex];
    setSendingEmail(true);
    setError("");

    try {
      // Generate a new access code
      const newAccessCode = generateAccessCode();
      
      // Update the access code in Firestore
      const childRef = doc(db, 'children', currentChild.id);
      await updateDoc(childRef, {
        accessCode: newAccessCode,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      const updatedChildren = [...children];
      updatedChildren[selectedChildIndex] = {
        ...currentChild,
        accessCode: newAccessCode
      };
      setChildren(updatedChildren);
      
      // Send email with the new code
      const parentName = firebaseUser.displayName || firebaseUser.email.split('@')[0];
      await sendAccessCodeEmail(
        firebaseUser.email,
        parentName,
        currentChild.name,
        newAccessCode
      );
      
      alert(`New access code for ${currentChild.name} has been sent to ${firebaseUser.email}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send access code. Please try again.');
      console.error('Email sending error:', err);
      alert('Failed to send access code. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  // Handle delete child
  const handleDeleteChild = async () => {
    const user = getCurrentUser();
    if (!user) {
      setError('Please sign in to delete children.');
      return;
    }

    const currentChild = children[selectedChildIndex];
    
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete ${currentChild.name}?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await deleteChild(currentChild.id, user.uid);
      
      // Remove child from local state
      const updatedChildren = children.filter((_, index) => index !== selectedChildIndex);
      setChildren(updatedChildren);
      
      // Adjust selected index if needed
      if (selectedChildIndex >= updatedChildren.length && updatedChildren.length > 0) {
        setSelectedChildIndex(updatedChildren.length - 1);
      } else if (updatedChildren.length === 0) {
        setSelectedChildIndex(0);
      }
      
      alert(`${currentChild.name} has been deleted successfully.`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete child');
      console.error('Delete error:', err);
      alert('Failed to delete child. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Calculate real progress based on child's learning activity
  const calculateChildProgress = (childId: string): number => {
    try {
      // Load child's chat history
      const chatHistoryKey = `chatHistory_${childId}`;
      const savedChats = localStorage.getItem(chatHistoryKey);
      
      if (!savedChats) return 0; // No activity yet
      
      const chats = JSON.parse(savedChats);
      let totalProgress = 0;
      
      // 1. Base Progress: Learning Sessions (0-40 points)
      // More sessions = more learning
      const sessionCount = chats.length;
      const sessionProgress = Math.min(sessionCount * 2, 40); // 2 points per session, max 40
      totalProgress += sessionProgress;
      
      // 2. Quiz & Assessment Progress (0-30 points)
      // Look for quiz mentions and scores in chat
      // Good scores ADD points, poor scores SUBTRACT points
      let quizPoints = 0;
      let quizMentions = 0;
      let goodScores = 0;
      let poorScores = 0;
      
      chats.forEach((chat: any) => {
        chat.messages?.forEach((msg: any) => {
          const text = msg.text.toLowerCase();
          
          // Detect quiz mentions
          if (text.includes('quiz') || text.includes('test') || text.includes('assessment') || text.includes('score')) {
            
            // Detect scores (10/10, 9/10, 8/10, etc.)
            const scorePattern = /(\d+)\s*\/\s*(\d+)/g;
            const matches = text.matchAll(scorePattern);
            for (const match of matches) {
              const score = parseInt(match[1]);
              const total = parseInt(match[2]);
              if (total > 0) {
                const percentage = (score / total) * 100;
                
                if (percentage >= 80) {
                  // Excellent score: +5 points
                  goodScores++;
                  quizPoints += 5;
                } else if (percentage >= 70) {
                  // Good score: +3 points
                  quizPoints += 3;
                } else if (percentage >= 50) {
                  // Average score: +1 point
                  quizPoints += 1;
                } else {
                  // Poor score (below 50%): -3 points (mistakes penalty)
                  poorScores++;
                  quizPoints -= 3;
                }
              }
            }
            
            if (!text.match(scorePattern)) {
              // Quiz mentioned but no score shown yet: +2 points for attempt
              quizMentions++;
            }
          }
        });
      });
      
      // Add base points for quiz attempts
      quizPoints += Math.min(quizMentions * 2, 10);
      
      // Cap quiz points between 0 and 30
      quizPoints = Math.max(0, Math.min(quizPoints, 30));
      totalProgress += quizPoints;
      
      // 3. Engagement Progress: Number of questions (0-20 points)
      let questionCount = 0;
      chats.forEach((chat: any) => {
        chat.messages?.forEach((msg: any) => {
          if (msg.from === 'user' && msg.text.trim().length > 0) {
            questionCount++;
          }
        });
      });
      
      const engagementProgress = Math.min(questionCount, 20); // 1 point per question, max 20
      totalProgress += engagementProgress;
      
      // 4. Consistency Progress: Study over multiple days (0-10 points)
      const timestamps = chats.map((chat: any) => chat.timestamp);
      const uniqueDays = new Set(
        timestamps.map((ts: number) => new Date(ts).toDateString())
      );
      const consistencyProgress = Math.min(uniqueDays.size * 2, 10); // 2 points per day, max 10
      totalProgress += consistencyProgress;
      
      // Return capped at 100
      return Math.min(Math.round(totalProgress), 100);
      
    } catch (error) {
      console.error('Error calculating progress:', error);
      return 0;
    }
  };

  // Animate progress counter
  useEffect(() => {
    if (children.length === 0) return;
    
    // Calculate real progress based on child's activity
    const currentChild = children[selectedChildIndex];
    const targetProgress = calculateChildProgress(currentChild.id);
    
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetProgress / steps;
    const stepDuration = duration / steps;
    
    setAnimatedProgress(0); // Reset animation
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setAnimatedProgress(targetProgress);
        clearInterval(timer);
      } else {
        setAnimatedProgress(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [children, selectedChildIndex, refreshTrigger]);

  // Determine color based on gender
  const getProgressColor = () => {
    if (children.length === 0) return '#25AFF4';
    const currentChild = children[selectedChildIndex];
    // Default to blue if gender is not set (for backward compatibility)
    if (!currentChild.gender) return '#60a5fa';
    return currentChild.gender === 'female' ? '#ec4899' : '#60a5fa';
  };

  const progressColor = getProgressColor();

  // Calculate stroke dash array for circular progress
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  if (loading) {
    return (
      <div className="bg-[#121620] min-h-screen w-full flex justify-center items-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#25AFF4] mx-auto mb-4"></div>
          <p className="text-[#A1AAB7]">Loading children...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#121620] min-h-screen w-full flex justify-center items-center px-4">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => history.push('/login')}
            className="bg-[#25AFF4] text-black font-bold px-6 py-3 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="bg-[#121620] min-h-screen w-full flex justify-center items-center px-4">
        <div className="text-center">
          <h2 className="text-white text-xl mb-4">No children registered</h2>
          <p className="text-[#A1AAB7] mb-6">Add your first child to get started</p>
          <button
            onClick={() => history.push('/add-child')}
            className="bg-[#25AFF4] text-black font-bold px-6 py-3 rounded-lg"
          >
            Add Child
          </button>
        </div>
      </div>
    );
  }

  const currentChild = children[selectedChildIndex];

  return (
    <div className="bg-[#121620] min-h-screen h-screen w-full overflow-y-auto pt-8">
      <div className="w-full max-w-lg mx-auto px-4 pt-8 pb-8">

        {/* Card Container */}
        <div className="bg-[#1B202D] border border-[#2C3442] rounded-xl p-8 mt-8 shadow-md">

          {/* Back Button */}
          <div
            className="flex items-center gap-1 mb-6 cursor-pointer"
            onClick={() => history.goBack()}
          >
            <IoMdArrowRoundBack size={20} className="text-[#A1AAB7]" />
            <span className="text-[#A1AAB7] font-medium text-sm">Back</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3EB0DC] to-[#DCC253] flex justify-center items-center">
              <MdSchool className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">My Children</h1>
              <p className="text-[#A1AAB7] text-sm">{children.length} {children.length === 1 ? 'Child' : 'Children'} Registered</p>
            </div>
          </div>

          {/* Children Selector (if multiple children) */}
          {children.length > 1 && (
            <div className="mb-6">
              <label className="text-[#A1AAB7] text-sm font-medium mb-2 block">
                Select Child
              </label>
              <select
                value={selectedChildIndex}
                onChange={(e) => setSelectedChildIndex(Number(e.target.value))}
                className="w-full bg-[#121621] border-[1px] border-[#495569] rounded-lg p-3 pr-8 text-white focus:outline-none focus:border-[#25AFF4] appearance-none"
                style={{ 
                  backgroundPosition: 'right 0.5rem center',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
                  backgroundSize: '1.5rem 1.5rem',
                  backgroundRepeat: 'no-repeat',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none'
                }}
              >\n                {children.map((child, index) => (
                  <option key={child.id} value={index}>
                    {child.name} - {child.grade}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Child Info Card */}
          <div className="bg-[#121620] border border-[#2C3442] rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ 
                  background: !currentChild.gender 
                    ? 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'  // Default blue if no gender
                    : currentChild.gender === 'female'
                    ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' 
                    : 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
                }}
              >
                {currentChild.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">{currentChild.name}</h2>
                <p className="text-[#A1AAB7] text-sm">{currentChild.grade}</p>
                {!currentChild.gender && (
                  <p className="text-yellow-500 text-xs mt-1">⚠️ Gender not set</p>
                )}
              </div>
            </div>
          </div>

          {/* Delete Child Button */}
          <button
            onClick={handleDeleteChild}
            disabled={deleting}
            className={`w-full bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500/50 hover:border-red-500 text-red-500 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 mb-6 ${
              deleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <MdDelete size={20} />
            {deleting ? 'Deleting...' : `Delete ${currentChild.name}`}
          </button>

          {/* Progress Tracker */}
          <div className="bg-[#121620] border border-[#2C3442] rounded-xl p-6 mb-6">
            <h3 className="text-white text-lg font-semibold mb-6 flex items-center gap-2">
              <FaChartLine className="text-[#25AFF4]" />
              Overall Progress
            </h3>
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg width="180" height="180" className="transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke="#2C3442"
                    strokeWidth="12"
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="90"
                    cy="90"
                    r={radius}
                    stroke={progressColor}
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'none',
                    }}
                  />
                </svg>
                {/* Percentage Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white">{animatedProgress}%</span>
                  <span className="text-sm text-[#A1AAB7]">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Child Access Code Button */}
          <div className="bg-[#121620] border border-[#2C3442] rounded-xl p-6">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <FaBookOpen className="text-[#25AFF4]" />
              Child Access Code
            </h3>
            
            {/* Send Access Code Button */}
            <button
              onClick={handleSendAccessCode}
              disabled={sendingEmail}
              className={`w-full bg-gradient-to-r from-[#3EB0DC] to-[#25AFF4] hover:from-[#2E9DC0] hover:to-[#1e9fd8] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 ${
                sendingEmail ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <MdEmail size={24} />
              <span className="text-lg">
                {sendingEmail ? 'Sending...' : 'Get Child Access Code'}
              </span>
            </button>
            <p className="text-[#A1AAB7] text-xs mt-3 text-center">
              Click to receive {currentChild.name}'s access code via email
            </p>
          </div>

          {/* Add Child Button */}
          <button
            onClick={() => history.push('/add-child')}
            className="w-full bg-[#25AFF4] hover:bg-[#1e9fd8] text-black font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6"
          >
            <span className="text-2xl">+</span>
            Add Another Child
          </button>

        </div>
      </div>
    </div>
  );
};

export default MyChildren;
