import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { FaUserFriends } from "react-icons/fa";
import { BiSolidKey } from "react-icons/bi";
import { BsChatDotsFill } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { getCurrentUser, getUserData, logout } from "../firebase/auth";
import { User } from "../types";

const ParentDashboard = () => {
  const history = useHistory();
  const [parentName, setParentName] = useState<string>("Parent");
  const [parentEmail, setParentEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        history.push('/login');
        return;
      }

      try {
        // Store email for display
        if (currentUser.email) {
          setParentEmail(currentUser.email);
        }
        
        const userData = await getUserData(currentUser.uid);
        if (userData && userData.displayName) {
          setParentName(userData.displayName);
        } else if (currentUser.displayName) {
          setParentName(currentUser.displayName);
        } else if (currentUser.email) {
          // Fallback to email name
          setParentName(currentUser.email.split('@')[0]);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [history]);

  const handleLogout = async () => {
    try {
      await logout();
      history.push('/chooserole');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#121620] flex flex-col items-start overflow-y-auto pt-8">

      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between px-5 py-4 pt-8 bg-[#191F2B] border-b border-[#2D3443] mb-8">
        <div className="flex items-center gap-3">
          <img 
            src="/public/grad.png" 
            alt="StudySpark Logo" 
            className="w-[50px] h-[50px] rounded-[15px]" 
          />
          <h1 className="text-white text-xl font-semibold">
            Parent Dashboard
          </h1>
        </div>
        <button 
          onClick={handleLogout}
          className="w-[45px] h-[45px] rounded-full bg-[#603030] flex items-center justify-center hover:bg-[#703838] transition-all"
        >
          <MdLogout size={22} className="text-[#ff4444]" />
        </button>
      </div>

      {/* Welcome Message */}
      <div className="w-full mb-8 px-7">
        <h2 className="text-white text-2xl font-bold">
          {loading ? (
            "Welcome Back! 👋"
          ) : (
            `Welcome Back, ${parentName}! 👋`
          )}
        </h2>
        <p className="text-[#b0b7c3] text-sm mt-2">
          Manage your children's learning journey
        </p>
        {parentEmail && (
          <p className="text-[#8d96a7] text-xs mt-1">
            📧 {parentEmail}
          </p>
        )}
      </div>

      {/* Cards Container */}
      <div className="w-full max-w-[500px] mx-auto flex flex-col gap-6 px-5">

        {/* My Children */}
        <div
          className="w-full h-[140px] bg-[#171c28] rounded-[18px] flex items-center p-6 border border-[#2a3244] hover:bg-[#1e2433] hover:border-[#ffbb00] cursor-pointer transition-all"
          onClick={() => history.push("/my-children")}
        >
          <div className="w-[70px] h-[70px] rounded-[18px] bg-[#243041] flex items-center justify-center mr-5 flex-shrink-0">
            <FaUserFriends className="text-[38px] text-[#60a5fa]" />
          </div>
          <div className="flex-1">
            <h3 className="m-0 text-[#e4e7eb] text-[19px] font-bold">
              My Children
            </h3>
            <p className="m-0 mt-[6px] text-[#8d96a7] text-[15px] leading-tight">
              View profiles, reports, and track progress
            </p>
          </div>
        </div>

        {/* Subscription Card - Hidden for now */}
        {/* 
        <div
          className="w-full h-[140px] bg-[#171c28] rounded-[18px] flex items-center p-6 border border-[#2a3244] hover:bg-[#1e2433] hover:border-[#ffbb00] cursor-pointer transition-all"
          onClick={() => history.push("/subscription")}
        >
          <div className="w-[70px] h-[70px] rounded-[18px] bg-[#3C422F] flex items-center justify-center mr-5 flex-shrink-0">
            <BiSolidKey className="text-[38px] text-[#DCC253]" />
          </div>
          <div className="flex-1">
            <h3 className="m-0 text-[#e4e7eb] text-[19px] font-bold">
              Subscribe & Get Access Code
            </h3>
            <p className="m-0 mt-[6px] text-[#8d96a7] text-[15px] leading-tight">
              Subscribe to get student access code
            </p>
          </div>
        </div>
        */}

        {/* Chat with AI Assistant */}
        <div
          className="w-full h-[140px] bg-[#171c28] rounded-[18px] flex items-center p-6 border border-[#2a3244] hover:bg-[#1e2433] hover:border-[#ffbb00] cursor-pointer transition-all"
          onClick={() => history.push("/parent-chat")}
        >
          <div className="w-[70px] h-[70px] rounded-[18px] bg-[#243041] flex items-center justify-center mr-5 flex-shrink-0">
            <BsChatDotsFill className="text-[38px] text-[#60a5fa]" />
          </div>
          <div className="flex-1">
            <h3 className="m-0 text-[#e4e7eb] text-[19px] font-bold">
              Chat with AI Assistant
            </h3>
            <p className="m-0 mt-[6px] text-[#8d96a7] text-[15px] leading-tight">
              Get insights on your child's progress
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentDashboard;
