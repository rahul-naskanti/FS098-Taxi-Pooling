import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationTriangle, FaUser, FaEnvelope, FaPhone, FaCar, FaIdCard, FaBuilding, FaRegFileAlt, FaEye } from 'react-icons/fa';
import { adminService } from '../../services/adminService';

const MOCK_DOCS = {
  licenseImage: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=800&auto=format&fit=crop&q=80',
  rcDocument: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  idProof: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'
};

function AdminVerifications() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'verified', 'rejected'
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);

  const fetchDriversQueue = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getDrivers({
        page: 1,
        limit: 50,
        verificationStatus: activeTab
      });
      if (res.success) {
        setDrivers(res.drivers);
        // Automatically select the first driver if available
        if (res.drivers.length > 0) {
          setSelectedDriver(res.drivers[0]);
        } else {
          setSelectedDriver(null);
        }
      }
    } catch (err) {
      console.error('Error fetching verification queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDriversQueue();
    // Reset state
    setRejecting(false);
    setRejectionReason('');
    setSelectedDocUrl(null);
  }, [activeTab]);

  const handleVerify = async (status) => {
    if (!selectedDriver) return;
    if (status === 'rejected' && !rejectionReason.trim()) {
      showFeedback('Please provide a reason for rejection', true);
      return;
    }

    setSubmittingStatus(true);
    try {
      const res = await adminService.updateVerificationStatus(selectedDriver._id, {
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : ''
      });

      if (res.success) {
        showFeedback(status === 'verified' ? 'Driver verification approved!' : 'Driver verification rejected.');
        // Remove driver from local state or reload
        setDrivers(drivers.filter(d => d._id !== selectedDriver._id));
        if (drivers.length > 1) {
          const nextIndex = drivers.findIndex(d => d._id === selectedDriver._id);
          const nextDriver = drivers[nextIndex === drivers.length - 1 ? nextIndex - 1 : nextIndex + 1];
          setSelectedDriver(nextDriver);
        } else {
          setSelectedDriver(null);
        }
        setRejecting(false);
        setRejectionReason('');
      }
    } catch (err) {
      console.error('Failed to update driver status:', err);
      showFeedback('Failed to update verification status', true);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const showFeedback = (msg, isError = false) => {
    setFeedbackMsg({ text: msg, isError });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const getDocUrl = (docName, driver) => {
    if (driver?.uploadedDocuments?.[docName]) {
      return driver.uploadedDocuments[docName];
    }
    return MOCK_DOCS[docName];
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white font-display">Driver Verification Moderation Queue</h1>
        <p className="text-xs text-slate-500 font-sans">Verify driver credentials, licenses, and registration details to ensure trust & safety.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0d1020] border border-slate-800 p-1 rounded-2xl w-full max-w-md">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'pending' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FaExclamationTriangle className="text-[11px]" /> Pending Review
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'verified' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FaCheckCircle className="text-[11px]" /> Verified
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'rejected' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <FaTimesCircle className="text-[11px]" /> Rejected
        </button>
      </div>

      {feedbackMsg && (
        <div className={`p-3.5 border rounded-2xl text-xs font-bold animate-fadeIn ${
          feedbackMsg.isError 
            ? 'bg-red-500/10 border-red-500/20 text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {feedbackMsg.text}
        </div>
      )}

      {isLoading ? (
        <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium">Loading verification queue...</p>
          </div>
        </div>
      ) : drivers.length === 0 ? (
        <div className="bg-[#0d1020] border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs font-sans">
          No drivers currently in the <span className="text-white font-bold">{activeTab}</span> verification queue.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Driver Queue Sidebar */}
          <div className="lg:col-span-4 space-y-3 bg-[#0d1020] border border-slate-800 rounded-3xl p-4 max-h-[600px] overflow-y-auto">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-1">Queue List ({drivers.length})</p>
            {drivers.map((d) => (
              <button
                key={d._id}
                onClick={() => {
                  setSelectedDriver(d);
                  setRejecting(false);
                  setRejectionReason('');
                  setSelectedDocUrl(null);
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                  selectedDriver?._id === d._id
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-slate-950/20 border-slate-900 text-slate-400 hover:text-white hover:border-slate-800'
                }`}
              >
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{d.fullName}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{d.vehicleName || 'No Vehicle'}</p>
                </div>
                <span className={`text-[8px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full ${
                  d.verificationStatus === 'verified'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : d.verificationStatus === 'rejected'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {d.verificationStatus}
                </span>
              </button>
            ))}
          </div>

          {/* Details Pane */}
          {selectedDriver && (
            <div className="lg:col-span-8 bg-[#0d1020] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-850 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-black text-sm border border-indigo-500/25 shrink-0">
                    {selectedDriver.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">{selectedDriver.fullName}</h2>
                    <p className="text-[10px] text-slate-500 leading-none mt-1">Driver Profile ID: {selectedDriver._id}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[9px] uppercase tracking-wider font-black px-2.5 py-1 rounded-full border ${
                    selectedDriver.verificationStatus === 'verified'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : selectedDriver.verificationStatus === 'rejected'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {selectedDriver.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Driver and Vehicle Meta info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/20 border border-slate-900 rounded-2xl p-4">
                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Driver Contacts</p>
                  <p className="text-xs text-slate-350 flex items-center gap-2">
                    <FaEnvelope className="text-slate-500 text-[10px]" /> {selectedDriver.email}
                  </p>
                  <p className="text-xs text-slate-350 flex items-center gap-2">
                    <FaPhone className="text-slate-500 text-[10px]" /> {selectedDriver.phone || 'N/A'}
                  </p>
                  {selectedDriver.company && (
                    <p className="text-xs text-slate-350 flex items-center gap-2">
                      <FaBuilding className="text-slate-500 text-[10px]" /> {selectedDriver.company}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">Vehicle Specifications</p>
                  <p className="text-xs text-slate-350 flex items-center gap-2">
                    <FaCar className="text-slate-500 text-[10px]" /> {selectedDriver.vehicleName || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-350 flex items-center gap-2">
                    <FaIdCard className="text-slate-500 text-[10px]" /> Plate: {selectedDriver.vehicleNumber || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-350 flex items-center gap-2">
                    <FaRegFileAlt className="text-slate-500 text-[10px]" /> License No: {selectedDriver.licenseNumber || 'N/A'} (Seats: {selectedDriver.availableSeats || 0})
                  </p>
                </div>
              </div>

              {/* Documents grid */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document Verifications</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* License Image */}
                  <div className="bg-[#070a13] border border-slate-900 rounded-2xl overflow-hidden group relative">
                    <div className="h-28 bg-slate-950 flex items-center justify-center overflow-hidden">
                      <img 
                        src={getDocUrl('licenseImage', selectedDriver)} 
                        alt="License Document" 
                        className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between border-t border-slate-900 bg-slate-950/40">
                      <span className="text-[10px] text-slate-400 font-bold">Driver License</span>
                      <button 
                        onClick={() => setSelectedDocUrl(getDocUrl('licenseImage', selectedDriver))}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-400 text-xs border border-slate-800 cursor-pointer"
                        title="View Document"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  {/* RC Document */}
                  <div className="bg-[#070a13] border border-slate-900 rounded-2xl overflow-hidden group relative">
                    <div className="h-28 bg-slate-950 flex items-center justify-center overflow-hidden">
                      <img 
                        src={getDocUrl('rcDocument', selectedDriver)} 
                        alt="RC Certificate" 
                        className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between border-t border-slate-900 bg-slate-950/40">
                      <span className="text-[10px] text-slate-400 font-bold">Vehicle RC</span>
                      <button 
                        onClick={() => setSelectedDocUrl(getDocUrl('rcDocument', selectedDriver))}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-400 text-xs border border-slate-800 cursor-pointer"
                        title="View Document"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>

                  {/* ID Proof */}
                  <div className="bg-[#070a13] border border-slate-900 rounded-2xl overflow-hidden group relative">
                    <div className="h-28 bg-slate-950 flex items-center justify-center overflow-hidden">
                      <img 
                        src={getDocUrl('idProof', selectedDriver)} 
                        alt="ID Card Proof" 
                        className="object-cover w-full h-full opacity-60 group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                    <div className="p-3 flex items-center justify-between border-t border-slate-900 bg-slate-950/40">
                      <span className="text-[10px] text-slate-400 font-bold">National ID Proof</span>
                      <button 
                        onClick={() => setSelectedDocUrl(getDocUrl('idProof', selectedDriver))}
                        className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-400 text-xs border border-slate-800 cursor-pointer"
                        title="View Document"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warnings on Mockups */}
              {(!selectedDriver.uploadedDocuments?.licenseImage) && (
                <div className="p-3 bg-indigo-950/20 border border-indigo-500/15 text-indigo-400 text-[10px] rounded-xl flex items-center gap-2">
                  <FaExclamationTriangle className="shrink-0 text-xs" />
                  <span>Notice: Using standard simulated fallback documents for vetting review. Actual production uploads can be connected via cloud storage.</span>
                </div>
              )}

              {/* Rejected reason logs display */}
              {selectedDriver.verificationStatus === 'rejected' && selectedDriver.rejectionReason && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
                  Rejection Log: "{selectedDriver.rejectionReason}"
                </div>
              )}

              {/* Action Moderation Toolbar */}
              {activeTab === 'pending' && (
                <div className="border-t border-slate-850 pt-5 space-y-4">
                  {rejecting ? (
                    <div className="space-y-3 bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rejection Explanation Reason</label>
                      <textarea
                        rows="3"
                        placeholder="State why the credentials were rejected (e.g. invalid license expiration, blur image, mismatched name)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full bg-[#070a13] border border-slate-800 focus:border-red-500 text-xs text-white placeholder-slate-500 p-3 rounded-xl transition-all outline-none resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setRejecting(false); setRejectionReason(''); }}
                          className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleVerify('rejected')}
                          disabled={submittingStatus}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                          {submittingStatus && <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>}
                          Submit Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setRejecting(true)}
                        disabled={submittingStatus}
                        className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 hover:border-red-500/40 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        Reject Verification
                      </button>
                      <button
                        onClick={() => handleVerify('verified')}
                        disabled={submittingStatus}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                      >
                        {submittingStatus && <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>}
                        Approve Credentials
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Large Image Modal */}
      {selectedDocUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-55 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0d1020] border border-slate-800 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative">
            <button
              onClick={() => setSelectedDocUrl(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-850 cursor-pointer"
            >
              ✕ Close
            </button>
            <div className="p-4 border-b border-slate-850">
              <p className="text-xs font-bold text-white">Vetting Document Preview</p>
            </div>
            <div className="p-6 bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img 
                src={selectedDocUrl} 
                alt="Document Verification Preview" 
                className="object-contain max-h-[60vh] max-w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVerifications;
