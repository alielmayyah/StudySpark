import React, { useState } from "react";

interface InputProps {
  labelName: string;
  placeHolder: string;
  type: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// Validation Constants
const MIN_PASSWORD_LENGTH = 5;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Input: React.FC<InputProps> = ({
  labelName,
  type,
  placeHolder,
  value,
  onChange,
}) => {
  // Local state to track validation status
  const [isValid, setIsValid] = useState(true);

  // Custom change handler that performs validation and updates the parent state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    let validationResult = true; // Start assuming valid

    // 1. Perform validation logic
    if (type === "email") {
      // If non-empty and fails regex
      if (newValue.length > 0 && !emailRegex.test(newValue)) {
        validationResult = false;
      }
    } else if (type === "password") {
      // If non-empty and fails length requirement (less than 5)
      if (newValue.length > 0 && newValue.length < MIN_PASSWORD_LENGTH) {
        validationResult = false;
      }
    }

    // Update local validation state
    setIsValid(validationResult);

    // Update the parent component's state (essential for controlled inputs)
    onChange(e);
  };

  // Determine if we should show the invalid state (only if !isValid AND user has typed something)
  const shouldShowError = !isValid && value.length > 0;

  // Determine the border class based on the validation status
  const borderClass = shouldShowError
    ? "border-red-500" // Red border for invalid input
    : "border-[#495569] focus:border-[#25AFF4]"; // Default/Focus border

  // Combine static and conditional classes
  const inputClasses = `
    bg-[#121621] 
    border-[1px] 
    rounded-lg 
    ps-3 
    text-[#A1AAB7] 
    font-medium 
    w-full 
    p-2 
    focus:outline-none 
    ${borderClass}
  `;

  return (
    <div className="mb-2">
      <h1 className="my-2 text-lg font-bold text-[#A1AAB7]">{labelName}</h1>

      <input
        type={type}
        placeholder={placeHolder}
        value={value}
        onChange={handleChange}
        className={inputClasses}
      />

      {/* Conditional error message */}
      {shouldShowError && (
        <p className="mt-1 text-sm text-red-500">
          {type === "email" && "Please enter a valid email address."}
          {type === "password" &&
            `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`}
        </p>
      )}
    </div>
  );
};

export default Input;
