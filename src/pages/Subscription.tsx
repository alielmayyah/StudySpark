import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaCcVisa, FaCcMastercard } from "react-icons/fa";
import { BiSolidKey } from "react-icons/bi";
import { MdContentCopy, MdCheck } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

const Subscription = () => {
  const history = useHistory();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(formatExpiryDate(value));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const generateAccessCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleSubscribe = () => {
    // Validate all fields
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      alert('Please fill in all card details');
      return;
    }

    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanedCardNumber.length !== 16) {
      alert('Please enter a valid 16-digit card number');
      return;
    }

    if (expiryDate.length !== 5) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }

    if (cvv.length !== 3) {
      alert('Please enter a valid 3-digit CVV');
      return;
    }

    // Show processing state
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Generate access code
      const code = generateAccessCode();
      
      // Store the code in localStorage as permanent (no isActive flag needed)
      const codeData = {
        code: code,
        subscribedAt: new Date().toISOString(),
        subscriptionType: 'active' // Can be used later for subscription tracking
      };
      localStorage.setItem('studentAccessCode', JSON.stringify(codeData));
      
      setGeneratedCode(code);
      setIsProcessing(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = generatedCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert('Failed to copy code. Please copy manually: ' + generatedCode);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Failed to copy code. Please copy manually: ' + generatedCode);
    }
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    history.push('/parent-dashboard');
  };

  return (
    <div className="bg-[#121620] min-h-screen w-full flex justify-center items-start pt-20 px-4 overflow-y-auto pb-8">
      <div className="w-full max-w-lg pb-8">

        {/* Card Container */}
        <div className="bg-[#1B202D] border border-[#2C3442] rounded-xl p-8 mt-8 shadow-md">

          {/* Back Button */}
          <div
            className="flex items-center gap-1 mb-5 cursor-pointer"
            onClick={() => history.goBack()}
          >
            <IoMdArrowRoundBack size={20} className="text-[#A1AAB7]" />
            <span className="text-[#A1AAB7] font-medium text-sm">Back</span>
          </div>

          {/* Title section */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3EB0DC] to-[#DCC253] flex justify-center items-center">
              <BiSolidKey className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Subscribe</h1>
              <p className="text-[#A1AAB7] text-sm">Get student access code</p>
            </div>
          </div>

          {/* Payment Method Logos */}
          <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-[#121620] border border-[#2C3442] rounded-lg">
            <span className="text-[#A1AAB7] text-sm font-medium">We accept:</span>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-[#1B202D] border border-[#3D4451] rounded flex items-center gap-1.5">
                <div className="w-10 h-6 bg-gradient-to-r from-[#1434CB] to-[#2D57F2] rounded-sm flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
              </div>
              <div className="px-4 py-2 bg-[#1B202D] border border-[#3D4451] rounded flex items-center gap-1.5">
                <img 
                  src="/src/assets/Layer 0.png" 
                  alt="Mastercard" 
                  className="h-6 w-auto"
                />
              </div>
            </div>
          </div>

          {/* Card Holder Name */}
          <div className="mb-5">
            <label className="text-white text-sm font-semibold mb-2 block">
              Cardholder Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="w-full bg-[#121621] border border-[#495569] rounded-lg p-4 text-white text-base placeholder-[#A1AAB7] focus:outline-none focus:border-[#25AFF4]"
            />
          </div>

          {/* Card Number */}
          <div className="mb-5">
            <label className="text-white text-sm font-semibold mb-2 block">
              Card Number
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="w-full bg-[#121621] border border-[#495569] rounded-lg p-4 text-white text-base placeholder-[#A1AAB7] focus:outline-none focus:border-[#25AFF4] font-mono"
            />
          </div>

          {/* Expiry and CVV */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="text-white text-sm font-semibold mb-2 block">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={handleExpiryChange}
                className="w-full bg-[#121621] border border-[#495569] rounded-lg p-4 text-white text-base placeholder-[#A1AAB7] focus:outline-none focus:border-[#25AFF4] font-mono"
              />
            </div>
            <div className="flex-1">
              <label className="text-white text-sm font-semibold mb-2 block">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                value={cvv}
                onChange={handleCvvChange}
                className="w-full bg-[#121621] border border-[#495569] rounded-lg p-4 text-white text-base placeholder-[#A1AAB7] focus:outline-none focus:border-[#25AFF4] font-mono"
              />
            </div>
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={isProcessing}
            className="w-full bg-[#25AFF4] hover:bg-[#1b9cd8] transition p-4 rounded-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#151621] border-t-transparent rounded-full animate-spin" />
                <span className="font-bold text-[#151621] text-lg">Processing...</span>
              </div>
            ) : (
              <span className="font-bold text-[#151621] text-lg">
                Subscribe & Get Code
              </span>
            )}
          </button>

        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#1B202D] border border-[#2C3442] rounded-2xl p-8 w-full max-w-md"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3EB0DC] to-[#DCC253] flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl">✨</span>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">
                  Subscription Successful!
                </h2>
                
                <p className="text-[#A1AAB7] text-sm mb-6">
                  Here's your student access code. Share it with your child to access their learning portal
                </p>
                
                {/* Code Display */}
                <div className="bg-[#121620] border-2 border-[#25AFF4] rounded-xl p-6 mb-6">
                  <p className="text-[#A1AAB7] text-xs mb-2 uppercase tracking-wider">
                    Access Code
                  </p>
                  <p className="text-white text-4xl font-bold tracking-[0.3em] font-mono">
                    {generatedCode}
                  </p>
                </div>
                
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-[#25AFF4] hover:bg-[#1e9fd8] text-black font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-2 mb-3"
                >
                  {copied ? (
                    <>
                      <MdCheck size={24} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <MdContentCopy size={20} />
                      Copy Code
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDone}
                  className="w-full text-[#A1AAB7] hover:text-white font-medium py-3 transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subscription;
