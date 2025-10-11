import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

// Get contracts for both brands and athletes
export const getContracts = async (page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${baseUrl}contracts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: {
        page,
        limit
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
};

// Format contract data for display
export const formatContractData = (contract) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not signed';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const isContractExpired = (signingValidUntil, currentStatus) => {
    if (!signingValidUntil) return false;
    if (currentStatus === 'completed' || currentStatus === 'expired') return false;
    return new Date(signingValidUntil) < new Date();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_athlete_signature':
        return 'text-yellow-400';
      case 'signed':
        return 'text-[#9afa00]';
      case 'completed':
        return 'text-blue-400';
      case 'cancelled':
        return 'text-red-400';
      case 'rejected':
        return 'text-red-400';
      case 'expired':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending_athlete_signature':
        return 'Pending Signature';
      case 'signed':
        return 'Signed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  // Check if contract is expired and override status
  const actualStatus = isContractExpired(contract.signingValidUntil, contract.status) ? 'expired' : contract.status;

  return {
    id: contract.id,
    title: contract.title,
    athlete: contract.athlete ? 
      `${contract.athlete.athleteProfile?.firstName || ''} ${contract.athlete.athleteProfile?.lastName || ''}`.trim() || 
      contract.athlete.email : 
      'Unknown Athlete',
    brand: contract.brand ? 
      contract.brand.brandProfile?.companyName || 
      contract.brand.email : 
      'Unknown Brand',
    amount: formatAmount(contract.amount),
    totalAmount: formatAmount(contract.totalAmountToPay),
    platformFee: formatAmount(contract.platformFeeAmount),
    dateCreated: formatDate(contract.createdAt),
    dateSigned: formatDate(contract.athleteSignedAt),
    expiryDate: formatDate(contract.expiryDate),
    signingValidUntil: formatDate(contract.signingValidUntil),
    status: getStatusText(actualStatus),
    statusColor: getStatusColor(actualStatus),
    paymentResponsibility: contract.paymentResponsibility,
    contractFileUrl: contract.contractFileUrl,
    signedContractFileUrl: contract.signedContractFileUrl,
    description: contract.description,
    rejectionReason: contract.rejectionReason
  };
};