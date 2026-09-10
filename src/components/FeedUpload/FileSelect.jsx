import React from 'react';
import { Upload } from 'lucide-react';

const FileSelect = ({ onSelect }) => {
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            onSelect(files);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            onSelect(files);
        }
    };

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="w-full h-32 border-2 border-dashed border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group cursor-pointer relative overflow-hidden"
        >
            <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl border border-gray-800">
                <Upload className="text-blue-500" size={20} />
            </div>
            <div className="text-center">
                <p className="text-white font-bold">Drop files here or click to upload</p>
                <p className="text-gray-500 text-sm">Videos or Images accepted</p>
            </div>
        </div>
    );
};

export default FileSelect;
