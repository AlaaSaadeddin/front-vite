import React, { useState, useEffect } from 'react';
import {
    Search, Book, Clock, Zap, FileText, Users, Settings,
    Play, MessageSquare, ArrowUpRight, ArrowRight, BookOpen,
    MessageCircle, Video
} from 'lucide-react';
import api from '../services/api';

interface HelpLink {
    title: string;
    path: string;
}

interface HelpCategory {
    id: string;
    title: string;
    description: string;
    icon: string;
    links: HelpLink[];
}

interface PopularArticle {
    id: number;
    title: string;
    views: string;
}

interface HelpData {
    categories: HelpCategory[];
    popularArticles: PopularArticle[];
}

const iconMap: Record<string, any> = {
    'Book': Book,
    'Clock': Clock,
    'Zap': Zap,
    'FileText': FileText,
    'Users': Users,
    'Settings': Settings
};

const HelpCenter: React.FC = () => {
    const [data, setData] = useState<HelpData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHelpContent();
    }, []);

    const fetchHelpContent = async () => {
        try {
            const res = await api.get('/help/content');
            setData(res.data.data);
        } catch (error) {
            console.error('Failed to fetch help content', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
    if (!data) return <div style={{ padding: '2rem' }}>Error loading help center</div>;

    const filteredCategories = data.categories.filter(cat =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.links.some(l => l.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                More &gt; Help Center
            </div>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        Help Center
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Find answers and learn how to use the platform
                    </p>
                </div>

                <div style={{ position: 'relative', width: '350px' }}>
                    <Search
                        size={18}
                        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search for help..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border)',
                            background: 'white',
                            outline: 'none',
                            fontSize: '0.95rem',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    />
                </div>
            </div>

            {/* Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {filteredCategories.map((cat) => {
                    const Icon = iconMap[cat.icon] || Book;
                    return (
                        <div key={cat.id} style={{
                            background: 'white',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '0.65rem',
                                    background: 'rgba(5, 150, 105, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Icon size={22} color="var(--primary)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{cat.title}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{cat.description}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {cat.links.map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.path}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            fontSize: '0.85rem',
                                            color: '#059669',
                                            textDecoration: 'none',
                                            fontWeight: 500,
                                            width: 'fit-content'
                                        }}
                                    >
                                        <ArrowUpRight size={14} />
                                        {link.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Popular Articles */}
            <div style={{
                background: 'white',
                borderRadius: '1rem',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '2.5rem',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: '#F9FAFB' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Popular Articles</h3>
                </div>
                <div style={{ padding: '1rem 0' }}>
                    {data.popularArticles.map((article, idx) => (
                        <div
                            key={article.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1rem 1.5rem',
                                borderBottom: idx === data.popularArticles.length - 1 ? 'none' : '1px solid #F3F4F6',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#F9FAFB')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: '#E5E7EB',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    color: 'var(--text-muted)'
                                }}>
                                    {article.id}
                                </div>
                                <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>{article.title}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{article.views}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Support Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem 1.5rem',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '0.75rem',
                        background: 'rgba(5, 150, 105, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <BookOpen size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Documentation</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Comprehensive guides and API references</p>
                        <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            View Documentation <ArrowRight size={14} />
                        </a>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem 1.5rem',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '0.75rem',
                        background: 'rgba(5, 150, 105, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Video size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Video Tutorials</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Step-by-step video guides for all features</p>
                        <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            Watch Tutorials <ArrowRight size={14} />
                        </a>
                    </div>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '2rem 1.5rem',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '0.75rem',
                        background: 'rgba(5, 150, 105, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <MessageCircle size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Community Forum</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Connect with other users and share tips</p>
                        <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            Join Community <ArrowRight size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
