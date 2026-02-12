/**
 * Edit Blog Post Page
 * Pre-populated form to update existing blog post
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { AppImage } from '@/components/AppImage';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [postId, setPostId] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    author: '',
    featuredImage: '',
    published: false,
    featured: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/blog/posts?slug=${slug}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }

      const data = await response.json();
      if (data.success && data.data.post) {
        const post = data.data.post;
        setPostId(post._id);
        setFormData({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          tags: post.tags.join(', '),
          author: post.author,
          featuredImage: post.featuredImage || '',
          published: post.published,
          featured: post.featured,
        });
        if (post.featuredImage) {
          setImagePreview(post.featuredImage);
        }
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, featuredImage: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let imageUrl = formData.featuredImage;

      // Upload new image if selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);
        imageFormData.append('folder', 'blog');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.message || 'Image upload failed');
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.data.url;
      }

      // Update post
      const response = await fetch(`/api/admin/blog/posts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          postId: postId,
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          category: formData.category,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          author: formData.author,
          featuredImage: imageUrl,
          published: formData.published,
          featured: formData.featured,
        }),
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update post');
      }

      alert('Blog post updated successfully!');
      router.push('/admin/blog');
    } catch (err: any) {
      setError(err.message || 'Failed to update post');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-orange" />
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
          <Link
            href="/admin/blog"
            className="text-accent-orange hover:underline"
          >
            ← Back to Blog Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/blog"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-accent-orange mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog Posts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Blog Post
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt *
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              rows={15}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
          </div>

          {/* Category & Author */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Category</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Lifestyle">Lifestyle</option>
              </select>
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., web development, react, javascript"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-orange focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image
            </label>
            
            {imagePreview ? (
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                <AppImage
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Click to upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Checkboxes */}
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={handleChange}
                className="w-4 h-4 text-accent-orange focus:ring-accent-orange border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Published</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="w-4 h-4 text-accent-orange focus:ring-accent-orange border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
              style={{ backgroundColor: '#FF6B35', color: '#ffffff' }}
            >
              {submitting ? 'Updating...' : 'Update Post'}
            </button>
            <Link
              href="/admin/blog"
              className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300 font-medium text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
