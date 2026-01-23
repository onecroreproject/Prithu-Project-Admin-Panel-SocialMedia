import React, { useState, useEffect } from 'react';
import axios from '../Utils/axiosApi';
import {
  Save,
  Eye,
  Globe,
  Phone,
  Mail,
  MapPin,
  Building,
  Tag,
  FileText,
  Link,
  Shield,
  Image,
  Settings,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  BarChart,
  Users,
  CreditCard,
  Smartphone
} from 'lucide-react';

const AdminCompanyPage = () => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    companyName: '',
    tagline: '',
    aboutShort: '',
    aboutLong: '',
    email: '',
    phone: '',
    address: '',
    socialMedia: {
      website: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      github: '',
      telegram: '',
      whatsapp: ''
    },
    logoUrl: '',
    faviconUrl: '',
    companyRegistrationNumber: '',
    gstNumber: '',
    privacyPolicyUrl: '',
    termsConditionsUrl: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    },
    isActive: true
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/company');
      const data = response.data.data;
      setCompanyData(data);
      setFormData({
        companyName: data.companyName || '',
        tagline: data.tagline || '',
        aboutShort: data.aboutShort || '',
        aboutLong: data.aboutLong || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        socialMedia: data.socialMedia || {
          website: '',
          linkedin: '',
          twitter: '',
          instagram: '',
          facebook: '',
          youtube: '',
          github: '',
          telegram: '',
          whatsapp: ''
        },
        logoUrl: data.logoUrl || '',
        faviconUrl: data.faviconUrl || '',
        companyRegistrationNumber: data.companyRegistrationNumber || '',
        gstNumber: data.gstNumber || '',
        privacyPolicyUrl: data.privacyPolicyUrl || '',
        termsConditionsUrl: data.termsConditionsUrl || '',
        seo: data.seo || {
          metaTitle: '',
          metaDescription: '',
          keywords: []
        },
        isActive: data.isActive !== undefined ? data.isActive : true
      });
      
      if (data.logoUrl) setLogoPreview(data.logoUrl);
      if (data.faviconUrl) setFaviconPreview(data.faviconUrl);
    } catch (error) {
      console.error('Error fetching company data:', error);
      // Initialize empty form if no company data exists
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setFormData(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaviconPreview(reader.result);
        setFormData(prev => ({ ...prev, faviconUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.seo.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, newKeyword.trim()]
        }
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter(k => k !== keyword)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Prepare data for API
      const payload = {
        ...formData,
        seo: {
          ...formData.seo,
          keywords: formData.seo.keywords || []
        },
        socialMedia: formData.socialMedia || {}
      };

      // Remove empty social media fields
      Object.keys(payload.socialMedia).forEach(key => {
        if (!payload.socialMedia[key]) {
          delete payload.socialMedia[key];
        }
      });

      const response = await axios.post('/api/admin/company', payload);
      setCompanyData(response.data.data);
      
      // Handle file uploads if needed (you might want to upload to S3/CDN)
      if (logoFile) {
        // Upload logo to your storage service
        console.log('Logo file to upload:', logoFile);
      }
      
      if (faviconFile) {
        // Upload favicon to your storage service
        console.log('Favicon file to upload:', faviconFile);
      }
      
      alert('Company information saved successfully!');
    } catch (error) {
      console.error('Error saving company data:', error);
      alert('Failed to save company information');
    } finally {
      setSaving(false);
    }
  };

  const toggleCompanyStatus = async () => {
    try {
      const newStatus = !formData.isActive;
      const response = await axios.patch('/api/admin/company/status', {
        isActive: newStatus
      });
      
      setFormData(prev => ({ ...prev, isActive: newStatus }));
      setCompanyData(response.data.data);
      alert(`Company ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling company status:', error);
      alert('Failed to update company status');
    }
  };

  const resetForm = () => {
    if (companyData) {
      setFormData({
        companyName: companyData.companyName || '',
        tagline: companyData.tagline || '',
        aboutShort: companyData.aboutShort || '',
        aboutLong: companyData.aboutLong || '',
        email: companyData.email || '',
        phone: companyData.phone || '',
        address: companyData.address || '',
        socialMedia: companyData.socialMedia || {},
        logoUrl: companyData.logoUrl || '',
        faviconUrl: companyData.faviconUrl || '',
        companyRegistrationNumber: companyData.companyRegistrationNumber || '',
        gstNumber: companyData.gstNumber || '',
        privacyPolicyUrl: companyData.privacyPolicyUrl || '',
        termsConditionsUrl: companyData.termsConditionsUrl || '',
        seo: companyData.seo || { metaTitle: '', metaDescription: '', keywords: [] },
        isActive: companyData.isActive !== undefined ? companyData.isActive : true
      });
      setLogoPreview(companyData.logoUrl || '');
      setFaviconPreview(companyData.faviconUrl || '');
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <Building className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" /> },
    { id: 'social', label: 'Social Media', icon: <Globe className="w-4 h-4" /> },
    { id: 'branding', label: 'Branding', icon: <Image className="w-4 h-4" /> },
    { id: 'legal', label: 'Legal', icon: <Shield className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO', icon: <BarChart className="w-4 h-4" /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Company Information</h1>
              <p className="text-gray-600 mt-1">Manage your company details displayed on the website</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleCompanyStatus}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  formData.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {formData.isActive ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Deactivate Company
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Activate Company
                  </>
                )}
              </button>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Edit Mode' : 'Preview Mode'}
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            formData.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {formData.isActive ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Active - Visible to users
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Inactive - Hidden from users
              </>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {previewMode && companyData && (
          <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Preview</h2>
              <button
                onClick={() => setPreviewMode(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                Close Preview
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Logo & Basic Info */}
              <div className="space-y-4">
                {logoPreview && (
                  <div className="mb-4">
                    <img 
                      src={logoPreview} 
                      alt="Company Logo" 
                      className="h-16 object-contain"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{formData.companyName}</h3>
                  {formData.tagline && (
                    <p className="text-gray-600 mt-1">{formData.tagline}</p>
                  )}
                </div>
                {formData.aboutShort && (
                  <p className="text-gray-700 text-sm">{formData.aboutShort}</p>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Contact Information</h4>
                {formData.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{formData.email}</span>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{formData.phone}</span>
                  </div>
                )}
                {formData.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    <span>{formData.address}</span>
                  </div>
                )}
              </div>

              {/* Social Media */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Follow Us</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(formData.socialMedia || {}).map(([platform, url]) => {
                    if (url) {
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm"
                        >
                          <Globe className="w-3 h-3" />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Prithu Technologies"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Tagline
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      value={formData.tagline}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Your career growth partner"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Short About (Summary)
                  </label>
                  <textarea
                    name="aboutShort"
                    value={formData.aboutShort}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Brief description of your company"
                  />
                  <p className="text-xs text-gray-500 mt-1">Max 200 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Detailed About
                  </label>
                  <textarea
                    name="aboutLong"
                    value={formData.aboutLong}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Detailed description of your company"
                  />
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="contact@prithu.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Company address"
                  />
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'website', label: 'Website', placeholder: 'https://prithu.com' },
                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/prithu' },
                    { key: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/prithu' },
                    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/prithu' },
                    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/prithu' },
                    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/c/prithu' },
                    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/prithu' },
                    { key: 'telegram', label: 'Telegram', placeholder: 'https://t.me/prithu' },
                    { key: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/1234567890' }
                  ].map(social => (
                    <div key={social.key}>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {social.label}
                      </label>
                      <input
                        type="url"
                        name={`socialMedia.${social.key}`}
                        value={formData.socialMedia[social.key] || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder={social.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Company Logo
                  </label>
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          {logoPreview ? (
                            <div className="flex items-center justify-center gap-3">
                              <img 
                                src={logoPreview} 
                                alt="Logo preview" 
                                className="h-20 object-contain"
                              />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
                                <p className="text-xs text-gray-500">Click to change</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-600">Upload logo (PNG, JPG, SVG)</p>
                              <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px</p>
                            </div>
                          )}
                        </label>
                      </div>
                      <input
                        type="text"
                        name="logoUrl"
                        value={formData.logoUrl}
                        onChange={handleInputChange}
                        className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Or enter logo URL directly"
                      />
                    </div>
                  </div>
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Favicon
                  </label>
                  <div className="flex items-start gap-6">
                    <div className="flex-1">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          id="favicon-upload"
                          accept="image/*"
                          onChange={handleFaviconUpload}
                          className="hidden"
                        />
                        <label htmlFor="favicon-upload" className="cursor-pointer">
                          {faviconPreview ? (
                            <div className="flex items-center justify-center gap-3">
                              <img 
                                src={faviconPreview} 
                                alt="Favicon preview" 
                                className="h-16 object-contain"
                              />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">Favicon uploaded</p>
                                <p className="text-xs text-gray-500">Click to change</p>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-600">Upload favicon (ICO, PNG)</p>
                              <p className="text-xs text-gray-500 mt-1">Recommended: 32x32px or 64x64px</p>
                            </div>
                          )}
                        </label>
                      </div>
                      <input
                        type="text"
                        name="faviconUrl"
                        value={formData.faviconUrl}
                        onChange={handleInputChange}
                        className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Or enter favicon URL directly"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Legal Tab */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Company Registration Number
                    </label>
                    <input
                      type="text"
                      name="companyRegistrationNumber"
                      value={formData.companyRegistrationNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="U72900MH2020PTC338461"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="27AAACU7290P1ZG"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Privacy Policy URL
                    </label>
                    <input
                      type="url"
                      name="privacyPolicyUrl"
                      value={formData.privacyPolicyUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="https://prithu.com/privacy"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Terms & Conditions URL
                    </label>
                    <input
                      type="url"
                      name="termsConditionsUrl"
                      value={formData.termsConditionsUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="https://prithu.com/terms"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    name="seo.metaTitle"
                    value={formData.seo.metaTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Prithu - Career Growth Platform"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    name="seo.metaDescription"
                    value={formData.seo.metaDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Description for search engines"
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Keywords
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Add keyword"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.seo.keywords?.map((keyword, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(keyword)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Changes
              </button>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Company Details
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Preview Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">How this information is used</h4>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Company name, logo, and contact info displayed in website footer</li>
                <li>• Social media links shown in contact section</li>
                <li>• Legal information linked in terms/privacy pages</li>
                <li>• SEO metadata used for search engine optimization</li>
                <li>• When inactive, company info is hidden from public view</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCompanyPage;