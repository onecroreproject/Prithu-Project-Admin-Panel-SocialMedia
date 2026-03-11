import React, { useState, useEffect } from 'react';
import axios from '../Services/apiService';
import toast, { Toaster } from 'react-hot-toast';
import {
    Mail,
    Phone,
    MapPin,
    Save,
    RefreshCw,
    Globe,
    Info,
    CheckCircle,
    AlertCircle,
    Plus,
    Trash2,
    Link as LinkIcon,
    Layout,
    Share2,
    Image as ImageIcon,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const FooterManagementPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [footerData, setFooterData] = useState({
        logo: '',
        brandName: '',
        description: '',
        sections: [],
        socialLinks: [],
        email: '',
        phone: '',
        address: ''
    });
    const [activeTab, setActiveTab] = useState('general');
    const [selectedPage, setSelectedPage] = useState('about-us');
    const [pageContent, setPageContent] = useState({ title: '', content: '' });
    const [pageLoading, setPageLoading] = useState(false);
    const [pageSaving, setPageSaving] = useState(false);

    const pages = [
        { label: 'About Us', slug: 'about-us' },
        { label: 'Terms & Conditions', slug: 'terms-conditions' },
        { label: 'Refund Policy', slug: 'refund-policy' },
        { label: 'Subscription Detail', slug: 'subscription-detail' },
        { label: 'Referral Detail', slug: 'referral-detail' }
    ];

    useEffect(() => {
        fetchFooterData();
    }, []);

    useEffect(() => {
        if (activeTab === 'content') {
            fetchPageContent();
        }
    }, [activeTab, selectedPage]);

    const fetchPageContent = async () => {
        setPageLoading(true);
        try {
            const response = await axios.get(`/web/api/static-page/${selectedPage}`);
            if (response.data.success) {
                setPageContent({
                    title: response.data.data.title,
                    content: response.data.data.content
                });
            }
        } catch (error) {
            console.error('Error fetching page content:', error);
            // If not found, reset to blank
            setPageContent({ title: '', content: '' });
        } finally {
            setPageLoading(false);
        }
    };

    const fetchFooterData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/web/api/footer');
            if (response.data.success) {
                setFooterData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching footer data:', error);
            toast.error('Failed to load footer configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFooterData(prev => ({ ...prev, [name]: value }));
    };

    // --- Section Handlers ---
    const addSection = () => {
        setFooterData(prev => ({
            ...prev,
            sections: [...prev.sections, { title: 'New Section', links: [] }]
        }));
    };

    const removeSection = (index) => {
        setFooterData(prev => ({
            ...prev,
            sections: prev.sections.filter((_, i) => i !== index)
        }));
    };

    const updateSectionTitle = (index, title) => {
        setFooterData(prev => {
            const newSections = [...prev.sections];
            newSections[index].title = title;
            return { ...prev, sections: newSections };
        });
    };

    const addLink = (sectionIndex) => {
        setFooterData(prev => {
            const newSections = [...prev.sections];
            newSections[sectionIndex].links.push({ label: '', href: '' });
            return { ...prev, sections: newSections };
        });
    };

    const removeLink = (sectionIndex, linkIndex) => {
        setFooterData(prev => {
            const newSections = [...prev.sections];
            newSections[sectionIndex].links = newSections[sectionIndex].links.filter((_, i) => i !== linkIndex);
            return { ...prev, sections: newSections };
        });
    };

    const updateLink = (sectionIndex, linkIndex, field, value) => {
        setFooterData(prev => {
            const newSections = [...prev.sections];
            newSections[sectionIndex].links[linkIndex][field] = value;
            return { ...prev, sections: newSections };
        });
    };

    // --- Social Link Handlers ---
    const addSocialLink = () => {
        setFooterData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { platform: '', url: '', icon: '' }]
        }));
    };

    const removeSocialLink = (index) => {
        setFooterData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter((_, i) => i !== index)
        }));
    };

    const updateSocialLink = (index, field, value) => {
        setFooterData(prev => {
            const newSocial = [...prev.socialLinks];
            newSocial[index][field] = value;
            return { ...prev, socialLinks: newSocial };
        });
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await axios.put('/api/admin/footer', footerData);
            toast.success('Footer configuration updated successfully');
        } catch (error) {
            console.error('Error saving footer data:', error);
            handleSaveError(error);
        } finally {
            setSaving(false);
        }
    };

    const handleSavePageContent = async (e) => {
        if (e) e.preventDefault();
        setPageSaving(true);
        try {
            await axios.post(`/api/admin/static-page/${selectedPage}`, pageContent);
            toast.success('Page content updated successfully');
        } catch (error) {
            console.error('Error saving page content:', error);
            toast.error(error.response?.data?.message || 'Failed to update page content');
        } finally {
            setPageSaving(false);
        }
    };

    const handleSaveError = (error) => {
        const message = error.response?.data?.message || 'Failed to save footer configuration';
        toast.error(message);
    };

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Toaster position="top-right" />

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 border-none">Footer Configuration</h1>
                <p className="text-gray-600">Manage global contact information displayed in the website footer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Info size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-blue-900 text-sm">Live Updates</h4>
                        <p className="text-blue-700 text-xs">Changes will reflect instantly on the user website via WebSockets.</p>
                    </div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                        <Globe size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-green-900 text-sm">Global Contact</h4>
                        <p className="text-green-700 text-xs">These details appear on the Contact page and Footer.</p>
                    </div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-indigo-900 text-sm">Official Info</h4>
                        <p className="text-indigo-700 text-xs">Ensure these match your official business registration.</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                {[
                    { id: 'general', label: 'General Info', icon: Info },
                    { id: 'links', label: 'Navigation Links', icon: Layout },
                    { id: 'social', label: 'Social Media', icon: Share2 },
                    { id: 'content', label: 'Page Content', icon: ImageIcon }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="p-8">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Logo */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <ImageIcon size={16} /> Logo URL
                                    </label>
                                    <input
                                        type="text"
                                        name="logo"
                                        value={footerData.logo}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                        placeholder="/prithulogo.png"
                                    />
                                </div>
                                {/* Brand Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Globe size={16} /> Brand Name
                                    </label>
                                    <input
                                        type="text"
                                        name="brandName"
                                        value={footerData.brandName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                        placeholder="Prithu"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Info size={16} /> Brand Slogan/Description
                                </label>
                                <textarea
                                    name="description"
                                    value={footerData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none resize-none"
                                    placeholder="Empowering creators..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Mail size={16} /> Support Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={footerData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <Phone size={16} /> Support Phone
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={footerData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <MapPin size={16} /> Office Address
                                </label>
                                <textarea
                                    name="address"
                                    value={footerData.address}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'links' && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Navigation Sections</h3>
                                <button
                                    type="button"
                                    onClick={addSection}
                                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                                >
                                    <Plus size={16} /> Add Section
                                </button>
                            </div>

                            <div className="space-y-6">
                                {footerData.sections?.map((section, sIdx) => (
                                    <div key={sIdx} className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="text"
                                                value={section.title}
                                                onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                                                className="flex-1 bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-gray-900 outline-none focus:ring-2 focus:ring-primary-500"
                                                placeholder="Section Title"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeSection(sIdx)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="space-y-3 pl-4 border-l-2 border-gray-200">
                                            {section.links?.map((link, lIdx) => (
                                                <div key={lIdx} className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={link.label}
                                                        onChange={(e) => updateLink(sIdx, lIdx, 'label', e.target.value)}
                                                        className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
                                                        placeholder="Link Label"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={link.href}
                                                        onChange={(e) => updateLink(sIdx, lIdx, 'href', e.target.value)}
                                                        className="flex-1 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
                                                        placeholder="URL (e.g. /about)"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLink(sIdx, lIdx)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addLink(sIdx)}
                                                className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-primary-600 pl-1"
                                            >
                                                <Plus size={14} /> Add Link
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Social Media Links</h3>
                                <button
                                    type="button"
                                    onClick={addSocialLink}
                                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                                >
                                    <Plus size={16} /> Add Social Link
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {footerData.socialLinks?.map((social, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <div className="grid grid-cols-3 gap-3 flex-1">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Platform</label>
                                                <input
                                                    type="text"
                                                    value={social.platform}
                                                    onChange={(e) => updateSocialLink(idx, 'platform', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
                                                    placeholder="Facebook"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">URL</label>
                                                <input
                                                    type="text"
                                                    value={social.url}
                                                    onChange={(e) => updateSocialLink(idx, 'url', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
                                                    placeholder="https://facebook.com/..."
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Icon Name</label>
                                                <input
                                                    type="text"
                                                    value={social.icon}
                                                    onChange={(e) => updateSocialLink(idx, 'icon', e.target.value)}
                                                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
                                                    placeholder="Facebook, Instagram..."
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeSocialLink(idx)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Select Page to Manage</label>
                                    <select
                                        value={selectedPage}
                                        onChange={(e) => setSelectedPage(e.target.value)}
                                        className="w-full bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        {pages.map(page => (
                                            <option key={page.slug} value={page.slug}>{page.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Managing: <span className="font-bold text-primary-600">/{selectedPage}</span></p>
                                </div>
                            </div>

                            {pageLoading ? (
                                <div className="flex py-10 items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Display Title</label>
                                        <input
                                            type="text"
                                            value={pageContent.title}
                                            onChange={(e) => setPageContent({ ...pageContent, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none"
                                            placeholder="Enter page title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Page Content (HTML support)</label>
                                        <textarea
                                            value={pageContent.content}
                                            onChange={(e) => setPageContent({ ...pageContent, content: e.target.value })}
                                            rows={12}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all outline-none font-mono text-sm leading-relaxed"
                                            placeholder="<h1>Header</h1> <p>Content here...</p>"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleSavePageContent}
                                            disabled={pageSaving}
                                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                                        >
                                            {pageSaving ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <Save size={20} /> Update {pages.find(p => p.slug === selectedPage)?.label}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {activeTab !== 'content' && (
                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={fetchFooterData}
                            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2"
                        >
                            <RefreshCw size={16} /> Discard Changes
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary-200 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={20} /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default FooterManagementPage;
