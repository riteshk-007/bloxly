'use client';

import { DeleteIcon } from 'lucide-react';
import { CopyIcon } from 'lucide-react';
import Image from 'next/image';
import { useState, useRef } from 'react';

const ImageUploader = ({ domainId, onImageUploaded, currentImages = [], onImageDeleted, maxImages = 3 }) => {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;

        const remaining = Math.max(0, maxImages - currentImages.length);
        if (remaining <= 0) {
            alert(`You can upload a maximum of ${maxImages} images.`);
            return;
        }

        const incoming = Array.from(files);
        if (incoming.length > remaining) {
            alert(`You can only upload ${remaining} more image(s). The first ${remaining} will be uploaded.`);
        }

        const toUpload = incoming.slice(0, remaining);
        for (let file of toUpload) {
            await uploadImage(file);
        }
    };

    const uploadImage = async (file) => {
        if (!domainId) {
            alert('Please select a domain first');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('domainId', domainId);

            const response = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                onImageUploaded && onImageUploaded(result);
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (imageId, key) => {
        if (!confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await fetch(`/api/upload/image?imageId=${imageId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                onImageDeleted && onImageDeleted(imageId);
            } else {
                alert('Failed to delete image');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete image');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleFileSelect(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const copyImageUrl = (url) => {
        navigator.clipboard.writeText(url);
        alert('Image URL copied to clipboard!');
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                />

                <div className="space-y-4">
                    <div className="text-4xl">📸</div>
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Upload Images
                        </h3>
                        <p className="text-gray-400 mb-4">
                            Drag and drop images here, or click to select files
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || !domainId || currentImages.length >= maxImages}
                            className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black disabled:text-gray-400 px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                            {uploading ? 'Uploading...' : 'Select Images'}
                        </button>
                    </div>
                    <div className="text-sm text-gray-500">
                        Max 5MB per image • JPEG, PNG, WebP supported • Auto-compressed
                        <div className="mt-1 text-xs text-gray-400">You can upload up to {maxImages} images. {Math.max(0, maxImages - currentImages.length)} remaining.</div>
                    </div>
                </div>
            </div>

            {/* Current Images */}
            {currentImages.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Uploaded Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {currentImages.filter(img => img && img.url).map((image) => (
                            <div key={image.id} className="bg-gray-800 rounded-lg p-3 space-y-2 w-full">
                                <div className="w-full h-20 overflow-hidden rounded bg-gray-700">
                                    <Image
                                        src={image.url}
                                        alt={image.originalName || 'Uploaded image'}
                                        className="w-full h-full object-cover"
                                        width={160}
                                        height={80}
                                    />
                                </div>
                                <div className="text-xs text-gray-400 truncate">
                                    {image.originalName}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {Math.round(image.size / 1024)}KB
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => image.url && copyImageUrl(image.url)}
                                        disabled={!image.url}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs py-1 px-2 rounded transition-colors"
                                    >
                                        <CopyIcon className="inline-block w-3 h-3 mr-1" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(image.id, image.key)}
                                        className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded transition-colors"
                                    >
                                        <DeleteIcon className="inline-block w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;