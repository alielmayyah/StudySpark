import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";

const SplashScreen: React.FC = () => {
  const navigate = useHistory();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate.push("/chooserole");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="
        fixed inset-0 flex items-center justify-center
        bg-[#121620] overflow-hidden
      "
    >
      <div className="flex flex-row items-center justify-center w-full">
        {/* Text */}
        <span
          className="
            text-[2.2rem] font-bold
            bg-gradient-to-r from-[#3EB0DC] to-[#DCC253]
            bg-clip-text text-transparent
            opacity-0 translate-y-24
            animate-textUp
            max-[600px]:text-[1.4rem]
          "
        >
          StudySpark
        </span>

        {/* Emoji */}
        <span
          className="
            ml-2 
            text-[1.8rem]
            opacity-0 translate-x-24
            animate-emojiLeft
            max-[600px]:text-[1.2rem]
          "
        >
          ✨
        </span>
      </div>
    </div>
  );
};

export default SplashScreen;
