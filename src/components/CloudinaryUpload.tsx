'use strict';
'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from './LanguageProvider';
import { Camera, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  imageUrl?: string;
  onClear: () => void;
}

export const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
  onUploadSuccess,
  imageUrl,
  onClear,
}) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setLoading(true);
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // Check if keys are placeholders or not configured
    const isMock = !cloudName || cloudName.includes('your_') || !uploadPreset || uploadPreset.includes('your_');

    if (isMock) {
      // High-Fidelity Mock Mode: Read file as Base64 to show actual user image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          onUploadSuccess(reader.result as string);
          setLoading(false);
        }, 1500); // Simulate network latency
      };
      reader.readAsDataURL(file);
    } else {
      // Real Cloudinary Upload
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        onUploadSuccess(data.secure_url);
      } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        // Fallback to local Base64 in case of error
        const reader = new FileReader();
        reader.onloadend = () => {
          onUploadSuccess(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setLoading(false);
      }
    }
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {t.photoLabel}
      </label>
      
      {imageUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800 aspect-video flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Issue Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-3 right-3 p-1.5 bg-rose-600/90 text-white rounded-full hover:bg-rose-700 transition"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[180px] ${
            dragActive ? 'border-orange-500 bg-orange-500/5' : 'border-slate-700 hover:border-orange-500 bg-slate-900/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="hidden"
            disabled={loading}
          />
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-orange-500" size={32} />
              <p className="text-sm text-slate-400">Uploading photo...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="p-3 bg-slate-800 rounded-full text-slate-400 mb-3 group-hover:text-orange-500 transition">
                <Camera size={24} />
              </div>
              <p className="text-sm font-medium text-slate-300">
                Click to upload, or drag and drop
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, JPEG up to 10MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
