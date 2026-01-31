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
                <div className="p-3 bg-pink-600/20 rounded-2xl text-pink-400 border border-pink-500/20">
                    <Palette size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Branding Bar</h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Dynamic footer configuration</p>
                </div>
            </div>

            <div className="space-y-8 p-6 bg-black/40 rounded-[2rem] border border-white/10 shadow-inner">
                <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Primary Background</label>
                    <div className="flex items-center gap-4">
                        <div
                            className="w-12 h-12 rounded-xl border-2 border-white/20 shadow-xl"
                            style={{ backgroundColor: config.backgroundColor }}
                        />
                        <input
                            type="color"
                            value={config.backgroundColor || '#000000'}
                            onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                            className="flex-1 bg-black/40 border border-white/5 rounded-xl px-2 h-10 cursor-pointer"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest block">Visible Elements</label>
                    <div className="grid grid-cols-2 gap-3">
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
                                    "p-4 rounded-2xl flex items-center justify-between border-2 transition-all group",
                                    config.showElements[el.id]
                                        ? "bg-pink-600/10 border-pink-500/50 text-white shadow-lg"
                                        : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                                )}
                            >
                                <span className="text-[9px] font-black uppercase tracking-widest">{el.label}</span>
                                {config.showElements[el.id] ? <Eye size={14} className="text-pink-400" /> : <EyeOff size={14} />}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                    <p className="text-[8px] text-yellow-500/60 font-medium leading-relaxed italic">
                        NOTE: BACKGROUND COLOR IS AUTOMATICALLY DETECTED FROM MEDIA BUT CAN BE OVERRIDDEN ABOVE.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FooterConfig;
