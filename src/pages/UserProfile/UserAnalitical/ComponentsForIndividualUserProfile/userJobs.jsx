import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Users, 
  Eye, 
  Award,
  ChevronRight,
  ExternalLink,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  Send,
  X,
  FileText,
  MessageSquare,
  Download
} from "lucide-react";

const modalAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
};

const contentAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.3 }
};

export default function UserJobs({ user, onClose }) {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Web Developer (React & Next.js)",
      company: "Shashwath Solution",
      appliedDate: "14 Sep '25",
      applicationSentDate: "14 Sep '25",
      status: "awaiting",
      totalApplications: 7855,
      recruiterViews: true,
      matchCriteria: [
        "Early Applicant",
        "React Experience 3+ years",
        "Location Match",
        "Salary Expectations Match"
      ],
      location: "Bangalore, India",
      jobType: "Full-time",
      salary: "₹12L - ₹18L",
      postedDate: "12 Sep '25",
      active: true,
      description: "We are looking for a skilled Web Developer with expertise in React and Next.js to join our team. You will be responsible for developing and maintaining high-quality web applications.",
      requirements: [
        "3+ years of experience with React.js",
        "Strong knowledge of Next.js framework",
        "Experience with TypeScript",
        "Familiarity with RESTful APIs",
        "Knowledge of modern frontend build tools"
      ]
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "Tech Innovations Inc.",
      appliedDate: "13 Sep '25",
      applicationSentDate: "13 Sep '25",
      status: "review",
      totalApplications: 3421,
      recruiterViews: true,
      matchCriteria: [
        "Early Applicant",
        "Perfect Skill Match",
        "Previous Industry Experience"
      ],
      location: "Remote",
      jobType: "Full-time",
      salary: "$100k - $140k",
      postedDate: "10 Sep '25",
      active: false,
      description: "Join our team as a Frontend Developer and work on cutting-edge web applications. We value creativity and technical excellence.",
      requirements: [
        "5+ years of frontend development",
        "Expertise in React/Vue/Angular",
        "Strong CSS/SCSS skills",
        "Experience with testing frameworks"
      ]
    },
    {
      id: 3,
      title: "Senior React Developer",
      company: "Digital Solutions Ltd.",
      appliedDate: "11 Sep '25",
      applicationSentDate: "11 Sep '25",
      status: "applied",
      totalApplications: 2189,
      recruiterViews: false,
      matchCriteria: [
        "Experience Match",
        "Portfolio Strength"
      ],
      location: "Mumbai, India",
      jobType: "Contract",
      salary: "₹15L - ₹22L",
      postedDate: "08 Sep '25",
      active: false,
      description: "We need a Senior React Developer to lead our frontend team and architect complex web applications.",
      requirements: [
        "5+ years React experience",
        "Leadership experience",
        "Strong architectural skills",
        "Excellent communication"
      ]
    }
  ]);

  const [selectedJob, setSelectedJob] = useState(jobs[0]);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setJobs(prev => prev.map(j => ({
      ...j,
      active: j.id === job.id
    })));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "shortlisted": return "text-green-600 bg-green-50";
      case "review": return "text-blue-600 bg-blue-50";
      case "awaiting": return "text-yellow-600 bg-yellow-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case "shortlisted": return "Shortlisted";
      case "review": return "Under Review";
      case "awaiting": return "Awaiting Recruiter";
      default: return "Applied";
    }
  };

  return (
    <motion.div
      {...modalAnimation}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        {...contentAnimation}
        className="bg-white rounded-xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Applied Jobs</h2>
            <p className="text-sm text-gray-600">Viewing applied jobs for {user.userName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Applied Jobs List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                All Applications ({jobs.length})
              </h3>
              
              <div className="space-y-3">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => handleSelectJob(job)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      job.active
                        ? "border-blue-500 bg-blue-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className={`font-medium ${job.active ? "text-blue-700" : "text-gray-900"}`}>
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span>Applied: {job.appliedDate}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>
                          {getStatusText(job.status)}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Job Details */}
          <div className="w-2/3 overflow-y-auto">
            <div className="p-8">
              {/* Job Header */}
              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{selectedJob.title}</h2>
                    <p className="text-lg text-gray-700 mt-1">{selectedJob.company}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedJob.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {selectedJob.jobType}
                      </span>
                      <span className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {selectedJob.salary}
                      </span>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    View similar jobs
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-px bg-gray-200 my-6"></div>
              </div>

              {/* Job Description */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Job Description</h3>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <p className="text-gray-700">{selectedJob.description}</p>
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Requirements:</h4>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Application Status */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Application status</h3>
                
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="text-sm text-gray-600 font-medium mb-2">Applied</div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div className="text-base font-semibold text-gray-900">{selectedJob.appliedDate}</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="text-sm text-gray-600 font-medium mb-2">Application Sent</div>
                    <div className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4 text-gray-500" />
                      <div className="text-base font-semibold text-gray-900">{selectedJob.applicationSentDate}</div>
                    </div>
                  </div>
                  
                  <div className={`text-center p-4 border rounded-lg ${
                    selectedJob.status === "awaiting" 
                      ? "border-yellow-200 bg-yellow-50" 
                      : selectedJob.status === "shortlisted"
                      ? "border-green-200 bg-green-50"
                      : selectedJob.status === "review"
                      ? "border-blue-200 bg-blue-50"
                      : "border-gray-200 bg-gray-50"
                  }`}>
                    <div className="text-sm text-gray-600 font-medium mb-2">Current Status</div>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className={`w-4 h-4 ${
                        selectedJob.status === "awaiting" ? "text-yellow-600" :
                        selectedJob.status === "shortlisted" ? "text-green-600" :
                        selectedJob.status === "review" ? "text-blue-600" : "text-gray-600"
                      }`} />
                      <div className={`text-base font-semibold ${
                        selectedJob.status === "awaiting" ? "text-yellow-700" :
                        selectedJob.status === "shortlisted" ? "text-green-700" :
                        selectedJob.status === "review" ? "text-blue-700" : "text-gray-700"
                      }`}>
                        {getStatusText(selectedJob.status)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-6"></div>

              {/* Activity on this job */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Activity on this job</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-5 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Users className="w-6 h-6 text-gray-600" />
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedJob.totalApplications.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Total applications</div>
                  </div>
                  
                  <div className="text-center p-5 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Eye className={`w-6 h-6 ${selectedJob.recruiterViews ? "text-green-600" : "text-gray-400"}`} />
                      <div className={`text-2xl font-bold ${selectedJob.recruiterViews ? "text-green-700" : "text-gray-500"}`}>
                        {selectedJob.recruiterViews ? "Viewed" : "Not Viewed"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 font-medium">Applications viewed by recruiter</div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-6"></div>

              {/* What may work for you */}
              <div className="mb-8">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  What may work for you?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Following criteria suggests how well you match with the job.
                </p>
                
                <div className="space-y-3">
                  {selectedJob.matchCriteria.map((criteria, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">{criteria}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Posted: {selectedJob.postedDate}
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    Contact Recruiter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    Download Resume
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    View Job Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}