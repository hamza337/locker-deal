import React, { useState, useEffect } from 'react';
import { FaTimes, FaTrophy, FaBriefcase, FaCrown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import subscriptionService from '../../services/subscriptionService';

const SubscriptionPopup = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [restrictedFeature, setRestrictedFeature] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      key: 'freemium',
      label: 'FREEMIUM',
      price: 'Free',
      icon: <FaTrophy className="text-gray-400 text-4xl" />,
      features: [
        'Limited access',
        'Basic support',
        'View athlete profiles only'
      ],
      details: 'Current Plan',
      moreDetails: ['Limited access', 'Basic support', 'View athlete profiles only'],
      disabled: true
    },
    {
      key: 'premium',
      label: 'PREMIUM',
      price: '$25/month',
      icon: <FaCrown className="text-[#9afa00] text-4xl" />,
      features: [
        'Full chat access',
        'Create campaigns',
        'Direct athlete messaging',
        'Priority support',
        'Advanced analytics'
      ],
      details: 'Most Popular',
      moreDetails: ['Full chat access', 'Create campaigns', 'Direct athlete messaging', 'Priority support', 'Advanced analytics']
    },
    {
      key: 'pay_per_deal',
      label: 'PAY PER DEAL',
      price: 'Per Contract',
      icon: <FaBriefcase className="text-[#9afa00] text-4xl" />,
      features: [
        'Pay only for completed deals',
        'No monthly commitment',
        'Full platform access',
        'Transaction-based pricing'
      ],
      details: 'Flexible Option',
      moreDetails: ['Pay only for completed deals', 'No monthly commitment', 'Full platform access', 'Transaction-based pricing']
    }
  ];

  const featureMessages = {
    chat: 'Access to chat functionality requires a premium subscription.',
    athlete_page: 'Viewing detailed athlete pages requires a premium subscription.',
    create_campaign: 'Creating campaigns requires a premium subscription.',
    direct_message: 'Direct messaging with athletes requires a premium subscription.'
  };

  useEffect(() => {
    const handleShowPopup = (event) => {
      setRestrictedFeature(event.detail.feature);
      setShowModal(true);
    };

    window.addEventListener('showSubscriptionPopup', handleShowPopup);
    return () => {
      window.removeEventListener('showSubscriptionPopup', handleShowPopup);
    };
  }, []);

  const handleSubscribe = async () => {
    if (selectedPlan === 'freemium') {
      toast.error('You are already on the Freemium plan');
      return;
    }

    setIsLoading(true);
    try {
      const result = await subscriptionService.subscribeCheckout(selectedPlan.toUpperCase());
      if (result.success) {
        toast.success('Redirecting to payment...');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setRestrictedFeature('');
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-md px-2 md:px-0">
      <div className="relative w-full max-w-lg md:max-w-3xl bg-[#1B2317] rounded-2xl shadow-lg p-6 md:p-10 flex flex-col items-center animate-fadeIn max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-[#9afa00] text-2xl hover:text-white transition"
          onClick={handleClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>
        
        {/* Title */}
        <h2 className="text-white text-lg md:text-2xl font-bold mb-2 text-center uppercase tracking-wide">
          Upgrade Your Plan
        </h2>
        
        {/* Feature Message */}
        {restrictedFeature && (
          <p className="text-gray-300 text-sm md:text-base text-center mb-6 max-w-md">
            {featureMessages[restrictedFeature] || 'This feature requires a premium subscription.'}
          </p>
        )}
        
        {/* Plan Tabs */}
        <div className="flex w-full justify-center gap-2 md:gap-4 mb-6 mt-2 flex-wrap">
          {plans.map(plan => (
            <button
              key={plan.key}
              onClick={() => !plan.disabled && setSelectedPlan(plan.key)}
              disabled={plan.disabled}
              className={`flex flex-col items-center px-3 md:px-4 py-3 rounded-xl border-2 transition-all duration-200 min-w-[100px] md:min-w-[160px] ${
                selectedPlan === plan.key 
                  ? 'border-[#9afa00] bg-[#181c1a]' 
                  : plan.disabled 
                    ? 'border-gray-600 bg-gray-800 opacity-60 cursor-not-allowed'
                    : 'border-transparent bg-black bg-opacity-60 hover:border-[#9afa00]'
              }`}
            >
              {plan.icon}
              <span className={`mt-2 font-bold text-sm md:text-base ${
                selectedPlan === plan.key ? 'text-[#9afa00]' : plan.disabled ? 'text-gray-400' : 'text-white'
              }`}>
                {plan.label}
              </span>
              <span className="text-xs md:text-sm text-gray-300 mt-1">{plan.price}</span>
              {plan.disabled && (
                <span className="text-xs text-gray-500 mt-1">Current</span>
              )}
            </button>
          ))}
        </div>
        
        {/* Plan Details */}
        <div className="w-full rounded-xl p-4 md:p-6 flex flex-col items-center mb-4">
          <span className="text-[#9afa00] font-bold text-sm md:text-base mb-4">
            {plans.find(p => p.key === selectedPlan)?.details}
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 w-full justify-center items-start mb-4">
            {plans.find(p => p.key === selectedPlan)?.moreDetails.map((feature, i) => (
              <span key={i} className="flex items-center gap-2 text-white text-xs md:text-sm">
                <span className="text-[#9afa00] flex-shrink-0">✔</span> 
                <span>{feature}</span>
              </span>
            ))}
          </div>
        </div>
        
        {/* Modal Actions */}
        <div className="flex w-full gap-4 mt-2">
          <button
            className="flex-1 bg-[#232626] text-white font-bold py-3 rounded-md uppercase text-xs md:text-base border border-[#9afa00] hover:bg-[#181c1a] transition"
            onClick={handleClose}
            disabled={isLoading}
          >
            Maybe Later
          </button>
          <button
            className={`flex-1 font-bold py-3 rounded-md uppercase text-xs md:text-base transition ${
              selectedPlan === 'freemium' || isLoading
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                : 'bg-[#9afa00] text-black hover:bg-[#baff32]'
            }`}
            onClick={handleSubscribe}
            disabled={selectedPlan === 'freemium' || isLoading}
          >
            {isLoading ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
        
        <div className="w-full text-center mt-4">
          <span className="text-gray-300 text-xs md:text-sm">
            Need help choosing? 
            <span className="text-[#9afa00] underline cursor-pointer hover:text-white transition">
              Contact our team
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPopup;