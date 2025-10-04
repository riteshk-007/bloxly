'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Save,
    Eye,
    Upload,
    X,
    Plus,
    ArrowLeft,
    Globe,
    Tag,
    Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import ImageUploader from '../../../../components/ImageUploader';

export default function CreateBlogPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [domains, setDomains] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [uploadedImages, setUploadedImages] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featuredImage: '',
        status: 'DRAFT',
        domainId: '',
        categoryId: '',
        tags: [],
        metaTitle: '',
        metaDescription: '',
        keywords: ''
    });

    const [newTag, setNewTag] = useState('');

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        fetchInitialData();
    }, [session, status, router]);

    const fetchInitialData = async () => {
        try {
            const [domainsRes, categoriesRes, tagsRes] = await Promise.all([
                fetch('/api/user/domains'),
                fetch('/api/categories'),
                fetch('/api/tags')
            ]);

            if (domainsRes.ok) {
                const domainsData = await domainsRes.json();
                setDomains(domainsData);
                if (domainsData.length > 0) {
                    setFormData(prev => ({ ...prev, domainId: domainsData[0].id }));
                }
            }

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                setCategories(categoriesData);
            }

            if (tagsRes.ok) {
                const tagsData = await tagsRes.json();
                setAllTags(tagsData);
            }
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleTitleChange = (title) => {
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title),
            metaTitle: title.length > 60 ? title.substring(0, 60) : title
        }));
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.some(tag => tag.name === newTag.trim())) {
            const tag = {
                id: `new-${Date.now()}`,
                name: newTag.trim(),
                slug: generateSlug(newTag.trim())
            };
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
            setNewTag('');
        }
    };

    // Image handling functions
    const fetchDomainImages = async (domainId) => {
        if (!domainId) {
            setUploadedImages([]);
            return;
        }

        try {
            const response = await fetch(`/api/user/domains/${domainId}/images`);
            if (response.ok) {
                const images = await response.json();
                setUploadedImages(images);
            }
        } catch (error) {
            console.error('Failed to fetch images:', error);
        }
    };

    const handleImageUploaded = (uploadResult) => {
        const newImage = {
            id: uploadResult.imageId,
            url: uploadResult.imageUrl,
            key: uploadResult.key,
            originalName: uploadResult.originalName || 'Uploaded Image',
            size: uploadResult.size
        };
        setUploadedImages(prev => [...prev, newImage]);

        // Auto-set as featured image if none selected
        if (!formData.featuredImage) {
            setFormData(prev => ({ ...prev, featuredImage: uploadResult.imageUrl }));
        }
    };

    const handleImageDeleted = (imageId) => {
        setUploadedImages(prev => prev.filter(img => img.id !== imageId));

        // Clear featured image if it was the deleted one
        const deletedImage = uploadedImages.find(img => img.id === imageId);
        if (deletedImage && formData.featuredImage === deletedImage.url) {
            setFormData(prev => ({ ...prev, featuredImage: '' }));
        }
    };

    const setAsFeaturedImage = (imageUrl) => {
        setFormData(prev => ({ ...prev, featuredImage: imageUrl }));
    };

    // Fetch images when domain changes
    useEffect(() => {
        if (formData.domainId) {
            fetchDomainImages(formData.domainId);
        } else {
            setUploadedImages([]);
        }
    }, [formData.domainId]);

    const removeTag = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag.id !== tagId)
        }));
    };

    const handleSave = async (status = 'DRAFT') => {
        setSaving(true);
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    status,
                    keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k)
                })
            });

            if (response.ok) {
                const post = await response.json();
                router.push('/user/blogs');
            } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            console.error('Failed to save post:', error);
            alert('Failed to save post');
        } finally {
            setSaving(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (domains.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h2 className="text-xl font-bold mb-2">No Domains Found</h2>
                    <p className="text-gray-400 mb-6">You need to register a domain before creating blog posts.</p>
                    <Link
                        href="/dashboard"
                        className="bg-yellow-500 text-black px-6 py-3 rounded-lg hover:bg-yellow-400 transition-colors"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/user/blogs"
                                className="text-gray-400 hover:text-yellow-500 transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <h1 className="text-3xl font-bold text-white">Create New Blog Post</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => handleSave('DRAFT')}
                                disabled={saving || !formData.title.trim()}
                                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Save className="h-4 w-4" />
                                <span>{saving ? 'Saving...' : 'Save Draft'}</span>
                            </button>
                            <button
                                onClick={() => handleSave('PUBLISHED')}
                                disabled={saving || !formData.title.trim() || !formData.content.trim()}
                                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                <Eye className="h-4 w-4" />
                                <span>{saving ? 'Publishing...' : 'Publish'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Enter your blog post title..."
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-xl font-bold"
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                URL Slug
                            </label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                placeholder="url-slug"
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                URL: {domains.find(d => d.id === formData.domainId)?.domain}/blog/{formData.slug}
                            </p>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Excerpt
                            </label>
                            <textarea
                                value={formData.excerpt}
                                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                                placeholder="Brief description of your post..."
                                rows={3}
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Content *
                                </label>
                                <div className="flex items-center gap-2">
                                    {uploadedImages.length > 0 && (
                                        <details className="relative">
                                            <summary className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded transition-colors">
                                                📸 Insert Image
                                            </summary>
                                            <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg p-3 w-80 max-h-60 overflow-y-auto z-10 shadow-lg">
                                                <div className="text-xs text-gray-400 mb-2">Click to insert image HTML:</div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {uploadedImages.map((image) => (
                                                        <button
                                                            key={image.id}
                                                            type="button"
                                                            onClick={() => {
                                                                const imageHtml = `<img src="${image.url}" alt="${image.originalName}" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />`;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    content: prev.content + '\n\n' + imageHtml
                                                                }));
                                                            }}
                                                            className="group relative rounded overflow-hidden border border-gray-600 hover:border-gray-500 transition-colors"
                                                            title={`Insert ${image.originalName}`}
                                                        >
                                                            <Image
                                                                src={image.url}
                                                                alt={image.originalName}
                                                                className="w-full h-16 object-cover"
                                                                width={64}
                                                                height={64}
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                                                <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    Insert
                                                                </span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </details>
                                    )}
                                </div>
                            </div>

                            {/* Formatting Toolbar */}
                            <div className="mb-3 p-2 bg-gray-800 rounded-lg border border-gray-700">
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => {
                                        const textarea = document.querySelector('textarea[placeholder*="Write your blog"]');
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const selectedText = formData.content.substring(start, end) || 'Heading';
                                        const newContent = formData.content.substring(0, start) + `<h1>${selectedText}</h1>` + formData.content.substring(end);
                                        setFormData(prev => ({ ...prev, content: newContent }));
                                    }} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
                                        H1
                                    </button>
                                    <button type="button" onClick={() => {
                                        const textarea = document.querySelector('textarea[placeholder*="Write your blog"]');
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const selectedText = formData.content.substring(start, end) || 'Heading';
                                        const newContent = formData.content.substring(0, start) + `<h2>${selectedText}</h2>` + formData.content.substring(end);
                                        setFormData(prev => ({ ...prev, content: newContent }));
                                    }} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
                                        H2
                                    </button>
                                    <button type="button" onClick={() => {
                                        const textarea = document.querySelector('textarea[placeholder*="Write your blog"]');
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const selectedText = formData.content.substring(start, end) || 'Bold text';
                                        const newContent = formData.content.substring(0, start) + `<strong>${selectedText}</strong>` + formData.content.substring(end);
                                        setFormData(prev => ({ ...prev, content: newContent }));
                                    }} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors font-bold">
                                        B
                                    </button>
                                    <button type="button" onClick={() => {
                                        const textarea = document.querySelector('textarea[placeholder*="Write your blog"]');
                                        const start = textarea.selectionStart;
                                        const end = textarea.selectionEnd;
                                        const selectedText = formData.content.substring(start, end) || 'Italic text';
                                        const newContent = formData.content.substring(0, start) + `<em>${selectedText}</em>` + formData.content.substring(end);
                                        setFormData(prev => ({ ...prev, content: newContent }));
                                    }} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors italic">
                                        I
                                    </button>
                                    <button type="button" onClick={() => {
                                        const newContent = formData.content + '\n<p>Your paragraph text here...</p>';
                                        setFormData(prev => ({ ...prev, content: newContent }));
                                    }} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
                                        ¶ Paragraph
                                    </button>
                                    <button type="button" onClick={() => {
                                        const newContent = formData.content + '\n<ul>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ul>';
                                        setFormData(prev => ({ ...prev, content: newContent }));
                                    }} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors">
                                        • List
                                    </button>
                                </div>
                            </div>

                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Write your blog post content here... Use toolbar buttons above for formatting or write HTML directly."
                                rows={20}
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 font-mono text-sm leading-relaxed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                You can use HTML tags for formatting. Use the &quot;Insert Image&quot; button above to add uploaded images.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Domain Selection */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Globe className="h-5 w-5 mr-2" />
                                Domain
                            </h3>
                            <select
                                value={formData.domainId}
                                onChange={(e) => setFormData(prev => ({ ...prev, domainId: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                            >
                                {domains.map((domain) => (
                                    <option key={domain.id} value={domain.id}>
                                        {domain.domain}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Featured Image & Upload */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <ImageIcon className="h-5 w-5 mr-2" />
                                Images & Featured Image
                            </h3>

                            {/* Image Uploader */}
                            <div className="mb-6">
                                <ImageUploader
                                    domainId={formData.domainId}
                                    onImageUploaded={handleImageUploaded}
                                    currentImages={uploadedImages}
                                    onImageDeleted={handleImageDeleted}
                                />
                            </div>

                            {/* Featured Image URL Input */}
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-300">
                                    Featured Image URL (or upload above)
                                </label>
                                <input
                                    type="url"
                                    value={formData.featuredImage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                                    placeholder="Enter image URL or upload above..."
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                />

                                {/* Quick Set Featured Image from Uploads */}
                                {uploadedImages.length > 0 && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
                                            Or select from uploaded images:
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {uploadedImages.slice(0, 8).map((image) => (
                                                <button
                                                    key={image.id}
                                                    type="button"
                                                    onClick={() => setAsFeaturedImage(image.url)}
                                                    className={`relative group rounded-lg overflow-hidden border-2 transition-all ${formData.featuredImage === image.url
                                                        ? 'border-yellow-500 ring-2 ring-yellow-500/50'
                                                        : 'border-gray-600 hover:border-gray-500'
                                                        }`}
                                                >
                                                    <Image
                                                        src={image.url}
                                                        alt={image.originalName}
                                                        className="w-full h-16 object-cover"
                                                        width={64}
                                                        height={64}
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                        <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Set Featured
                                                        </span>
                                                    </div>
                                                    {formData.featuredImage === image.url && (
                                                        <div className="absolute top-1 right-1 bg-yellow-500 text-black rounded-full w-4 h-4 flex items-center justify-center text-xs">
                                                            ✓
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Featured Image Preview */}
                                {formData.featuredImage && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Featured Image Preview:
                                        </label>
                                        <Image
                                            src={formData.featuredImage}
                                            alt="Featured"
                                            className="w-full h-32 object-cover rounded-lg border border-gray-700"
                                            onError={(e) => e.target.style.display = 'none'}
                                            width={400}
                                            height={225}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Category */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Category</h3>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500"
                            >
                                <option value="">Select category...</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tags */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <Tag className="h-5 w-5 mr-2" />
                                Tags
                            </h3>

                            {/* Add Tag */}
                            <div className="flex space-x-2 mb-4">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="Add tag..."
                                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                />
                                <button
                                    onClick={addTag}
                                    className="bg-yellow-500 text-black p-2 rounded-lg hover:bg-yellow-400 transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Existing Tags */}
                            {allTags.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Select from existing tags:
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {allTags.map((tag) => {
                                            const isSelected = formData.tags.some(selectedTag => selectedTag.name === tag.name);
                                            return (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            removeTag(formData.tags.find(selectedTag => selectedTag.name === tag.name)?.id);
                                                        } else {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                tags: [...prev.tags, {
                                                                    id: tag.id,
                                                                    name: tag.name,
                                                                    slug: tag.slug
                                                                }]
                                                            }));
                                                        }
                                                    }}
                                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${isSelected
                                                        ? 'bg-yellow-500 text-black'
                                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {tag.name} ({tag._count?.posts || 0})
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Selected Tags */}
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="inline-flex items-center px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                                    >
                                        {tag.name}
                                        <button
                                            onClick={() => removeTag(tag.id)}
                                            className="ml-2 text-gray-500 hover:text-red-400"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800">
                            <details className="group">
                                <summary className="cursor-pointer p-6 flex items-center justify-between hover:bg-gray-800 rounded-lg transition-colors">
                                    <h3 className="text-lg font-bold text-white">SEO Settings</h3>
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="px-6 pb-6 space-y-4 border-t border-gray-800">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.metaTitle}
                                            onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                                            placeholder="SEO title..."
                                            maxLength={60}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Meta Description
                                        </label>
                                        <textarea
                                            value={formData.metaDescription}
                                            onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                                            placeholder="SEO description..."
                                            maxLength={160}
                                            rows={3}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.keywords}
                                            onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                                            placeholder="keyword1, keyword2, keyword3..."
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Separate keywords with commas</p>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}