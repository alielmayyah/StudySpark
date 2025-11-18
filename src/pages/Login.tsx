import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import logo from "../assets/Frame 1000003921.svg";
import Input from "../components/Input";

const Login = () => {
  // 1. Use State to manage input values
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  // Dummy admin credentials for demonstration
  const adminEmail = "ramez@gmail.com";
  const adminPassword = "123123123";

  // 2. Define the Login function with logic
  const handleLogin = () => {
    if (email === adminEmail && password === adminPassword) {
      alert(`Login Successful! Email: ${email}`);
      // Add your actual navigation/login logic here
    } else {
      alert("Login Failed: Invalid email or password.");
    }
    console.log("Attempted Login with:", { email, password });
  };

  return (
    <div className="bg-[#121620] w-full h-full flex-center ">
      <div className="flex flex-col bg-[#1B202D] w-[90%] border-[1px] border-[#2C3442] rounded-lg p-5">
        {/* Back Button and Header */}
        <div className="flex items-center gap-1 mb-5">
          <IoMdArrowRoundBack color="#A1AAB7" />
          <h1 className="text-[#A1AAB7] font-bold">Back</h1>
        </div>

        <div className="flex items-center gap-3">
          <img src={logo} alt="" className="w-12 h-auto" />
          <h1 className="text-2xl font-bold">Parent Sign In</h1>
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

        <h1 className="text-[#25AFE8] self-end my-4 font-bold">
          Forgot Password?
        </h1>

        {/* Sign In Button */}
        <div
          className="w-full rounded-lg bg-[#25AFF4] p-3 flex-center cursor-pointer"
          onClick={handleLogin} // Call the login function
        >
          <h1 className="font-bold text-[#151621]">Sign In</h1>
        </div>

        <h1 className="mt-4 text-center text-[#A1AAB7]">
          Don’t have an account?
          <span className="text-[#25AFE8] cursor-pointer"> Register</span>
        </h1>
      </div>
    </div>
  );
};

export default Login;
