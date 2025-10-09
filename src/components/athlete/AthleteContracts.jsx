import React, { useState, useEffect, useRef } from 'react';
import { FaDownload, FaFileContract, FaCalendarAlt, FaDollarSign, FaSpinner, FaEye, FaTimes, FaPen, FaChevronDown } from 'react-icons/fa';
import { getContracts, formatContractData } from '../../services/contractService';
import { uploadFile } from '../../services/uploadService';
import documentSigningService from '../../services/documentSigningService';
import axios from 'axios';
import toast from 'react-hot-toast';

const AthleteContracts = () => {
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
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signature, setSignature] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureStep, setSignatureStep] = useState('draw'); // 'draw', 'preview', 'signing'
  const canvasRef = useRef(null);
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

  const openSignatureModal = (contract) => {
    setSelectedContract(contract);
    setShowSignatureModal(true);
    setSignatureStep('draw');
    
    // Initialize canvas after modal opens
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }, 100);
  };

  const closeSignatureModal = () => {
    setShowSignatureModal(false);
    setSelectedContract(null);
    setSignature('');
    setSignatureStep('draw');
    clearSignature();
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

  // Signature canvas functions
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignature('');
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataURL = canvas.toDataURL();
      setSignature(dataURL);
      setSignatureStep('preview');
    }
  };

  const signContract = async () => {
    if (!selectedContract || !signature) {
      toast.error('Please provide a signature first');
      return;
    }

    try {
      setSignatureStep('signing');
      toast.loading('Signing contract...', { id: 'contract-signing' });

      // Sign the PDF using the document signing service
      const signedDocument = await documentSigningService.signDocument(
        {
          type: 'pdf',
          url: selectedContract.contractFileUrl,
          name: selectedContract.title + '.pdf'
        },
        signature,
        {
          signatureWidth: 120,
          signatureHeight: 40
        }
      );

      // Upload the signed document
      const uploadResult = await uploadFile(signedDocument.blob);

      // Make API call to save the signed contract
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('access_token');
      
      await axios.post(
        `${baseUrl}contracts/${selectedContract.id}/sign`,
        {
          signature: selectedContract.title,
          signedContractFileUrl: uploadResult.mediaUrl
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Contract signed successfully!', { id: 'contract-signing' });
      closeSignatureModal();
      
      // Refresh contracts list
      fetchContracts();
      
    } catch (error) {
      console.error('Error signing contract:', error);
      toast.error('Failed to sign contract: ' + (error.response?.data?.message || error.message), { id: 'contract-signing' });
      setSignatureStep('draw');
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-full px-0 md:px-4 py-6 overflow-x-hidden">
        <h2 className="text-[#9afa00] text-2xl font-bold mb-6 uppercase tracking-wide text-center md:text-left">My Contracts</h2>
        <div className="flex justify-center items-center py-16">
          <FaSpinner className="animate-spin text-[#9afa00] text-4xl" />
          <span className="text-white text-xl ml-4">Loading contracts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-0 md:px-4 py-6 overflow-x-hidden">
      <h2 className="text-[#9afa00] text-2xl font-bold mb-6 uppercase tracking-wide text-center md:text-left">My Contracts</h2>
      
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
            <div className="text-white font-bold text-lg">{contracts.filter(c => c.status === 'Pending Signature').length}</div>
            <div className="text-gray-400 text-sm">Pending Signature</div>
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-[700px] w-full text-white text-sm md:text-base">
          <thead>
            <tr className="border-b border-gray-600 text-left">
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Contract Title</th>
              <th className="py-3 px-2 md:py-4 md:px-4 font-semibold">Brand</th>
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
                    <p className="text-gray-400 text-sm">Contracts from brands will appear here</p>
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
                  <td className="py-3 px-2 md:py-4 md:px-4 whitespace-nowrap">{contract.brand}</td>
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

              {/* Rejection Reason - Only show if status is Pending Signature and rejection reason exists */}
              {selectedContract.status === 'pending_athlete_signature' && selectedContract.rejectionReason && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                  <label className="block text-red-400 text-sm font-medium mb-2">Rejection Reason</label>
                  <div className="text-red-300">{selectedContract.rejectionReason}</div>
                  <div className="text-red-400 text-xs mt-2">Please review the feedback and sign the contract again.</div>
                </div>
              )}

              {/* Brand Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Brand</label>
                  <div className="text-white font-semibold">{selectedContract.brand}</div>
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

              {/* Payment Responsibility */}
              {selectedContract.paymentResponsibility && (
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Payment Responsibility</label>
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                {!selectedContract.signedContractFileUrl && (
                   <button
                     onClick={() => openSignatureModal(selectedContract)}
                     className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-md font-bold hover:bg-blue-700 transition"
                   >
                     <FaPen /> Sign Contract
                   </button>
                 )}
              </div>
            </div>
          </div>
        </div>
       )}

       {/* Signature Modal */}
       {showSignatureModal && selectedContract && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-[#1a1a1a] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center p-6 border-b border-gray-700">
               <h3 className="text-xl font-bold text-[#9afa00]">
                 {signatureStep === 'draw' && 'Sign Contract'}
                 {signatureStep === 'preview' && 'Preview Signature'}
                 {signatureStep === 'signing' && 'Signing Contract...'}
               </h3>
               <button
                 onClick={closeSignatureModal}
                 className="text-gray-400 hover:text-white transition"
                 disabled={signatureStep === 'signing'}
               >
                 <FaTimes className="text-xl" />
               </button>
             </div>
             
             <div className="p-6">
               {signatureStep === 'draw' && (
                 <div className="space-y-6">
                   {/* Contract Info */}
                   <div className="bg-[#2a3622]/20 rounded-xl p-4 border border-[#9afa00]/20">
                     <h4 className="text-white font-semibold mb-2">{selectedContract.title}</h4>
                     <p className="text-gray-400 text-sm">Brand: {selectedContract.brand}</p>
                     <p className="text-gray-400 text-sm">Amount: {selectedContract.amount}</p>
                   </div>

                   {/* PDF Preview */}
                   <div className="bg-[#2a3622]/20 rounded-xl p-4 border border-[#9afa00]/20">
                     <h4 className="text-white font-semibold mb-4">Contract Document</h4>
                     <div className="bg-white rounded-lg p-4 text-center">
                       <iframe
                         src={selectedContract.contractFileUrl}
                         className="w-full h-96 border rounded"
                         title="Contract PDF"
                       />
                       <p className="text-gray-600 text-sm mt-2">
                         <a 
                           href={selectedContract.contractFileUrl} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:underline"
                         >
                           Open in new tab for better viewing
                         </a>
                       </p>
                     </div>
                   </div>

                   {/* Signature Canvas */}
                   <div className="bg-[#2a3622]/20 rounded-xl p-4 border border-[#9afa00]/20">
                     <h4 className="text-white font-semibold mb-4">Your Signature</h4>
                     <div className="bg-white rounded-lg p-4">
                       <canvas
                         ref={canvasRef}
                         width={600}
                         height={200}
                         className="border border-gray-300 rounded cursor-crosshair w-full"
                         onMouseDown={startDrawing}
                         onMouseMove={draw}
                         onMouseUp={stopDrawing}
                         onMouseLeave={stopDrawing}
                         style={{ touchAction: 'none' }}
                       />
                       <div className="flex gap-3 mt-4">
                         <button
                           onClick={clearSignature}
                           className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                         >
                           Clear
                         </button>
                         <button
                           onClick={saveSignature}
                           className="px-4 py-2 bg-[#9afa00] text-black rounded font-bold hover:bg-[#baff32] transition"
                         >
                           Save Signature
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
               )}

               {signatureStep === 'preview' && (
                 <div className="space-y-6">
                   <div className="text-center">
                     <h4 className="text-white text-lg font-semibold mb-2">Review Your Signature</h4>
                     <p className="text-gray-400">Please review your signature before signing the contract</p>
                   </div>

                   <div className="bg-white rounded-lg p-6">
                     <div className="text-center mb-4">
                       <h5 className="text-black font-semibold">Digital Signature Preview</h5>
                     </div>
                     <div className="border border-gray-300 rounded p-4 bg-gray-50">
                       {signature && (
                         <img src={signature} alt="Signature" className="max-w-full h-auto mx-auto" />
                       )}
                     </div>
                   </div>

                   <div className="flex gap-3">
                     <button
                       onClick={() => setSignatureStep('draw')}
                       className="flex-1 bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-gray-700 transition"
                     >
                       Back to Edit
                     </button>
                     <button
                       onClick={signContract}
                       className="flex-1 bg-[#9afa00] text-black font-bold py-3 px-6 rounded-xl hover:bg-[#baff32] transition"
                     >
                       Sign Contract
                     </button>
                   </div>
                 </div>
               )}

               {signatureStep === 'signing' && (
                 <div className="text-center py-12">
                   <FaSpinner className="animate-spin text-[#9afa00] text-4xl mx-auto mb-4" />
                   <h4 className="text-white text-lg font-semibold mb-2">Signing Contract...</h4>
                   <p className="text-gray-400">Please wait while we process your signature</p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}
     </div>
   );
 };
 
 export default AthleteContracts;