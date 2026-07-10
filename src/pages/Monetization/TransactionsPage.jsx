import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/admin/api';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${API_BASE_URL}/monetization/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setTransactions(res.data.transactions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Credit Transactions</h1>
      
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
                  <th className="p-4">Type</th>
                  <th className="p-4">Credits</th>
                  <th className="p-4">Amount (₹)</th>
                  <th className="p-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
                {transactions.map(tx => (
                  <tr key={tx._id}>
                    <td className="p-4">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className="p-4 font-mono text-xs text-blue-500">{tx.userId}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        tx.credits > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className={`p-4 font-bold ${tx.credits > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.credits > 0 ? '+' : ''}{tx.credits}
                    </td>
                    <td className="p-4">{tx.amount ? `₹${tx.amount}` : '-'}</td>
                    <td className="p-4">{tx.remarks}</td>
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

export default TransactionsPage;
