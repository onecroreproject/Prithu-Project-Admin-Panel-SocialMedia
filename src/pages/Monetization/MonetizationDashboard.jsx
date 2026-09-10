import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, DollarSign, Activity, Key } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/admin/api';

const MonetizationDashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCreditsSold: 0,
    totalPromptsUnlocked: 0,
    totalAIGenerations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API_BASE_URL}/monetization/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">AI Monetization Dashboard</h1>
      
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.totalRevenue}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Credits Sold</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCreditsSold} CR</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Prompts Unlocked</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalPromptsUnlocked}</h3>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">AI Generations</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAIGenerations}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonetizationDashboard;
