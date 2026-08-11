import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { PiGraduationCapFill } from "react-icons/pi";
import { BiSolidKey } from "react-icons/bi";
import { verifyAccessCode } from "../firebase/firestore";

const StudentAccess = () => {
  const history = useHistory();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-[#121620] min-h-screen w-full flex justify-center items-start pt-20 px-4 overflow-y-auto pb-8">
      <div className="w-full max-w-lg pb-8">

        {/* Card Container */}
        <div className="bg-[#1B202D] border border-[#2C3442] rounded-xl p-8 mt-14 shadow-md">

          {/* Back Button */}
          <div
            className="flex items-center gap-1 mb-5 cursor-pointer"
            onClick={() => history.goBack()}
          >
            <IoMdArrowRoundBack size={20} className="text-[#A1AAB7]" />
            <span className="text-[#A1AAB7] font-medium text-sm">Back</span>
          </div>

          {/* Title section */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3EB0DC] to-[#DCC253] flex justify-center items-center p-[2px]">
              <img 
                src="/public/grad.png" 
                alt="StudySpark Logo" 
                className="w-full h-full rounded-xl" 
              />
            </div>
            <h1 className="text-2xl font-semibold text-white">Student Access</h1>
          </div>

          {/* Need Access Code Box */}
          <div className="bg-[#2A2E36] border border-[#C1A75B] rounded-xl p-5 mb-7">
            <div className="flex items-start gap-4">
              <BiSolidKey size={26} className="text-[#C1A75B] mt-1" />
              <div>
                <h2 className="text-white font-semibold text-lg">Need an access code?</h2>
                <p className="text-[#A1AAB7] text-base mt-2">
                  Ask your parent for the special code they created for you!
                </p>
              </div>
            </div>
          </div>

          {/* Access Code Input */}
          <label className="text-white text-base font-semibold mb-3 block">
            Access Code
          </label>

          <input
            type="text"
            placeholder="Enter Your Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-full bg-[#121621] border border-[#495569] rounded-lg p-4 text-white text-base placeholder-[#A1AAB7] focus:outline-none focus:border-[#25AFF4] mb-6 uppercase tracking-wider"
          />

          {/* Button */}
          <button
            onClick={async () => {
              if (!code || code.trim() === '') {
                alert('Please enter an access code.');
                return;
              }

              setLoading(true);
              
              try {
                console.log('Verifying access code:', code.trim().toUpperCase());
                
                // Verify code against Firebase database
                const child = await verifyAccessCode(code.trim().toUpperCase());
                
                console.log('Verification result:', child);
                
                if (child) {
                  // Code is valid - store child info and proceed
                  localStorage.setItem('currentChild', JSON.stringify(child));
                  alert(`Welcome ${child.name}! Access granted.`);
                  history.push('/student-chat');
                } else {
                  alert('Invalid access code. Please check the code and try again.');
                }
              } catch (error: any) {
                console.error('Error verifying access code:', error);
                alert(`Error: ${error.message || 'Failed to verify access code. Please try again.'}`);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className={`w-full bg-[#25AFF4] hover:bg-[#1b9cd8] transition p-4 rounded-lg flex justify-center items-center ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="font-bold text-[#151621] text-lg">
              {loading ? 'Verifying...' : 'Start Learning'}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default StudentAccess;
