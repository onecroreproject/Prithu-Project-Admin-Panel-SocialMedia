import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/admin/api';

const CreditPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', credits: '', price: '', active: true });
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem('adminToken');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/monetization/packages`, { headers });
      if (res.data.success) setPackages(res.data.packages);
    } catch (err) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/monetization/packages/${editId}`, formData, { headers });
        toast.success('Package updated');
      } else {
        await axios.post(`${API_BASE_URL}/monetization/packages`, formData, { headers });
        toast.success('Package created');
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ name: '', credits: '', price: '', active: true });
      fetchPackages();
    } catch (err) {
      toast.error('Failed to save package');
    }
  };

  const handleEdit = (pkg) => {
    setEditId(pkg._id);
    setFormData({ name: pkg.name, credits: pkg.credits, price: pkg.price, active: pkg.active });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axios.delete(`${API_BASE_URL}/monetization/packages/${id}`, { headers });
        toast.success('Package deleted');
        fetchPackages();
      } catch (err) {
        toast.error('Failed to delete package');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Credit Packages</h1>
        <button 
          onClick={() => { setShowForm(!showForm); setEditId(null); setFormData({ name: '', credits: '', price: '', active: true }); }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium"
        >
          {showForm ? 'Cancel' : 'Add Package'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
            <input required type="number" value={formData.credits} onChange={e => setFormData({...formData, credits: e.target.value})} className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
            <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
          </div>
          <button type="submit" className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium">Save</button>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
            <tr>
              <th className="p-4">Package Name</th>
              <th className="p-4">Credits</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-gray-700 dark:text-gray-300">
            {packages.map(pkg => (
              <tr key={pkg._id}>
                <td className="p-4 font-medium">{pkg.name}</td>
                <td className="p-4 text-blue-500 font-bold">{pkg.credits} CR</td>
                <td className="p-4">₹{pkg.price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs ${pkg.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {pkg.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(pkg)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                  <button onClick={() => handleDelete(pkg._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CreditPackagesPage;
