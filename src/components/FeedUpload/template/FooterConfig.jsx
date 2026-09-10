import React from 'react';
import { Palette, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

const FooterConfig = ({ config, onChange }) => {
    const toggleElement = (el) => {
        onChange({
            ...config,
            showElements: {
                ...config.showElements,
                [el]: !config.showElements[el]
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-600 rounded-2xl text-white shadow-lg shadow-pink-500/20">
                    <Palette size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Branding Bar</h3>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Dynamic footer configuration</p>
                </div>
            </div>

            <div className="space-y-10 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="space-y-6">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block ml-1">Primary Background</label>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div
                            className="w-12 h-12 rounded-xl border border-gray-100 shadow-inner shrink-0"
                            style={{ backgroundColor: config.backgroundColor }}
                        />
                        <input
                            type="color"
                            value={config.backgroundColor || '#000000'}
                            onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                            className="flex-1 bg-transparent h-10 cursor-pointer outline-none border-none p-0"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block ml-1">Visible Elements</label>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { id: 'name', label: 'USER NAME' },
                            { id: 'email', label: 'EMAIL' },
                            { id: 'phone', label: 'PHONE' },
                            { id: 'socialIcons', label: 'SOCIALS' }
                        ].map((el) => (
                            <button
                                key={el.id}
                                onClick={() => toggleElement(el.id)}
                                className={clsx(
                                    "p-5 rounded-3xl flex items-center justify-between border-2 transition-all active:scale-95",
                                    config.showElements[el.id]
                                        ? "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-500/20"
                                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                )}
                            >
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{el.label}</span>
                                {config.showElements[el.id] ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl flex gap-4 items-start shadow-sm">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                        <Eye size={14} />
                    </div>
                    <p className="text-[9px] text-amber-700 font-bold leading-relaxed uppercase tracking-widest">
                        Background color is automatically detected from media but can be overridden above.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FooterConfig;
