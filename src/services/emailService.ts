import emailjs from '@emailjs/browser';

// EmailJS Configuration
// Credentials configured and ready to use!
const EMAILJS_SERVICE_ID = 'service_jwtb5jf';
const EMAILJS_TEMPLATE_ID = 'template_g26uqof';
const EMAILJS_PUBLIC_KEY = 'NCFsYsbiXzG5hDD0E';

/**
 * Initialize EmailJS
 * Call this once when your app starts
 */
export const initializeEmailJS = () => {
  if (EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }
};

/**
 * Send access code to parent's email using EmailJS
 * 
 * @param parentEmail - The email address of the parent
 * @param parentName - The name of the parent
 * @param childName - The name of the child
 * @param accessCode - The access code to send
 * @returns Promise that resolves when email is sent successfully
 */
export const sendAccessCodeEmail = async (
  parentEmail: string,
  parentName: string,
  childName: string,
  accessCode: string
): Promise<void> => {
  try {
    // Check if EmailJS is configured
    if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || 
        EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || 
        EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      throw new Error('EmailJS is not configured yet. Please follow the setup guide in EMAILJS_SETUP_SIMPLE.md');
    }

    // Send email using EmailJS
    const templateParams = {
      to_email: parentEmail,
      to_name: parentName,
      child_name: childName,
      access_code: accessCode,
      app_name: 'StudySpark',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('Email sent successfully:', response);
  } catch (error: any) {
    console.error('Failed to send email:', error);
    throw new Error(error.message || 'Failed to send access code email. Please try again later.');
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
