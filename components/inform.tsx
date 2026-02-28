// components/inform.tsx
'use client';

import React, {useEffect, useState} from 'react';
import { marked } from 'marked';

interface InformProps {
    filename: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    theme?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
    autoClose?: boolean;
    autoCloseDelay?: number;
    className?: string;
}

const themeStyles = {
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    red: 'bg-red-600 text-white',
    yellow: 'bg-yellow-600 text-white',
    purple: 'bg-purple-600 text-white',
    gray: 'bg-gray-800 text-white',
};

const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
};

export const Inform: React.FC<InformProps> = ({
                                                  filename,
                                                  position = 'top-right',
                                                  theme = 'blue',
                                                  autoClose = false,
                                                  autoCloseDelay = 5000,
                                                  className = '',
                                              }) => {
    const [content, setContent] = useState<string>('');
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadContent = async () => {
            try {
                const response = await fetch(`/inform/${filename}.md`);
                if (response.ok) {
                    const text = await response.text();
                    setContent(text);
                    setIsVisible(true);
                } else {
                    console.warn(`無法載入公告文件: ${filename}.md`);
                }
            } catch (error) {
                console.error('載入公告失敗:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadContent();
    }, [filename]);

    useEffect(() => {
        if (autoClose && isVisible) {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [autoClose, autoCloseDelay, isVisible]);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (isLoading || !content || !isVisible) {
        return null;
    }

    const baseStyles = `
    fixed z-50 max-w-sm rounded-lg shadow-lg transform transition-all duration-300 ease-in-out
    ${positionStyles[position]} ${themeStyles[theme]} ${className}
  `.trim();

    return (
        <>
            <style jsx>{`
                .inform-banner {
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from {
                        transform: translateX(${position.includes('right') ? '100%' : '-100%'});
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .inform-content :global(h1),
                .inform-content :global(h2),
                .inform-content :global(h3),
                .inform-content :global(h4),
                .inform-content :global(h5),
                .inform-content :global(h6) {
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    line-height: 1.25;
                }

                .inform-content :global(h1) {
                    font-size: 1.25rem;
                }

                .inform-content :global(h2) {
                    font-size: 1.125rem;
                }

                .inform-content :global(h3) {
                    font-size: 1rem;
                }

                .inform-content :global(p) {
                    margin-bottom: 0.75rem;
                    line-height: 1.5;
                }

                .inform-content :global(a) {
                    color: rgba(255, 255, 255, 0.8);
                    text-decoration: underline;
                    transition: color 0.2s;
                }

                .inform-content :global(a:hover) {
                    color: white;
                }

                .inform-content :global(ul),
                .inform-content :global(ol) {
                    margin-bottom: 0.75rem;
                    padding-left: 1.25rem;
                }

                .inform-content :global(ul) {
                    list-style-type: disc;
                }

                .inform-content :global(ol) {
                    list-style-type: decimal;
                }

                .inform-content :global(li) {
                    margin-bottom: 0.25rem;
                }

                .inform-content :global(strong) {
                    font-weight: 600;
                }

                .inform-content :global(em) {
                    font-style: italic;
                }

                .inform-content :global(code) {
                    background-color: rgba(255, 255, 255, 0.2);
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                }

                .inform-content :global(blockquote) {
                    border-left: 3px solid rgba(255, 255, 255, 0.5);
                    padding-left: 1rem;
                    margin: 0.75rem 0;
                    font-style: italic;
                }

                .close-button {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                    transition: background-color 0.2s;
                }

                .close-button:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }

                .close-button:focus {
                    outline: 2px solid rgba(255, 255, 255, 0.5);
                    outline-offset: 2px;
                }
            `}</style>

            <div className={`inform-banner ${baseStyles}`}>
                <div className="relative p-4 pr-8">
                    <button
                        onClick={handleClose}
                        className="close-button"
                        aria-label="关闭"
                        type="button"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                    <div
                        className="inform-content text-sm"
                        dangerouslySetInnerHTML={{__html: marked(content)}}
                    />
                </div>
            </div>
        </>
    );
};

// 默認導出
export default Inform;

// 命名導出
export {Inform as inform};