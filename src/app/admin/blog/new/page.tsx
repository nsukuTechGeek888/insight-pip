'use client';

import {notify} from '@/components/ui/Feedback';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Save, Eye, Upload, X, Plus, Trash2,
  Image as ImageIcon, Tag, Calendar, Clock, Globe,
  Lock, CheckCircle, AlertCircle, Loader2,
  Bold, Italic, Underline, Link as LinkIcon,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Code, Table
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

// Simple text editor (you can replace with a rich text editor like TipTap or Quill)
const SimpleEditor = ({ value, onChange, placeholder }: any) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-h-[400px] bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-4 py-3 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500 resize-y"
    />
  );
};

// Tag input component
const TagInput = ({ tags, onAdd, onRemove }: any) => {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag: string) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
          >
            {tag}
            <button
              onClick={() => onRemove(tag)}
              className="hover:text-blue-100"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a tag and press Enter..."
        className="w-full bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-4 py-2 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};

// Image upload component
const ImageUpload = ({ onUpload, existingImage }: any) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/admin/blog/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      notify('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {existingImage && (
        <div className="relative w-full max-w-sm">
          <img
            src={existingImage}
            alt="Featured image"
            className="w-full h-48 object-cover rounded-lg border border-[var(--ip-border)]"
          />
          <button
            onClick={() => onUpload('')}
            className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-500 text-[var(--ip-text)]"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg hover:bg-zinc-700 transition-colors">
            <Upload size={16} />
            <span className="text-sm text-[var(--ip-text)]">
              {existingImage ? 'Change Image' : 'Upload Image'}
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {uploading && (
          <div className="flex items-center gap-2 text-[var(--ip-text-2)]">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        )}
      </div>
      <p className="text-xs text-[var(--ip-text-2)]">
        Recommended: 1200x630px, JPG/PNG, max 2MB
      </p>
    </div>
  );
};

