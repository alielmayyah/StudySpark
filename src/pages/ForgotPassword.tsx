import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useHistory } from "react-router-dom";
import logo from "../assets/Frame 1000003921.svg";
import Input from "../components/Input";

const ForgotPassword = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    if (email.trim()) {
      // Navigate to ResetPassword page with email
      history.push('/reset-password', { email });
    } else {
      alert("Please enter your email address.");
    }
  };

  return (
    <div className="bg-[#121620] w-full h-full min-h-screen flex-center overflow-y-auto pt-12">
      <div className="flex flex-col bg-[#1B202D] w-[90%] max-w-[500px] border-[1px] border-[#2C3442] rounded-lg p-5 my-5">
        {/* Back Button and Header */}
        <div className="flex items-center gap-1 mb-5 cursor-pointer" onClick={() => history.push('/login')}>
          <IoMdArrowRoundBack color="#A1AAB7" />
          <h1 className="text-[#A1AAB7] font-bold">Back</h1>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <img src={logo} alt="" className="w-12 h-auto" />
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        </div>

        <p className="text-[#A1AAB7] text-sm mb-5">
          Enter your email address and we'll send you a reset code.
        </p>

        {/* Email Input Field */}
        <Input
          labelName="Email"
          placeHolder="Parent@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Send Reset Code Button */}
        <div
          className="w-full rounded-lg bg-[#25AFF4] p-3 flex-center cursor-pointer mt-6"
          onClick={handleResetPassword}
        >
          <h1 className="font-bold text-[#151621]">Send Reset Code</h1>
        </div>

        <h1 className="mt-4 text-center text-[#A1AAB7]">
          Remember your password?
          <span className="text-[#25AFE8] cursor-pointer" onClick={() => history.push('/login')}> Sign In</span>
        </h1>
      </div>
    </div>
  );
};

export default ForgotPassword;
