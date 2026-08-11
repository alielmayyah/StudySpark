import React, { useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useHistory } from "react-router-dom";
import logo from "../assets/Frame 1000003921.svg";
import Input from "../components/Input";
import { getCurrentUser } from "../firebase/auth";
import { addChild } from "../firebase/firestore";

const AddChild = () => {
  const history = useHistory();
  
  // State to manage input values
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState("");
  const [educationalYear, setEducationalYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const grades = Array.from({ length: 9 }, (_, i) => `Grade ${i + 4}`);

  const handleAddChild = async () => {
    if (!childName || !childGender || !educationalYear) {
      setError("Please fill in all fields.");
      return;
    }

    // Ensure a user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser) {
      setError('Please sign in to add a child.');
      setTimeout(() => history.push('/login'), 2000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Calculate age based on grade
      const gradeNumber = parseInt(educationalYear.replace('Grade ', ''));
      const age = gradeNumber + 5; // Approximate age

      // Add child to Firestore
      await addChild(currentUser.uid, {
        name: childName,
        age,
        grade: educationalYear,
        gender: childGender as 'male' | 'female',
      });

      alert(`Child ${childName} added successfully!`);
      history.push('/my-children');
    } catch (err: any) {
      setError(err.message || "Failed to add child. Please try again.");
      console.error("Add child error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121620] w-full h-full min-h-screen flex-center overflow-y-auto pt-12">
      <div className="flex flex-col bg-[#1B202D] w-[90%] max-w-[500px] border-[1px] border-[#2C3442] rounded-lg p-5 my-5">
        {/* Back Button and Header */}
        <div className="flex items-center gap-1 mb-5 cursor-pointer" onClick={() => history.goBack()}>
          <IoMdArrowRoundBack color="#A1AAB7" />
          <h1 className="text-[#A1AAB7] font-bold">Back</h1>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <img src={logo} alt="" className="w-12 h-auto" />
          <h1 className="text-2xl font-bold text-white">Add Child</h1>
        </div>

        {/* Child's Name Input */}
        <Input
          labelName="Child's Name"
          placeHolder="Enter your child's name"
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
        />

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

        {/* Child's Gender Dropdown */}
        <div className="my-2">
          <label className="text-[#A1AAB7] text-sm font-medium mb-2 block">
            Child's Gender
          </label>
          <select
            value={childGender}
            onChange={(e) => setChildGender(e.target.value)}
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
            <option value="" disabled>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 my-3">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Add Child Button */}
        <div
          className={`w-full rounded-lg bg-[#25AFF4] p-3 flex-center cursor-pointer mt-4 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={loading ? undefined : handleAddChild}
        >
          <h1 className="font-bold text-[#151621]">
            {loading ? 'Adding Child...' : 'Add Child'}
          </h1>
        </div>
      </div>
    </div>
  );
};

export default AddChild;
