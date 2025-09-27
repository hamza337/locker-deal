import toast from 'react-hot-toast';

class SubscriptionService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/';
  }

  // Check if user has access to a feature
  checkFeatureAccess(feature) {
    const user = this.getCurrentUser();
    if (!user || user.role !== 'brand') {
      return true; // Non-brand users have full access
    }

    const subscriptionPlan = user.subscriptionPlan || 'FREEMIUM';
    
    // Define feature restrictions for freemium users
    const freemiumRestrictions = [
      'chat',
      'athlete_page',
      'campaigns',
      'direct_message'
    ];

    if (subscriptionPlan === 'FREEMIUM' && freemiumRestrictions.includes(feature)) {
      return false;
    }

    return true;
  }

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Check if user is freemium brand
  isFreemiumBrand() {
    const user = this.getCurrentUser();
    return user && user.role === 'brand' && (user.subscriptionPlan === 'FREEMIUM' || !user.subscriptionPlan);
  }

  // Handle subscription checkout
  async subscribeCheckout(planType = 'PREMIUM') {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Processing subscription...');
      
      const response = await fetch(`${this.baseUrl}payment/subscribe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          planType
        })
      });

      const data = await response.json();
      console.log('Subscription checkout response:', data); // Debug log
      
      if (response.ok) {
        // Update subscription status immediately before redirect
        toast.success('Updating subscription status...', { id: loadingToast });
        
        // Map planType to subscription plan
        let subscriptionPlan;
        switch(planType.toUpperCase()) {
          case 'PREMIUM':
            subscriptionPlan = 'PREMIUM_MONTHLY';
            break;
          case 'PAY_PER_DEAL':
            subscriptionPlan = 'PAY_PER_DEAL';
            break;
          default:
            subscriptionPlan = 'PREMIUM_MONTHLY';
        }
        
        this.updateUserSubscription(subscriptionPlan);
        
        // Add a small delay for better UX and to ensure localStorage is updated
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Handle successful checkout (redirect to payment page, etc.)
        if (data.checkoutUrl || data.url || data.redirectUrl) {
          const redirectUrl = data.checkoutUrl || data.url || data.redirectUrl;
          
          // Show redirect message with fancy loading
          toast.success('🚀 Redirecting to payment gateway...', { id: loadingToast });
          
          // Create a fancy redirect overlay
          this.showRedirectOverlay();
          
          // Redirect after a short delay for better UX
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1500);
        } else {
          console.warn('No redirect URL found in response:', data);
          toast.success('Subscription activated successfully!', { id: loadingToast });
        }
        return { success: true, data };
      } else {
        toast.dismiss(loadingToast);
        throw new Error(data.message || 'Subscription checkout failed');
      }
    } catch (error) {
      console.error('Subscription checkout error:', error);
      toast.error(error.message || 'Failed to process subscription');
      return { success: false, error: error.message };
    }
  }

  // Show fancy redirect overlay
  showRedirectOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'payment-redirect-overlay';
    overlay.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: linear-gradient(135deg, #1B2317, #2a3d21);
          padding: 3rem;
          border-radius: 20px;
          text-align: center;
          border: 2px solid #9afa00;
          box-shadow: 0 0 30px rgba(154, 250, 0, 0.3);
          max-width: 400px;
          width: 90%;
        ">
          <div style="
            width: 60px;
            height: 60px;
            border: 4px solid #9afa00;
            border-top: 4px solid transparent;
            border-radius: 50%;
            margin: 0 auto 2rem;
            animation: spin 1s linear infinite;
          "></div>
          <h2 style="
            color: #9afa00;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">Subscription Updated!</h2>
          <p style="
            color: #ffffff;
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          ">Redirecting you to secure payment gateway...</p>
          <div style="
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 1rem;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: #9afa00;
              border-radius: 50%;
              animation: bounce 1.4s ease-in-out infinite both;
            "></div>
            <div style="
              width: 8px;
              height: 8px;
              background: #9afa00;
              border-radius: 50%;
              animation: bounce 1.4s ease-in-out 0.16s infinite both;
            "></div>
            <div style="
              width: 8px;
              height: 8px;
              background: #9afa00;
              border-radius: 50%;
              animation: bounce 1.4s ease-in-out 0.32s infinite both;
            "></div>
          </div>
        </div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      </style>
    `;
    document.body.appendChild(overlay);
    
    // Remove overlay after 10 seconds as fallback
    setTimeout(() => {
      const existingOverlay = document.getElementById('payment-redirect-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
      }
    }, 10000);
  }

  // Update user subscription in localStorage
  updateUserSubscription(subscriptionPlan) {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        userData.subscriptionPlan = subscriptionPlan;
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User subscription updated to:', subscriptionPlan);
        
        // Dispatch event to notify components of subscription change
        const event = new CustomEvent('subscriptionUpdated', {
          detail: { subscriptionPlan }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Failed to update user subscription:', error);
    }
  }

  // Handle successful payment completion (call this after successful Stripe payment)
  handlePaymentSuccess(subscriptionPlan = 'PREMIUM_MONTHLY') {
    this.updateUserSubscription(subscriptionPlan);
    toast.success('Payment successful! Your subscription has been activated.');
    
    // Optionally redirect to dashboard or refresh the page
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  // Show restriction popup
  showRestrictionPopup(feature) {
    // This will be handled by the SubscriptionPopup component
    const event = new CustomEvent('showSubscriptionPopup', {
      detail: { feature }
    });
    window.dispatchEvent(event);
  }

  // Validate access and show popup if restricted
  validateAccess(feature) {
    if (!this.checkFeatureAccess(feature)) {
      this.showRestrictionPopup(feature);
      toast.error('Please upgrade your subscription to access this feature');
      return false;
    }
    return true;
  }
}

export default new SubscriptionService();