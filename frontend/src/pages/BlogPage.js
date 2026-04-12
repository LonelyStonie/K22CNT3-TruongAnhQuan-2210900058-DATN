// ============================================
// Trang Blog (Public)
// File: frontend/src/pages/BlogPage.js
// ============================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Extra.css';

function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/blogs');
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  return (
    <div className="blog-page-full">
      {/* Header */}
      <div className="blog-page-header">
        <p className="blog-page-label">BLOG & TIN TỨC</p>
        <h1>Xu hướng trang sức</h1>
        <p className="blog-page-desc">Kiến thức về đá quý, xu hướng thiết kế và bí quyết chọn trang sức</p>
      </div>

      <div className="blog-page-content">
        {loading ? (
          <div className="blog-loading">Đang tải bài viết...</div>
        ) : blogs.length === 0 ? (
          <div className="blog-empty">
            <div className="blog-empty-icon">📝</div>
            <h3>Chưa có bài viết nào</h3>
            <p>Các bài viết sẽ được cập nhật sớm. Hãy quay lại sau nhé!</p>
          </div>
        ) : (
          <>
            {/* Featured post (bài đầu tiên) */}
            <div className="blog-featured">
              <div className="blog-featured-image">
                <div className="blog-featured-placeholder">
                  <span>📰</span>
                </div>
                {blogs[0].tags && <div className="blog-featured-tag">{blogs[0].tags.split(',')[0]}</div>}
              </div>
              <div className="blog-featured-info">
                <div className="blog-featured-date">{formatDate(blogs[0].published_at || blogs[0].created_at)}</div>
                <h2 className="blog-featured-title">{blogs[0].title}</h2>
                <p className="blog-featured-excerpt">
                  {blogs[0].excerpt || blogs[0].content.substring(0, 200) + '...'}
                </p>
                <div className="blog-featured-meta">
                  <span>Bởi {blogs[0].author_name || 'Admin'}</span>
                  <span>{blogs[0].view_count || 0} lượt xem</span>
                </div>
                <button className="blog-read-btn">Đọc tiếp →</button>
              </div>
            </div>

            {/* Danh sách bài viết còn lại */}
            {blogs.length > 1 && (
              <div className="blog-list-section">
                <h2 className="blog-list-title">Bài viết gần đây</h2>
                <div className="blog-grid-full">
                  {blogs.slice(1).map(blog => (
                    <div className="blog-card-full" key={blog.id}>
                      <div className="blog-card-image">
                        <div className="blog-card-placeholder">📰</div>
                        {blog.tags && <div className="blog-card-tag">{blog.tags.split(',')[0]}</div>}
                      </div>
                      <div className="blog-card-body">
                        <div className="blog-card-date">{formatDate(blog.published_at || blog.created_at)}</div>
                        <h3 className="blog-card-title">{blog.title}</h3>
                        <p className="blog-card-excerpt">
                          {blog.excerpt || blog.content.substring(0, 120) + '...'}
                        </p>
                        <div className="blog-card-footer">
                          <span>{blog.author_name || 'Admin'}</span>
                          <span>{blog.view_count || 0} lượt xem</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default BlogPage;
