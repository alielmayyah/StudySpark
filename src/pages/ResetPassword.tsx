import React from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useHistory, useLocation } from "react-router-dom";
import logo from "../assets/Frame 1000003921.svg";

const ResetPassword = () => {
  const history = useHistory();
  const location = useLocation<{ email?: string }>();
  const email = location.state?.email || "your email";

  const handleSendAgain = () => {
    history.push('/forgot-password');
  };

  return (
    <div className="bg-[#121620] w-full h-full min-h-screen flex-center overflow-y-auto pt-12">
      <div className="flex flex-col bg-[#1B202D] w-[90%] max-w-[500px] border-[1px] border-[#2C3442] rounded-lg p-5 my-5">
        {/* Back Button and Header */}
        <div className="flex items-center gap-1 mb-5 cursor-pointer" onClick={() => history.push('/login')}>
          <IoMdArrowRoundBack color="#A1AAB7" />
          <h1 className="text-[#A1AAB7] font-bold">Back To Log In</h1>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <img src={logo} alt="" className="w-12 h-auto" />
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        </div>

        {/* Success Message */}
        <div className="bg-[#121620] border border-[#2C3442] rounded-lg p-4 mb-5">
          <p className="text-[#E4E7EB] text-sm leading-relaxed">
            We've sent a password reset code to
          </p>
          <p className="text-[#25AFF4] text-sm font-semibold mt-1">
            {email}
          </p>
        </div>

        <p className="text-[#A1AAB7] text-sm mb-5">
          Please check your email and follow the instructions to reset your password.
        </p>

        {/* Send Again Button */}
        <div
          className="w-full rounded-lg border border-[#495569] bg-[#121621] p-3 flex-center cursor-pointer hover:bg-[#F0C442] transition-all group"
          onClick={handleSendAgain}
        >
          <h1 className="font-bold text-white group-hover:text-[#121621]">Send Again</h1>
        </div>

        <h1 className="mt-4 text-center text-[#A1AAB7]">
          Didn't receive the code?
          <span className="text-[#25AFE8] cursor-pointer" onClick={handleSendAgain}> Try again</span>
        </h1>
      </div>
    </div>
  );
};

export default ResetPassword;
