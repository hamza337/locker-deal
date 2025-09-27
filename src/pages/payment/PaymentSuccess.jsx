import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import subscriptionService from '../../services/subscriptionService';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const processPaymentSuccess = async () => {
      try {
        // Get parameters from URL (Stripe typically sends session_id, payment_intent, etc.)
        const sessionId = searchParams.get('session_id');
        const paymentIntent = searchParams.get('payment_intent');
        const planType = searchParams.get('plan') || 'PREMIUM_MONTHLY';

        console.log('Payment success parameters:', {
          sessionId,
          paymentIntent,
          planType
        });

        // Update user subscription in localStorage
        subscriptionService.updateUserSubscription(planType);
        
        setSuccess(true);
        setIsProcessing(false);
        
        toast.success('Payment successful! Your subscription has been activated.');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          const user = localStorage.getItem('user');
          if (user) {
            const userData = JSON.parse(user);
            if (userData.role === 'brand') {
              navigate('/brand/dashboard');
            } else {
              navigate('/dashboard');
            }
          } else {
            navigate('/');
          }
        }, 3000);
        
      } catch (error) {
        console.error('Error processing payment success:', error);
        setIsProcessing(false);
        toast.error('There was an issue processing your payment. Please contact support.');
        
        // Redirect to dashboard anyway after 3 seconds
        setTimeout(() => {
          const user = localStorage.getItem('user');
          if (user) {
            const userData = JSON.parse(user);
            if (userData.role === 'brand') {
              navigate('/brand/dashboard');
            } else {
              navigate('/dashboard');
            }
          } else {
            navigate('/');
          }
        }, 3000);
      }
    };

    processPaymentSuccess();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen w-full bg-cover bg-center flex items-center justify-center px-4" style={{ backgroundImage: 'url(/bgApp.png)' }}>
      <div className="bg-[#1B2317] rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full text-center">
        {/* Logo */}
        <img src="/appLogo.png" alt="Locker Deal Logo" className="h-16 mx-auto mb-8" />
        
        {isProcessing ? (
          <>
            <FaSpinner className="text-[#9afa00] text-6xl mx-auto mb-6 animate-spin" />
            <h2 className="text-white text-2xl font-bold mb-4">Processing Payment...</h2>
            <p className="text-gray-300 mb-6">
              Please wait while we confirm your payment and activate your subscription.
            </p>
          </>
        ) : success ? (
          <>
            <FaCheckCircle className="text-[#9afa00] text-6xl mx-auto mb-6" />
            <h2 className="text-white text-2xl font-bold mb-4">Payment Successful!</h2>
            <p className="text-gray-300 mb-6">
              Your subscription has been activated successfully. You now have access to all premium features.
            </p>
            <div className="bg-[#9afa00] bg-opacity-10 border border-[#9afa00] rounded-lg p-4 mb-6">
              <p className="text-[#9afa00] font-semibold">
                ✓ Premium subscription activated<br/>
                ✓ Full chat access enabled<br/>
                ✓ Campaign creation unlocked<br/>
                ✓ All features available
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-yellow-500 text-6xl mx-auto mb-6">⚠️</div>
            <h2 className="text-white text-2xl font-bold mb-4">Payment Processing</h2>
            <p className="text-gray-300 mb-6">
              There was an issue confirming your payment. If you were charged, please contact our support team.
            </p>
          </>
        )}
        
        <p className="text-gray-400 text-sm">
          Redirecting to dashboard in a few seconds...
        </p>
        
        <button
          onClick={() => {
            const user = localStorage.getItem('user');
            if (user) {
              const userData = JSON.parse(user);
              if (userData.role === 'brand') {
                navigate('/brand/dashboard');
              } else {
                navigate('/dashboard');
              }
            } else {
              navigate('/');
            }
          }}
          className="mt-6 bg-[#9afa00] text-black font-bold px-6 py-3 rounded-lg hover:bg-[#baff32] transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;