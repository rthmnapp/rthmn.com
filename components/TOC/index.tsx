'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PortableTextBlock } from '@portabletext/types';
import { BlockProps } from '@/components/PageBuilder/blocks/Blocks';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface ContentBlock extends BlockProps {
    content: PortableTextBlock[];
}

export const generateHeadingId = (text: string): string => {
    if (!text) return '';

    const cleanText = text.replace(/^\d+\.\s*/, '');
    return cleanText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim();
};

export function TableOfContents({ blocks }: { blocks: BlockProps[] }) {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const pathname = usePathname();

    useEffect(() => {
        const items: TOCItem[] = [];
        blocks?.forEach((block) => {
            const contentBlock = block as ContentBlock;
            contentBlock.content?.forEach((content: PortableTextBlock) => {
                if (content.style?.match(/^h[1-6]$/)) {
                    const text = content.children
                        ?.map((child) => child.text)
                        .filter(Boolean)
                        .join('')
                        .trim();

                    if (text) {
                        const level = parseInt(content.style[1]);
                        const id = generateHeadingId(text);
                        items.push({ id, text, level });
                    }
                }
            });
        });
        setHeadings(items);
    }, [blocks]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-100px 0px -66%',
                threshold: 1.0,
            }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100; // Adjust this value based on your header height
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveId(id);
        }
    };

    return (
        <nav className='w-full'>
            <h4 className='mb-4 text-sm font-semibold text-gray-400'>On this page</h4>
            <ul className='space-y-3 text-sm'>
                {headings.map((heading) => (
                    <li key={heading.id} style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}>
                        <Link
                            href={`${pathname}#${heading.id}`}
                            scroll={false}
                            onClick={(e) => handleClick(e, heading.id)}
                            className={`inline-block w-full text-left transition-all duration-200 ${
                                activeId === heading.id ? 'translate-x-2 rounded-lg bg-emerald-400/10 p-2 font-medium text-emerald-400' : 'text-gray-400 hover:text-white'
                            }`}>
                            {heading.text}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
