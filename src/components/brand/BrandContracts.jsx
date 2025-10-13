import React, { useState, useEffect } from 'react';
import { FaDownload, FaFileContract, FaCalendarAlt, FaDollarSign, FaSpinner, FaEye, FaTimes, FaCheck, FaCreditCard, FaBan, FaEdit, FaChevronDown } from 'react-icons/fa';
import { getContracts, formatContractData } from '../../services/contractService';
import { uploadFile, validateFile } from '../../services/uploadService';
import axios from 'axios';
import toast from 'react-hot-toast';

const BrandContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [selectedContract, setSelectedContract] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    amount: '',
    paymentResponsibility: '',
    contractFile: null,
    expiryDate: '',
    signingValidUntil: ''
  });
  const [uploadingFile, setUploadingFile] = useState(false);
  const [currentContractFileName, setCurrentContractFileName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState({});

  // Fetch contracts on component mount and when page changes
  useEffect(() => {
    fetchContracts();
  }, [pagination.page]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await getContracts(pagination.page, pagination.limit);
      
      const formattedContracts = response.contracts.map(formatContractData);
      setContracts(formattedContracts);
      
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleDownload = (url, filename) => {
    if (!url) {
      toast.error('File not available');
      return;
    }
    
    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'contract.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openContractModal = (contract) => {
    setSelectedContract(contract);
    setShowContractModal(true);
  };

  const closeContractModal = () => {
    setSelectedContract(null);
    setShowContractModal(false);
  };

  const approveContract = async (contract) => {
    try {
      toast.loading('Approving contract...', { id: 'contract-approval' });
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('access_token');
      
      await axios.post(
        `${baseUrl}contracts/${contract.id}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Contract approved successfully!', { id: 'contract-approval' });
      closeContractModal();
      
      // Refresh contracts list
      fetchContracts();
      
    } catch (error) {
      console.error('Error approving contract:', error);
      toast.error('Failed to approve contract: ' + (error.response?.data?.message || error.message), { id: 'contract-approval' });
    }
  };

  const rejectContract = async (contract) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      toast.loading('Rejecting contract...', { id: 'contract-rejection' });
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('access_token');
      
      await axios.patch(
        `${baseUrl}contracts/${contract.id}/reject`,
        {
          reason: rejectionReason
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Contract rejected successfully!', { id: 'contract-rejection' });
      setShowRejectModal(false);
      setRejectionReason('');
      closeContractModal();
      
      // Refresh contracts list
      fetchContracts();
      
    } catch (error) {
      console.error('Error rejecting contract:', error);
      toast.error('Failed to reject contract: ' + (error.response?.data?.message || error.message), { id: 'contract-rejection' });
    }
  };

  const openRejectModal = () => {
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const editContract = async (contract) => {
    if (!editFormData.title.trim()) {
      toast.error('Contract title is required');
      return;
    }

    if (!editFormData.amount || editFormData.amount <= 0) {
      toast.error('Valid contract amount is required');
      return;
    }

    if (!editFormData.signingValidUntil) {
      toast.error('Offer valid till date is required');
      return;
    }

    if (new Date(editFormData.signingValidUntil) <= new Date()) {
      toast.error('Offer valid till date must be in the future');
      return;
    }

    try {
      toast.loading('Updating contract...', { id: 'contract-edit' });
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('access_token');
      
      const updateData = {
        title: editFormData.title,
        amount: parseFloat(editFormData.amount)
      };

      if (editFormData.paymentResponsibility) {
        updateData.paymentResponsibility = editFormData.paymentResponsibility;
      }

      if (editFormData.expiryDate) {
        updateData.expiryDate = editFormData.expiryDate;
      }

      if (editFormData.signingValidUntil) {
        updateData.signingValidUntil = editFormData.signingValidUntil;
      }

      // Handle file upload if a new file is selected
      if (editFormData.contractFile) {
        try {
          const uploadResult = await uploadFile(editFormData.contractFile);
          updateData.contractFileUrl = uploadResult.mediaUrl;
        } catch (uploadError) {
          toast.error('Failed to upload contract file', { id: 'contract-edit' });
          return;
        }
      }
      
      await axios.patch(
        `${baseUrl}contracts/${contract.id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success('Contract updated successfully!', { id: 'contract-edit' });
      setShowEditModal(false);
      closeContractModal();
      
      // Refresh contracts list
      fetchContracts();
      
    } catch (error) {
      console.error('Error updating contract:', error);
      toast.error('Failed to update contract: ' + (error.response?.data?.message || error.message), { id: 'contract-edit' });
    }
  };

  const openEditModal = (contract) => {
    // Extract filename from contract URL if it exists
    let fileName = '';
    if (contract.contractFileUrl) {
      const urlParts = contract.contractFileUrl.split('/');
      fileName = urlParts[urlParts.length - 1] || 'contract-file.pdf';
    }
    
    setCurrentContractFileName(fileName);
    setEditFormData({
      title: contract.title || '',
      amount: contract.amount ? contract.amount.replace(/[^0-9.]/g, '') : '',
      paymentResponsibility: contract.paymentResponsibility || '',
      contractFile: null,
      expiryDate: contract.expiryDate ? new Date(contract.expiryDate).toISOString().split('T')[0] : '',
      signingValidUntil: contract.signingValidUntil ? new Date(contract.signingValidUntil).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditFormData({
      title: '',
      amount: '',
      paymentResponsibility: '',
      contractFile: null,
      expiryDate: '',
      signingValidUntil: ''
    });
    setUploadingFile(false);
    setCurrentContractFileName('');
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setEditFormData({...editFormData, contractFile: file});
    }
  };

  const toggleDropdown = (contractId) => {
    setDropdownOpen(prev => ({
      ...prev,
      [contractId]: !prev[contractId]
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownOpen({});
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      closeAllDropdowns();
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const initiatePayment = async (contract) => {
    try {
      toast.loading('Redirecting to payment...', { id: 'contract-payment' });
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        `${baseUrl}payment/contract-checkout`,
        {
          contractId: contract.id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Redirect to Stripe payment page
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Payment URL not received', { id: 'contract-payment' });
      }
      
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment: ' + (error.response?.data?.message || error.message), { id: 'contract-payment' });
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-full px-0 md:px-4 py-6 overflow-x-hidden">
        <h2 className="text-[#9afa00] text-2xl font-bold mb-6 uppercase tracking-wide text-center md:text-left">Contracts</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#232626] rounded-xl p-4 flex items-center gap-4">
          <FaFileContract className="text-[#9afa00] text-2xl" />
          <div>
            <div className="text-white font-bold text-lg">{pagination.total}</div>
            <div className="text-gray-400 text-sm">Total Contracts</div>
          </div>
        </div>
        <div className="bg-[#232626] rounded-xl p-4 flex items-center gap-4">
          <FaCalendarAlt className="text-[#9afa00] text-2xl" />
          <div>
            <div className="text-white font-bold text-lg">{contracts.filter(c => c.status === 'Signed').length}</div>
            <div className="text-gray-400 text-sm">Active Contracts</div>
          </div>
        </div>
        <div className="bg-[#232626] rounded-xl p-4 flex items-center gap-4">
          <FaDollarSign className="text-[#9afa00] text-2xl" />
          <div>
            <div className="text-white font-bold text-lg">{contracts.filter(c => c.status === 'Pending').length}</div>
            <div className="text-gray-400 text-sm">Pending Signature</div>
          </div>
        </div>
      </div>
        <div className="flex justify-center items-center py-16">
          <FaSpinner className="animate-spin text-[#9afa00] text-4xl" />
          <span className="text-white text-xl ml-4">Loading contracts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-0 md:px-4 py-6 overflow-x-hidden">
      <h2 className="text-[#9afa00] text-2xl font-bold mb-6 uppercase tracking-wide text-center md:text-left">Contracts</h2>
      <div className="w-full overflow-x-auto">
        <table className="min-w-[700px] w-full text-white text-sm md:text-base">
          <thead>
            <tr className="border-b border-gray-600 text-left">
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Contract Title</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Athlete</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Amount</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Date Created</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Expiry Date</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Status</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-lg">
                  <div className="flex flex-col items-center gap-4">
                    <FaFileContract className="text-gray-500 text-4xl" />
                    <span>No contracts found</span>
                    <p className="text-gray-400 text-sm">Contracts you create will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              contracts.map((contract) => (
                <tr key={contract.id} className="border-b border-gray-700 hover:bg-[#232626] transition">
                  <td className="py-3 px-2 md:py-4 md:px-4">
                    <div>
                      <div className="font-semibold">{contract.title}</div>
                      {contract.description && (
                        <div className="text-gray-400 text-xs mt-1">{contract.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">{contract.athlete}</td>
                  <td className="py-3 px-2 md:py-4 md:px-4">
                    <div>
                      <div className="font-semibold">{contract.amount}</div>
                      <div className="text-gray-400 text-xs">Total: {contract.totalAmount}</div>
                    </div>
                  </td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">{contract.dateCreated}</td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">{contract.expiryDate}</td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">
                    <span className={`font-bold ${contract.statusColor}`}>{contract.status}</span>
                  </td>
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">
                     <div className="flex gap-2">
                       <button
                         onClick={() => openContractModal(contract)}
                         className="inline-flex items-center justify-center bg-blue-600 text-white p-2 rounded-md font-bold hover:bg-blue-700 transition"
                         title="View Contract Details"
                       >
                         <FaEye />
                       </button>
                       {(contract.contractFileUrl || contract.signedContractFileUrl) && (
                         <div className="relative">
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               toggleDropdown(contract.id);
                             }}
                             className="inline-flex items-center justify-center bg-[#232626] border border-[#9afa00] text-[#9afa00] p-2 rounded-md font-bold hover:bg-[#9afa00] hover:text-black transition relative"
                             title="Download Options"
                           >
                             <FaDownload /> <FaChevronDown className="ml-1" />
                           </button>
                           {dropdownOpen[contract.id] && (
                             <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-gray-600 rounded-md shadow-lg z-10">
                               {contract.contractFileUrl && (
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDownload(contract.contractFileUrl, `${contract.title}-contract.pdf`);
                                     closeAllDropdowns();
                                   }}
                                   className="w-full text-left px-4 py-2 text-white hover:bg-[#232626] transition flex items-center gap-2"
                                 >
                                   <FaDownload /> Contract File
                                 </button>
                               )}
                               {contract.signedContractFileUrl && (
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleDownload(contract.signedContractFileUrl, `${contract.title}-signed.pdf`);
                                     closeAllDropdowns();
                                   }}
                                   className="w-full text-left px-4 py-2 text-white hover:bg-[#232626] transition flex items-center gap-2"
                                 >
                                   <FaDownload /> Signed Contract
                                 </button>
                               )}
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8 w-full">
          <button
            className="bg-black text-white px-3 py-2 rounded-md disabled:opacity-50"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            {'<'}
          </button>
          
          {/* Page numbers */}
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNum;
            if (pagination.totalPages <= 5) {
              pageNum = i + 1;
            } else if (pagination.page <= 3) {
              pageNum = i + 1;
            } else if (pagination.page >= pagination.totalPages - 2) {
              pageNum = pagination.totalPages - 4 + i;
            } else {
              pageNum = pagination.page - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                className={`px-3 py-2 rounded-md font-bold ${
                  pagination.page === pageNum 
                    ? 'bg-[#9afa00] text-black' 
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
            <>
              <span className="px-2 text-white">...</span>
              <button
                className="px-3 py-2 rounded-md font-bold bg-black text-white hover:bg-gray-800"
                onClick={() => handlePageChange(pagination.totalPages)}
              >
                {pagination.totalPages}
              </button>
            </>
          )}
          
          <button
            className="bg-black text-white px-3 py-2 rounded-md disabled:opacity-50"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            {'>'}
          </button>
        </div>
       )}

       {/* Contract Details Modal */}
       {showContractModal && selectedContract && (
         <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
           <div className="bg-[#1a1a1a] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center p-6 border-b border-gray-700">
               <h3 className="text-xl font-bold text-[#9afa00]">Contract Details</h3>
               <button
                 onClick={closeContractModal}
                 className="text-gray-400 hover:text-white transition"
               >
                 <FaTimes className="text-xl" />
               </button>
             </div>
             
             <div className="p-6 space-y-6">
               {/* Contract Title */}
               <div>
                 <label className="block text-gray-400 text-sm font-medium mb-2">Contract Title</label>
                 <div className="text-white text-lg font-semibold">{selectedContract.title}</div>
               </div>

               {/* Description */}
               {selectedContract.description && (
                 <div>
                   <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                   <div className="text-white">{selectedContract.description}</div>
                 </div>
               )}

               {/* Athlete Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-gray-400 text-sm font-medium mb-2">Athlete</label>
                   <div className="text-white font-semibold">{selectedContract.athlete}</div>
                 </div>
                 <div>
                   <label className="block text-gray-400 text-sm font-medium mb-2">Status</label>
                   <div className={`font-bold ${selectedContract.statusColor}`}>{selectedContract.status}</div>
                 </div>
               </div>

               {/* Financial Details */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-gray-400 text-sm font-medium mb-2">Contract Amount</label>
                   <div className="text-white font-semibold text-lg">{selectedContract.amount}</div>
                 </div>
                 <div>
                   <label className="block text-gray-400 text-sm font-medium mb-2">Total Amount</label>
                   <div className="text-white font-semibold">{selectedContract.totalAmount}</div>
                 </div>
               </div>

               {/* Who is going to pay the contract fee ? */}
               {selectedContract.paymentResponsibility && (
                 <div>
                   <label className="block text-gray-400 text-sm font-medium mb-2">Who is going to pay the contract fee ?</label>
                   <div className="text-white">{selectedContract.paymentResponsibility}</div>
                 </div>
               )}

               {/* Dates */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-gray-400 text-sm font-medium mb-2">Date Created</label>
                   <div className="text-white">{selectedContract.dateCreated}</div>
                 </div>
                 <div>
                   <label className="block text-gray-400 text-sm font-medium mb-2">Expiry Date</label>
                   <div className="text-white">{selectedContract.expiryDate}</div>
                 </div>
               </div>
               
               {selectedContract.signingValidUntil && selectedContract.signingValidUntil !== 'N/A' && (
                 <div>
                   <label className="block text-gray-400 text-sm font-medium mb-2">Offer valid till</label>
                   <div className={`font-semibold ${selectedContract.status === 'Expired' ? 'text-red-400' : 'text-white'}`}>
                     {selectedContract.signingValidUntil}
                   </div>
                 </div>
               )}

               {/* Rejection Reason */}
               {selectedContract.status === 'rejected_by_athlete' && selectedContract.rejectionReason && !selectedContract.signed && (
                 <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                   <label className="block text-red-400 text-sm font-medium mb-2">Rejection Reason</label>
                   <div className="text-red-300">{selectedContract.rejectionReason}</div>
                 </div>
               )}

               {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  {selectedContract.status === 'Expired' && (
                    <div className="flex-1 text-center py-3 px-4 bg-gray-800 text-gray-400 rounded-md">
                      Contract offer has expired
                    </div>
                  )}
                  {selectedContract.status === 'pending_brand_approval' && (
                    <>
                      <button
                        onClick={() => approveContract(selectedContract)}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-md font-bold hover:bg-green-700 transition"
                      >
                        <FaCheck /> Approve Contract
                      </button>
                      <button
                        onClick={openRejectModal}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-md font-bold hover:bg-red-700 transition"
                      >
                        <FaBan /> Reject Contract
                      </button>
                    </>
                  )}
                  {(selectedContract.status === 'Pending Signature' || selectedContract.status === 'rejected_by_athlete') && (
                    <button
                      onClick={() => openEditModal(selectedContract)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-md font-bold hover:bg-blue-700 transition"
                    >
                      <FaEdit /> {selectedContract.status === 'rejected_by_athlete' ? 'Edit & Resubmit Contract' : 'Edit Contract'}
                    </button>
                  )}
                  {selectedContract.status === 'pending_payment' && (
                    <button
                      onClick={() => initiatePayment(selectedContract)}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-md font-bold hover:bg-blue-700 transition"
                    >
                      <FaCreditCard /> Make Payment
                    </button>
                  )}

                </div>
             </div>
           </div>
         </div>
       )}

       {/* Rejection Modal */}
       {showRejectModal && selectedContract && (
         <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
           <div className="bg-[#1a1a1a] rounded-xl max-w-md w-full">
             <div className="flex justify-between items-center p-6 border-b border-gray-700">
               <h3 className="text-xl font-bold text-red-500">Reject Contract</h3>
               <button
                 onClick={closeRejectModal}
                 className="text-gray-400 hover:text-white transition"
               >
                 <FaTimes className="text-xl" />
               </button>
             </div>
             
             <div className="p-6 space-y-4">
               <div>
                 <label className="block text-gray-400 text-sm font-medium mb-2">Reason for Rejection</label>
                 <textarea
                   value={rejectionReason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                   placeholder="Please provide a reason for rejecting this contract..."
                   className="w-full bg-[#232626] border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#9afa00] resize-none"
                   rows={4}
                 />
               </div>
               
               <div className="flex gap-3 pt-4">
                 <button
                   onClick={closeRejectModal}
                   className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-md font-bold hover:bg-gray-700 transition"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => rejectContract(selectedContract)}
                   className="flex-1 bg-red-600 text-white px-4 py-3 rounded-md font-bold hover:bg-red-700 transition"
                 >
                   Reject Contract
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Edit Contract Modal */}
       {showEditModal && selectedContract && (
         <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50 p-4">
           <div className="bg-[#1a1a1a] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center p-6 border-b border-gray-700">
               <h3 className="text-xl font-bold text-blue-500">Edit Contract</h3>
               <button
                 onClick={closeEditModal}
                 className="text-gray-400 hover:text-white transition"
               >
                 <FaTimes className="text-xl" />
               </button>
             </div>
             
             <div className="p-6 space-y-4">
               <div>
                 <label className="block text-gray-400 text-sm font-medium mb-2">Contract Title *</label>
                 <input
                   type="text"
                   value={editFormData.title}
                   onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                   placeholder="Enter contract title..."
                   className="w-full bg-[#232626] border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#9afa00]"
                 />
               </div>
               
               <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Who is going to pay the contract fee ?</label>
                  <select
                    value={editFormData.paymentResponsibility}
                    onChange={(e) => setEditFormData({...editFormData, paymentResponsibility: e.target.value})}
                    className="w-full bg-[#232626] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#9afa00]"
                  >
                    <option value="">Select payment responsibility...</option>
                    <option value="brand">Brand</option>
                    <option value="athlete">Athlete</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Contract File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full bg-[#232626] border border-gray-600 rounded-md px-3 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#9afa00] file:text-black hover:file:bg-[#baff32] focus:outline-none focus:border-[#9afa00]"
                  />
                  {editFormData.contractFile ? (
                    <p className="text-sm text-gray-400 mt-1">Selected: {editFormData.contractFile.name}</p>
                  ) : currentContractFileName ? (
                    <p className="text-sm text-gray-400 mt-1">Current: {currentContractFileName}</p>
                  ) : null}
                </div>
               
               <div>
                 <label className="block text-gray-400 text-sm font-medium mb-2">Contract Amount *</label>
                 <input
                   type="number"
                   value={editFormData.amount}
                   onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                   placeholder="Enter amount..."
                   className="w-full bg-[#232626] border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-[#9afa00]"
                   min="0"
                   step="0.01"
                 />
               </div>
               
               <div>
                 <label className="block text-gray-400 text-sm font-medium mb-2">Expiry Date</label>
                 <input
                   type="date"
                   value={editFormData.expiryDate}
                   onChange={(e) => setEditFormData({...editFormData, expiryDate: e.target.value})}
                   className="w-full bg-[#232626] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#9afa00]"
                 />
               </div>
               
               <div>
                 <label className="block text-gray-400 text-sm font-medium mb-2">Offer valid till *</label>
                 <input
                   type="date"
                   value={editFormData.signingValidUntil}
                   onChange={(e) => setEditFormData({...editFormData, signingValidUntil: e.target.value})}
                   className="w-full bg-[#232626] border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#9afa00]"
                   min={new Date().toISOString().split('T')[0]}
                 />
               </div>
               
               <div className="flex gap-3 pt-4">
                 <button
                   onClick={closeEditModal}
                   className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-md font-bold hover:bg-gray-700 transition"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={() => editContract(selectedContract)}
                   className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md font-bold hover:bg-blue-700 transition"
                 >
                   Update Contract
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };
 
 export default BrandContracts;