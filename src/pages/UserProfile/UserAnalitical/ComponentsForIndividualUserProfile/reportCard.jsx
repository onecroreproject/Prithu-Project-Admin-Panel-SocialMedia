import React from 'react';

const ReportsCard = ({ reports }) => {
  if (!reports || reports.length === 0) {
    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          User Reports
        </h3>
        <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-green-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Reports Filed</h4>
          <p className="text-gray-500">User hasn't filed any reports.</p>
        </div>
      </div>
    );
  }

  // Calculate report statistics
  const reportStats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'Pending').length,
    resolved: reports.filter(r => r.status === 'Resolved').length,
    rejected: reports.filter(r => r.status === 'Rejected').length
  };

  // Get recent reports
  const recentReports = reports
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Resolved':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'Rejected':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          User Reports
        </h3>
        <span className="px-3 py-1 bg-gradient-to-r from-red-100 to-red-50 text-red-600 rounded-full text-sm font-medium">
          {reportStats.total} total
        </span>
      </div>
      
      {/* Report Statistics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-yellow-50 to-white p-3 rounded-xl border border-yellow-100">
          <div className="text-lg font-bold text-yellow-600">{reportStats.pending}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white p-3 rounded-xl border border-green-100">
          <div className="text-lg font-bold text-green-600">{reportStats.resolved}</div>
          <div className="text-xs text-gray-500">Resolved</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-white p-3 rounded-xl border border-red-100">
          <div className="text-lg font-bold text-red-600">{reportStats.rejected}</div>
          <div className="text-xs text-gray-500">Rejected</div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Recent Reports</h4>
        {recentReports.map((report, index) => (
          <div key={report._id} className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-all duration-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Report #{index + 1}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(report.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                {getStatusIcon(report.status)}
                {report.status}
              </span>
            </div>
            
            <div className="mt-3 space-y-2">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Target Type:</span> {report.targetType}
              </div>
              {report.answers && report.answers.length > 0 && (
                <div className="text-xs text-gray-500 line-clamp-2">
                  {report.answers[0]?.selectedOption || 'No details provided'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      {reports.length > 3 && (
        <button className="w-full mt-4 px-4 py-2.5 text-sm text-center text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200">
          View All Reports ({reports.length})
        </button>
      )}
    </div>
  );
};

export default ReportsCard;