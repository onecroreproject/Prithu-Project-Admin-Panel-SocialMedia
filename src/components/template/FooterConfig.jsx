import React, { useEffect } from 'react';

const FooterConfig = ({ config, onChange }) => {
    useEffect(() => {
        const requiredElements = ['name', 'email', 'phone', 'socialIcons'];
        const currentElements = config.showElements || {};
        const isEveryElementEnabled = requiredElements.every(key => currentElements[key] === true);
        const isEnabled = config.enabled === true;

        if (!isEnabled || !isEveryElementEnabled) {
            const newShowElements = { ...currentElements };
            requiredElements.forEach(key => newShowElements[key] = true);

            onChange({
                ...config,
                enabled: true,
                showElements: newShowElements
            });
        }
    }, [config.enabled, config.showElements, onChange]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Footer Configuration</h4>
            </div>

            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
                <div className="text-sm text-gray-400 mb-2 italic">
                    All footer elements (Name, Email, Phone, Social Icons) are active.
                </div>

                <div className="mt-3">
                    <label className="text-xs text-gray-400 block mb-1">Background Color</label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={config.backgroundColor || '#000000'}
                            onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                            className="h-8 w-14 rounded cursor-pointer bg-transparent"
                        />
                        <input
                            type="text"
                            value={config.backgroundColor}
                            onChange={(e) => onChange({ ...config, backgroundColor: e.target.value })}
                            className="flex-1 bg-gray-900 border border-gray-600 rounded px-2 text-sm text-white"
                        />
                    </div>
                </div>
            </div>
        </div>

    );
};

export default FooterConfig;
