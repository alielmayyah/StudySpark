
import {
  IonContent,
  IonPage,
  IonIcon,
} from "@ionic/react";
import { personOutline, bookOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";

const ChooseRole: React.FC = () => {
  const history = useHistory();
  return (
    <IonPage>
      <IonContent 
        className="flex flex-col items-center justify-center min-h-screen px-5 py-10 sm:px-2.5 sm:py-[18px] md:px-2.5 md:py-8"
        style={{ '--background': '#121620' } as React.CSSProperties}
      >

        {/* Logo */}
        <div className="text-center mt-20 sm:mt-16">
          <img 
            src="/public/grad.png" 
            alt="StudySpark Logo" 
            className="w-[110px] h-[110px] rounded-[30px] mb-[15px] mx-auto sm:w-20 sm:h-20" 
          />
          <h1 className="text-[26px] font-semibold bg-gradient-to-r from-[#3EB0DC] to-[#DCC253] bg-clip-text text-transparent sm:text-[1.2rem]">
            StudySpark <span className="text-[#ffe680]">✨</span>
          </h1>
          <p className="mt-[5px] text-[#b0b7c3] text-sm sm:text-xs">
            Your personal learning companion
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full mt-10 px-4 flex flex-col gap-6 items-center">
          
          {/* Parent */}
          <div
            className="w-full max-w-[400px] h-[140px] bg-[#171c28] rounded-[18px] flex items-center p-10 border border-[#2a3244] hover:bg-[#1e2433] hover:border-[#ffbb00] cursor-pointer transition-all sm:p-4 sm:h-[110px] md:p-6 md:h-[130px]"
            onClick={() => history.push('/login')}
          >
            <IonIcon icon={personOutline} className="text-[44px] text-[#60a5fa] mr-7 flex-shrink-0 sm:text-[36px] sm:mr-4" />
            <div className="flex-1">
              <h3 className="m-0 text-[#e4e7eb] text-2xl font-bold sm:text-xl">
                I'm a Parent
              </h3>
              <p className="m-0 mt-1 text-[#8d96a7] text-lg sm:text-base">
                Monitor your child's progress
              </p>
            </div>
          </div>

          {/* Student */}
          <div className="w-full max-w-[400px] h-[140px] bg-[#171c28] rounded-[18px] flex items-center p-10 border border-[#2a3244] hover:bg-[#1e2433] hover:border-[#ffbb00] cursor-pointer transition-all sm:p-4 sm:h-[110px] md:p-6 md:h-[130px]">
            <IonIcon icon={bookOutline} className="text-[44px] text-[#facc15] mr-7 flex-shrink-0 sm:text-[36px] sm:mr-4" />
            <div className="flex-1">
              <h3 className="m-0 text-[#e4e7eb] text-2xl font-bold sm:text-xl">
                I'm a Student
              </h3>
              <p className="m-0 mt-1 text-[#8d96a7] text-lg sm:text-base">
                Start learning with the AI
              </p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ChooseRole;