export default function NewBlogPostPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: 'Trading',
    tags: [] as string[],
    imageUrl: '',
    featured: false,
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    if (user?.role === 'ADMIN') {
      fetchCategories();
    }
  }, [user, isLoading]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/categories', { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || ['Trading', 'Platforms', 'Reviews', 'Education', 'News']);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          status,
          slug: formData.slug || generateSlug(formData.title)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create post');
      }

      const data = await response.json();
      router.push('/admin/blog');
    } catch (error: any) {
      console.error('Error saving post:', error);
      notify(error.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setFormData({ ...formData, category: newCategory.trim() });
      setNewCategory('');
      setShowCategoryInput(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--ip-bg)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-[var(--ip-bg)] pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/blog" className="p-2 rounded-lg bg-[var(--ip-surface-2)] text-[var(--ip-text-2)] hover:text-[var(--ip-text)]">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--ip-text)]">Create New Post</h1>
              <p className="text-[var(--ip-text-2)] text-sm">Write and publish a new blog post</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave('DRAFT')}
              disabled={saving}
              className="px-4 py-2 bg-[var(--ip-surface-2)] text-[var(--ip-text-2)] rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              onClick={() => handleSave('PUBLISHED')}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-pink-500 text-[var(--ip-text)] rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Globe size={16} />
              )}
              Publish
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--ip-text-2)] mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  title: e.target.value,
                  slug: formData.slug || generateSlug(e.target.value)
                });
              }}
              placeholder="Enter post title..."
              className={`w-full bg-[var(--ip-surface-2)] border ${errors.title ? 'border-red-500' : 'border-[var(--ip-border)]'} rounded-lg px-4 py-3 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-[var(--ip-text-2)] mb-2">
              Slug <span className="text-[var(--ip-text-2)] text-xs">(URL-friendly name)</span>
            </label>
            <div className="flex gap-2">
              <span className="text-[var(--ip-text-2)] text-sm py-3">/blog/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated-from-title"
                className="flex-1 bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-4 py-3 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setFormData({ ...formData, slug: generateSlug(formData.title) })}
                className="px-4 py-2 bg-[var(--ip-surface-2)] text-[var(--ip-text-2)] rounded-lg hover:bg-zinc-700 transition-colors text-sm"
              >
                Auto
              </button>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-[var(--ip-text-2)] mb-2">
              Summary <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Write a brief summary of the post..."
              rows={3}
              className={`w-full bg-[var(--ip-surface-2)] border ${errors.summary ? 'border-red-500' : 'border-[var(--ip-border)]'} rounded-lg px-4 py-3 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500 resize-y`}
            />
            {errors.summary && (
              <p className="mt-1 text-xs text-red-400">{errors.summary}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-[var(--ip-text-2)] mb-2">
              Content <span className="text-red-400">*</span>
            </label>
            <SimpleEditor
              value={formData.content}
              onChange={(value: string) => setFormData({ ...formData, content: value })}
              placeholder="Write your blog post content here..."
            />
            {errors.content && (
              <p className="mt-1 text-xs text-red-400">{errors.content}</p>
            )}
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--ip-text-2)] mb-2">
                Category <span className="text-red-400">*</span>
              </label>
              {showCategoryInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 bg-[var(--ip-surface-2)] border border-[var(--ip-border)] rounded-lg px-4 py-2 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-blue-500 text-[var(--ip-text)] rounded-lg hover:bg-blue-400 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={() => setShowCategoryInput(false)}
                    className="px-4 py-2 bg-[var(--ip-surface-2)] text-[var(--ip-text-2)] rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`flex-1 bg-[var(--ip-surface-2)] border ${errors.category ? 'border-red-500' : 'border-[var(--ip-border)]'} rounded-lg px-4 py-2 text-[var(--ip-text)] text-sm focus:outline-none focus:border-blue-500`}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCategoryInput(true)}
                    className="px-4 py-2 bg-[var(--ip-surface-2)] text-[var(--ip-text-2)] rounded-lg hover:bg-zinc-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
              {errors.category && (
                <p className="mt-1 text-xs text-red-400">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--ip-text-2)] mb-2">
                Tags
              </label>
              <TagInput
                tags={formData.tags}
                onAdd={(tag: string) => {
                  if (!formData.tags.includes(tag)) {
                    setFormData({ ...formData, tags: [...formData.tags, tag] });
                  }
                }}
                onRemove={(tag: string) => {
                  setFormData({
                    ...formData,
                    tags: formData.tags.filter(t => t !== tag)
                  });
                }}
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-[var(--ip-text-2)] mb-2">
              Featured Image
            </label>
            <ImageUpload
              existingImage={formData.imageUrl}
              onUpload={(url: string) => setFormData({ ...formData, imageUrl: url })}
            />
          </div>

          {/* Options */}
          <div className="bg-[var(--ip-surface)] rounded-lg p-4 border border-[var(--ip-border)]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 accent-purple-500"
              />
              <span className="text-[var(--ip-text)] text-sm">Feature this post</span>
              <span className="text-[var(--ip-text-2)] text-xs">(Featured posts appear at the top of the blog)</span>
            </label>
          </div>

          {/* Preview */}
          <div className="bg-[var(--ip-surface)] rounded-lg p-4 border border-[var(--ip-border)]">
            <h3 className="text-sm font-medium text-[var(--ip-text-2)] mb-3">Preview</h3>
            <div className="bg-[var(--ip-surface-2)] rounded-lg p-4">
              <h4 className="text-xl font-bold text-[var(--ip-text)] mb-2">{formData.title || 'Post Title'}</h4>
              <p className="text-[var(--ip-text-2)] text-sm">{formData.summary || 'Post summary will appear here...'}</p>
              {formData.imageUrl && (
                <div className="mt-3">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="mt-3 flex gap-2">
                <span className="text-xs text-[var(--ip-text-2)]">{formData.category || 'Category'}</span>
                {formData.tags.map((tag: string) => (
                  <span key={tag} className="text-xs text-blue-400">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}