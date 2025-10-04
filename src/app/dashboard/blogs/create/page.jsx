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
    const [uploadedImages, setUploadedImages] = useState([]);

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
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Content *
                            </label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                placeholder="Write your blog post content here... (HTML supported)"
                                rows={20}
                                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                You can use HTML tags for formatting. Support for rich text editor coming soon!
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

                        {/* Featured Image */}
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <ImageIcon className="h-5 w-5 mr-2" />
                                Featured Image & Gallery
                            </h3>

                            {/* Image Upload Component */}
                            <ImageUploader
                                domainId={formData.domainId}
                                onImageUploaded={(result) => {
                                    // Set first uploaded image as featured image if none selected
                                    if (!formData.featuredImage) {
                                        setFormData(prev => ({ ...prev, featuredImage: result.imageUrl }));
                                    }
                                    setUploadedImages(prev => [...prev, result]);
                                }}
                                currentImages={uploadedImages}
                                onImageDeleted={(imageId) => {
                                    setUploadedImages(prev => prev.filter(img => img.imageId !== imageId));
                                    // Remove from featured image if it was the deleted one
                                    const deletedImage = uploadedImages.find(img => img.imageId === imageId);
                                    if (deletedImage && formData.featuredImage === deletedImage.imageUrl) {
                                        setFormData(prev => ({ ...prev, featuredImage: '' }));
                                    }
                                }}
                            />

                            {/* Manual URL Input */}
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Or paste image URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.featuredImage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                                />
                            </div>

                            {formData.featuredImage && (
                                <div className="mt-3">
                                    <p className="text-sm text-gray-400 mb-2">Featured Image Preview:</p>
                                    <Image
                                        src={formData.featuredImage}
                                        alt="Featured"
                                        className="w-full h-32 object-cover rounded-lg"
                                        onError={(e) => e.target.style.display = 'none'}
                                        width={400}
                                        height={225}
                                    />
                                </div>
                            )}
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
                        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
                            <h3 className="text-lg font-bold text-white mb-4">SEO Settings</h3>

                            <div className="space-y-4">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}