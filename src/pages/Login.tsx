import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FcGoogle } from "react-icons/fc";
import { useHistory } from "react-router-dom";
import logo from "../assets/Frame 1000003921.svg";
import Input from "../components/Input";
import { loginWithEmail, loginWithGoogle } from "../firebase/auth";

const Login = () => {
  const history = useHistory();
  
  // 1. Use State to manage input values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputs = [
    {
      label: "Email",
      placeholder: "Parent@example.com",
      type: "email",
      value: email,
      setter: setEmail,
    },
    {
      label: "Password",
      placeholder: "* * * * * * * *",
      type: "password",
      value: password,
      setter: setPassword,
    },
    // The commented-out input is left out for simplicity but can be added back
  ];

  // 2. Define the Login function with Firebase
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = await loginWithEmail(email, password);
      console.log("Login successful for:", user.email);
      
      // Redirect based on role
      if (user.role === 'parent') {
        history.push('/parent-dashboard');
      } else if (user.role === 'student') {
        history.push('/student-chat');
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const user = await loginWithGoogle();
      console.log("Google login successful for:", user.email);
      history.push('/parent-dashboard');
    } catch (err: any) {
      setError(err.message || "Google login failed. Please try again.");
      console.error("Google login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121620] w-full h-full min-h-screen flex-center overflow-y-auto pt-12">
      <div className="flex flex-col bg-[#1B202D] w-[90%] max-w-[500px] border-[1px] border-[#2C3442] rounded-lg p-5 my-5">
        {/* Back Button and Header */}
        <div className="flex items-center gap-1 mb-5 cursor-pointer" onClick={() => history.push('/chooserole')}>
          <IoMdArrowRoundBack color="#A1AAB7" />
          <h1 className="text-[#A1AAB7] font-bold">Back</h1>
        </div>

        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="w-12 h-auto" />
          <h1 className="text-2xl font-bold text-white">Parent Sign In</h1>
        </div>

        {/* Input Fields */}
        {inputs.map((item, index) => (
          <Input
            key={index} // Add a key for list items
            labelName={item.label}
            placeHolder={item.placeholder}
            type={item.type}
            value={item.value}
            onChange={(e) => item.setter(e.target.value)}
          />
        ))}

        <h1 className="text-[#25AFE8] self-end my-4 font-bold cursor-pointer" onClick={() => history.push('/forgot-password')}>
          Forgot Password?
        </h1>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Sign In Button */}
        <div
          className={`w-full rounded-lg bg-[#25AFF4] p-3 flex-center cursor-pointer ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={loading ? undefined : handleLogin}
        >
          <h1 className="font-bold text-[#151621]">
            {loading ? 'Signing In...' : 'Sign In'}
          </h1>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-[1px] bg-[#2C3442]"></div>
          <span className="text-[#A1AAB7] text-sm">OR</span>
          <div className="flex-1 h-[1px] bg-[#2C3442]"></div>
        </div>

        {/* Google Sign In Button */}
        <div
          className={`w-full rounded-lg bg-white p-3 flex items-center justify-center gap-2 cursor-pointer ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={loading ? undefined : handleGoogleLogin}
        >
          <FcGoogle size={24} />
          <h1 className="font-bold text-[#151621]">Continue with Google</h1>
        </div>

        <h1 className="mt-4 text-center text-[#A1AAB7]">
          Don't have an account?
          <span className="text-[#25AFE8] cursor-pointer" onClick={() => history.push('/register')}> Register</span>
        </h1>
      </div>
    </div>
  );
};

export default Login;
