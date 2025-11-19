import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useHistory } from "react-router-dom";
import logo from "../assets/Frame 1000003921.svg";
import Input from "../components/Input";

const Register = () => {
  const history = useHistory();
  
  // State to manage input values
  const [email, setEmail] = useState("");
  const [childName, setChildName] = useState("");
  const [educationalYear, setEducationalYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasCapital = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const inputs = [
    {
      label: "Email",
      placeholder: "Parent@example.com",
      type: "email",
      value: email,
      setter: setEmail,
    },
    {
      label: "Child's Name",
      placeholder: "Enter your child's name",
      type: "text",
      value: childName,
      setter: setChildName,
    },
  ];

  const passwordInputs = [
    {
      label: "Password",
      placeholder: "* * * * * * * *",
      type: "password",
      value: password,
      setter: setPassword,
    },
    {
      label: "Confirm Password",
      placeholder: "* * * * * * * *",
      type: "password",
      value: confirmPassword,
      setter: setConfirmPassword,
    },
  ];

  const grades = Array.from({ length: 9 }, (_, i) => `Grade ${i + 4}`);

  const handleRegister = () => {
    if (!email || !childName || !educationalYear || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    alert(`Registration Successful! Welcome ${childName}`);
    console.log("Registration data:", { email, childName, educationalYear, password });
  };

  return (
    <div className="bg-[#121620] w-screen h-screen flex-center overflow-y-auto">
      <div className="flex flex-col bg-[#1B202D] w-[90%] max-w-[500px] border-[1px] border-[#2C3442] rounded-lg p-5 my-5">
        {/* Back Button and Header */}
        <div className="flex items-center gap-1 mb-5 cursor-pointer" onClick={() => history.push('/login')}>
          <IoMdArrowRoundBack color="#A1AAB7" />
          <h1 className="text-[#A1AAB7] font-bold">Back</h1>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <img src={logo} alt="" className="w-12 h-auto" />
          <h1 className="text-2xl font-bold text-white">Parent Register</h1>
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

        {/* Educational Year Dropdown */}
        <div className="my-2">
          <label className="text-[#A1AAB7] text-sm font-medium mb-2 block">
            Educational Year
          </label>
          <select
            value={educationalYear}
            onChange={(e) => setEducationalYear(e.target.value)}
            className="w-full bg-[#121621] border-[1px] border-[#495569] rounded-lg p-3 pr-8 text-white focus:outline-none focus:border-[#25AFF4] appearance-none"
            style={{ 
              backgroundPosition: 'right 0.5rem center',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'white\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")',
              backgroundSize: '1.5rem 1.5rem',
              backgroundRepeat: 'no-repeat',
              WebkitAppearance: 'none',
              MozAppearance: 'none'
            }}
          >
            <option value="" disabled>Select Grade</option>
            {grades.map((grade, index) => (
              <option key={index} value={grade}>{grade}</option>
            ))}
          </select>
        </div>

        {/* Password Field */}
        <div className="my-2">
          <label className="text-[#A1AAB7] text-sm font-medium mb-2 block">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="* * * * * * * *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full bg-[#121621] border-[1px] border-[#495569] rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-[#25AFF4]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A1AAB7] hover:text-white"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>
          
          {/* Password Requirements */}
          {passwordFocused && (
            <div className="mt-2 space-y-1">
              <p className={`text-xs ${hasMinLength ? 'text-green-500' : 'text-red-500'}`}>
                {hasMinLength ? '✓' : '✗'} At least 8 characters
              </p>
              <p className={`text-xs ${hasCapital ? 'text-green-500' : 'text-red-500'}`}>
                {hasCapital ? '✓' : '✗'} One capital letter
              </p>
              <p className={`text-xs ${hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                {hasNumber ? '✓' : '✗'} One number
              </p>
              <p className={`text-xs ${hasSpecialChar ? 'text-green-500' : 'text-red-500'}`}>
                {hasSpecialChar ? '✓' : '✗'} One special character
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="my-2">
          <label className="text-[#A1AAB7] text-sm font-medium mb-2 block">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="* * * * * * * *"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#121621] border-[1px] border-[#495569] rounded-lg p-3 pr-10 text-white focus:outline-none focus:border-[#25AFF4]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A1AAB7] hover:text-white"
            >
              {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </button>
          </div>
          
          {/* Password Match Validation */}
          {confirmPassword && (
            <p className={`text-xs mt-2 ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        {/* Register Button */}
        <div
          className="w-full rounded-lg bg-[#25AFF4] p-3 flex-center cursor-pointer mt-4"
          onClick={handleRegister}
        >
          <h1 className="font-bold text-[#151621]">Register</h1>
        </div>

        <h1 className="mt-4 text-center text-[#A1AAB7]">
          Already have an account?
          <span className="text-[#25AFE8] cursor-pointer" onClick={() => history.push('/login')}> Sign In</span>
        </h1>
      </div>
    </div>
  );
};

export default Register;
