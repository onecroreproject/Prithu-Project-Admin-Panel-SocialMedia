import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/admin/api';

const CreditUsagePage = () => {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_BASE_URL}/monetization/usage`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUsage(res.data.usage);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Credit Usage & AI Generations</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Prompt ID</th>
                  <th className="p-4">Images Gen</th>
                  <th className="p-4">Credits Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                {usage.map(u => (
                  <tr key={u._id}>
                    <td className="p-4">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-mono text-xs text-blue-500">{u.userId}</td>
                    <td className="p-4 font-mono text-xs">{u.promptId || 'Custom'}</td>
                    <td className="p-4 font-bold">{u.generatedImages?.length || 0}</td>
                    <td className="p-4 font-bold text-red-500">-{u.creditsUsed} CR</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditUsagePage;
