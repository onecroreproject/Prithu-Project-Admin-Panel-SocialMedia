// components/AdminFaqPage.jsx
import React, { useState, useEffect } from 'react';
import axios from '../Utils/axiosApi';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Search,
  Filter,
  ArrowUpDown,
  Copy
} from 'lucide-react';



const AdminFaqPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sections');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [expandedSections, setExpandedSections] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Form states
  const [sectionForm, setSectionForm] = useState({
    sectionKey: '',
    title: '',
    description: '',
    order: 0,
    isActive: true
  });

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    order: 0,
    isActive: true
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [itemToDelete, setItemToDelete] = useState({ type: '', id: '', sectionId: null });

  // Fetch all FAQ sections
  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/help`);
      setSections(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      showNotification('Failed to load FAQ sections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleSectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFaqChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFaqForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open section modal for add/edit
  const openSectionModal = (section = null) => {
    if (section) {
      setSectionForm({
        sectionKey: section.sectionKey,
        title: section.title,
        description: section.description || '',
        order: section.order || 0,
        isActive: section.isActive
      });
      setEditingId(section._id);
    } else {
      setSectionForm({
        sectionKey: '',
        title: '',
        description: '',
        order: sections.length,
        isActive: true
      });
      setEditingId(null);
    }
    setShowSectionModal(true);
  };

  // Open FAQ modal for add/edit
  const openFaqModal = (sectionId, faq = null) => {
    setSelectedSection(sectionId);
    if (faq) {
      setFaqForm({
        question: faq.question,
        answer: faq.answer,
        order: faq.order || 0,
        isActive: faq.isActive
      });
      setEditingId(faq._id);
    } else {
      setFaqForm({
        question: '',
        answer: '',
        order: 0,
        isActive: true
      });
      setEditingId(null);
    }
    setShowFaqModal(true);
  };

  // Save section
  const saveSection = async () => {
    try {
      if (!sectionForm.sectionKey || !sectionForm.title) {
        showNotification('Section key and title are required', 'error');
        return;
      }

      if (editingId) {
        await axios.put(`/api/admin/help/${editingId}`, sectionForm);
        showNotification('Section updated successfully');
      } else {
        await axios.post(`/api/admin/help`, sectionForm);
        showNotification('Section created successfully');
      }

      setShowSectionModal(false);
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      showNotification(error.response?.data?.message || 'Failed to save section', 'error');
    }
  };

  // Save FAQ
  const saveFaq = async () => {
    try {
      if (!faqForm.question || !faqForm.answer) {
        showNotification('Question and answer are required', 'error');
        return;
      }

      const section = sections.find(s => s._id === selectedSection);
      if (!section) return;

      let updatedFaqs;
      if (editingId) {
        updatedFaqs = section.faqs.map(faq =>
          faq._id === editingId ? { ...faq, ...faqForm } : faq
        );
      } else {
        const newFaq = { ...faqForm, _id: Date.now().toString() };
        updatedFaqs = [...(section.faqs || []), newFaq];
      }

      await axios.put(`/api/admin/help/${selectedSection}`, {
        faqs: updatedFaqs
      });

      showNotification(`FAQ ${editingId ? 'updated' : 'added'} successfully`);
      setShowFaqModal(false);
      fetchSections();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      showNotification('Failed to save FAQ', 'error');
    }
  };

  // Toggle section expand/collapse
  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Toggle active status
  const toggleActiveStatus = async (type, itemId, sectionId = null, currentStatus) => {
    try {
      if (type === 'section') {
        await axios.put(`/api/admin/help/${itemId}`, {
          isActive: !currentStatus
        });
        showNotification(`Section ${currentStatus ? 'deactivated' : 'activated'}`);
      } else {
        const section = sections.find(s => s._id === sectionId);
        if (!section) return;

        const updatedFaqs = section.faqs.map(faq =>
          faq._id === itemId ? { ...faq, isActive: !currentStatus } : faq
        );

        await axios.put(`/api/admin/help/${sectionId}`, {
          faqs: updatedFaqs
        });
        showNotification(`FAQ ${currentStatus ? 'deactivated' : 'activated'}`);
      }
      fetchSections();
    } catch (error) {
      console.error('Error toggling status:', error);
      showNotification('Failed to update status', 'error');
    }
  };

  // Open delete confirmation
  const confirmDelete = (type, id, sectionId = null) => {
    setItemToDelete({ type, id, sectionId });
    setShowDeleteModal(true);
  };

  // Execute delete
  const executeDelete = async () => {
    try {
      if (itemToDelete.type === 'section') {
        await axios.delete(`/api/admin/help/${itemToDelete.id}`);
        showNotification('Section deleted successfully');
      } else {
        const section = sections.find(s => s._id === itemToDelete.sectionId);
        if (!section) return;

        const updatedFaqs = section.faqs.filter(faq => faq._id !== itemToDelete.id);
        
        await axios.put(`/api/admin/help/${itemToDelete.sectionId}`, {
          faqs: updatedFaqs
        });
        showNotification('FAQ deleted successfully');
      }
      setShowDeleteModal(false);
      fetchSections();
    } catch (error) {
      console.error('Error deleting:', error);
      showNotification('Failed to delete', 'error');
    }
  };

  // Copy section key
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard', 'success');
  };

  // Filtered sections based on search and filter
  const filteredSections = sections.filter(section => {
    const matchesSearch = 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.sectionKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.faqs?.some(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesFilter = 
      filterActive === 'all' ||
      (filterActive === 'active' && section.isActive) ||
      (filterActive === 'inactive' && !section.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Stats calculations
  const totalSections = sections.length;
  const totalFaqs = sections.reduce((total, section) => total + (section.faqs?.length || 0), 0);
  const activeSections = sections.filter(s => s.isActive).length;
  const activeFaqs = sections.reduce((total, section) => 
    total + (section.faqs?.filter(f => f.isActive).length || 0), 0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
            <p className="text-gray-600 mt-2">Manage FAQ sections and questions</p>
          </div>
          <button
            onClick={() => openSectionModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Section
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Sections', value: totalSections, color: 'blue' },
            { label: 'Total FAQs', value: totalFaqs, color: 'green' },
            { label: 'Active Sections', value: activeSections, color: 'purple' },
            { label: 'Active FAQs', value: activeFaqs, color: 'orange' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow p-4">
              <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
              <div className={`text-2xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search sections, questions, or answers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Sections List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading FAQ sections...</p>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQ sections found</h3>
            <p className="text-gray-600 mb-4">Create your first FAQ section to get started</p>
            <button
              onClick={() => openSectionModal()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Section
            </button>
          </div>
        ) : (
          filteredSections.map((section) => (
            <div key={section._id} className="bg-white rounded-xl shadow overflow-hidden">
              {/* Section Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${section.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {section.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {section.faqs?.length || 0} FAQs
                        </span>
                        <button
                          onClick={() => copyToClipboard(section.sectionKey)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                          title="Copy section key"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {section.sectionKey}
                        </button>
                      </div>
                    </div>
                    {section.description && (
                      <p className="text-gray-600 mb-3">{section.description}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      Order: {section.order || 0} • Created: {new Date(section.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActiveStatus('section', section._id, null, section.isActive)}
                      className={`p-2 rounded-lg ${section.isActive ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                      title={section.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {section.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => openFaqModal(section._id)}
                      className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                      title="Add FAQ"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openSectionModal(section)}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                      title="Edit Section"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => confirmDelete('section', section._id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                      title="Delete Section"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleSection(section._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                    >
                      {expandedSections.includes(section._id) ? 
                        <ChevronUp className="w-5 h-5" /> : 
                        <ChevronDown className="w-5 h-5" />
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* FAQs List */}
              {expandedSections.includes(section._id) && (
                <div className="p-6 bg-gray-50">
                  {section.faqs?.length > 0 ? (
                    <div className="space-y-4">
                      {[...section.faqs]
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((faq) => (
                          <div key={faq._id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`w-2 h-2 rounded-full ${faq.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                  <h4 className="font-medium text-gray-900">{faq.question}</h4>
                                  <span className="text-sm text-gray-500">(Order: {faq.order || 0})</span>
                                </div>
                                <p className="text-gray-600 whitespace-pre-line">{faq.answer}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => toggleActiveStatus('faq', faq._id, section._id, faq.isActive)}
                                  className={`p-1.5 rounded ${faq.isActive ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                                  title={faq.isActive ? 'Deactivate' : 'Activate'}
                                >
                                  {faq.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => openFaqModal(section._id, faq)}
                                  className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                                  title="Edit FAQ"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => confirmDelete('faq', faq._id, section._id)}
                                  className="p-1.5 rounded hover:bg-red-50 text-red-600"
                                  title="Delete FAQ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No FAQs added to this section yet</p>
                      <button
                        onClick={() => openFaqModal(section._id)}
                        className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First FAQ
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Edit Section' : 'Add New Section'}
                </h3>
                <button
                  onClick={() => setShowSectionModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Key *
                  </label>
                  <input
                    type="text"
                    name="sectionKey"
                    value={sectionForm.sectionKey}
                    onChange={handleSectionChange}
                    disabled={!!editingId}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="e.g., account, posts, jobs"
                  />
                  <p className="mt-1 text-sm text-gray-500">Unique identifier (lowercase)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={sectionForm.title}
                    onChange={handleSectionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Account & Profile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={sectionForm.description}
                    onChange={handleSectionChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional section description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={sectionForm.order}
                    onChange={handleSectionChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={sectionForm.isActive}
                    onChange={handleSectionChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Active (visible to users)
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setShowSectionModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={saveSection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update Section' : 'Create Section'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Edit FAQ' : 'Add New FAQ'}
                </h3>
                <button
                  onClick={() => setShowFaqModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question *
                  </label>
                  <textarea
                    name="question"
                    value={faqForm.question}
                    onChange={handleFaqChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the question"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer *
                  </label>
                  <textarea
                    name="answer"
                    value={faqForm.answer}
                    onChange={handleFaqChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the answer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={faqForm.order}
                    onChange={handleFaqChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="faqIsActive"
                    name="isActive"
                    checked={faqForm.isActive}
                    onChange={handleFaqChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="faqIsActive" className="ml-2 text-sm text-gray-700">
                    Active (visible to users)
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setShowFaqModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={saveFaq}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingId ? 'Update FAQ' : 'Add FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Confirm Delete
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this {itemToDelete.type}? This action cannot be undone.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {itemToDelete.type}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300`}>
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span className={`font-medium ${
              notification.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* Empty State Action Button (floating) */}
      {sections.length === 0 && !loading && (
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => openSectionModal()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Section
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminFaqPage;