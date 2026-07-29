import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, MessageCircle, FileQuestion, Users } from 'lucide-react';

const ChatAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/chat/analytics');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6">Loading Analytics...</div>;
  if (!data) return <div className="p-6">Failed to load data</div>;

  const { stats, topKeywords, topUnanswered, recentSearches } = data;

  const chartData = topKeywords.map(k => ({
    name: k._id,
    count: k.count
  }));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">AI Chatbot Analytics</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Searches</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalSearches}</h3>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><Search size={24} /></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Matched Queries</p>
            <h3 className="text-2xl font-bold text-green-600">{stats.matchedSearches}</h3>
          </div>
          <div className="bg-green-100 p-3 rounded-lg text-green-600"><MessageCircle size={24} /></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unmatched Queries</p>
            <h3 className="text-2xl font-bold text-red-600">{stats.unmatchedSearches}</h3>
          </div>
          <div className="bg-red-100 p-3 rounded-lg text-red-600"><FileQuestion size={24} /></div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">New Leads</p>
            <h3 className="text-2xl font-bold text-purple-600">{stats.newLeads}</h3>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Users size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Top Searched Keywords</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Searches */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Recent Searches</h3>
          <div className="overflow-auto max-h-[300px]">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-4 py-2">Query</th>
                  <th className="px-4 py-2">Matched</th>
                  <th className="px-4 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSearches.map((search) => (
                  <tr key={search._id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{search.question}</td>
                    <td className="px-4 py-3">
                      {search.matchedThreads && search.matchedThreads.length > 0 ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Yes</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{new Date(search.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatAnalytics;
