/* ✅ src/pages/ViewJobModal.jsx */
import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaTimes, FaCheck, FaBuilding, FaMapMarkerAlt, FaBriefcase, FaUser, FaCalendarAlt, FaRupeeSign, FaFileAlt, FaTag } from "react-icons/fa";
import { MdWork, MdCategory, MdAccessTime, MdDescription, MdAttachMoney } from "react-icons/md";
import Badge from "../components/ui/badge/Badge";

export default function ViewJobModal({ job, isOpen, onClose, onApprove, isApproving }) {
  if (!job) return null;

  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return "Not specified";
    const min = job.salaryMin ? job.salaryMin.toLocaleString() : "";
    const max = job.salaryMax ? job.salaryMax.toLocaleString() : "";
    const currency = job.salaryCurrency || "INR";
    
    if (min && max) return `${min} - ${max} ${currency}`;
    if (min) return `From ${min} ${currency}`;
    if (max) return `Up to ${max} ${currency}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const InfoSection = ({ title, icon: Icon, children }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="text-gray-400" />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="pl-6">
        {children}
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <FaBuilding className="text-blue-600 text-xl" />
                      </div>
                      <div>
                        <Dialog.Title className="text-xl font-bold text-gray-900">
                          {job.jobTitle || "Untitled Job"}
                        </Dialog.Title>
                        <p className="text-gray-600">{job.companyName}</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white rounded-lg transition"
                    >
                      <FaTimes className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <InfoSection title="Job Details" icon={MdWork}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Role:</span>
                            <span className="text-gray-700">{job.jobRole}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Type:</span>
                            <Badge color="blue">{job.employmentType}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Work Mode:</span>
                            <Badge color="purple">{job.workMode}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Location:</span>
                            <span className="text-gray-700 flex items-center gap-1">
                              <FaMapMarkerAlt className="text-xs" />
                              {job.location || "Not specified"}
                            </span>
                          </div>
                        </div>
                      </InfoSection>

                      <InfoSection title="Category" icon={MdCategory}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Main Category:</span>
                            <span className="text-gray-700">{job.jobCategory}</span>
                          </div>
                          {job.jobSubCategory && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Sub Category:</span>
                              <Badge color="gray">{job.jobSubCategory}</Badge>
                            </div>
                          )}
                        </div>
                      </InfoSection>

                      <InfoSection title="Salary Information" icon={MdAttachMoney}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Range:</span>
                            <span className="text-gray-700 flex items-center gap-1">
                              <FaRupeeSign />
                              {formatSalary()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Type:</span>
                            <span className="text-gray-700 capitalize">{job.salaryType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Visibility:</span>
                            <Badge color={job.salaryVisibility === "public" ? "green" : "yellow"}>
                              {job.salaryVisibility}
                            </Badge>
                          </div>
                        </div>
                      </InfoSection>

                      <InfoSection title="Requirements" icon={FaBriefcase}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Experience:</span>
                            <span className="text-gray-700">
                              {job.freshersAllowed ? "Fresher" : job.experience || "Not specified"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Openings:</span>
                            <span className="text-gray-700">{job.openingsCount || 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Urgency:</span>
                            <Badge color={job.urgencyLevel === "immediate" ? "red" : "yellow"}>
                              {job.urgencyLevel}
                            </Badge>
                          </div>
                        </div>
                      </InfoSection>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <InfoSection title="Job Description" icon={MdDescription}>
                        <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {job.jobDescription || "No description provided"}
                        </div>
                      </InfoSection>

                      <InfoSection title="Skills Required" icon={FaTag}>
                        <div className="space-y-2">
                          {job.requiredSkills && job.requiredSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {job.requiredSkills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No specific skills mentioned</p>
                          )}
                        </div>
                      </InfoSection>

                      <InfoSection title="Company Information" icon={FaBuilding}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Industry:</span>
                            <span className="text-gray-700">{job.companyIndustry}</span>
                          </div>
                          {job.companyWebsite && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Website:</span>
                              <a 
                                href={job.companyWebsite} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {job.companyWebsite}
                              </a>
                            </div>
                          )}
                        </div>
                      </InfoSection>

                      <InfoSection title="Posted By" icon={FaUser}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {job.postedBy?.profileAvatar ? (
                                <img 
                                  src={job.postedBy.profileAvatar} 
                                  alt={job.postedBy.userName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <FaUser className="text-gray-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{job.postedBy?.userName}</p>
                              <p className="text-sm text-gray-600">{job.postedBy?.email}</p>
                            </div>
                          </div>
                          {job.postedBy?.phoneNumber && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-medium">Phone:</span>
                              <span className="text-gray-700">{job.postedBy.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </InfoSection>

                      <InfoSection title="Dates" icon={FaCalendarAlt}>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Posted:</span>
                            <span className="text-gray-700">{formatDate(job.createdAt)}</span>
                          </div>
                          {job.endDate && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Expires:</span>
                              <span className="text-gray-700">{formatDate(job.endDate)}</span>
                            </div>
                          )}
                        </div>
                      </InfoSection>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      color={job.isApproved ? "success" : "warning"}
                      className="text-sm font-medium"
                    >
                      {job.isApproved ? "✓ Approved" : "⏳ Pending Approval"}
                    </Badge>
                    {job.isFeatured && (
                      <Badge color="purple" className="text-sm">
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                    >
                      Close
                    </button>
                    
                    {!job.isApproved && (
                      <button
                        onClick={() => onApprove(job._id)}
                        disabled={isApproving}
                        className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                          isApproving
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        {isApproving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Approving...
                          </>
                        ) : (
                          <>
                            <FaCheck />
                            Approve Job
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}