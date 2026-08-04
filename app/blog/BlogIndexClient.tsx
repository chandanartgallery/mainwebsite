'use client';

import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import FadeContent from '@/components/FadeContent';
import SplitText from '@/components/SplitText';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  featured_image?: string | null;
  seo_description?: string | null;
  content?: string | null;
  reading_time?: number | null;
  category?: { name?: string; slug?: string } | null;
}

const fallbackImage = 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1100';

export default function BlogIndexClient({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) {
    return (
      <div>
        <h1 className="font-serif text-3xl text-neutral-900 dark:text-neutral-50 sm:text-4xl">Journal</h1>
        <p className="mt-8 text-sm text-neutral-500">No posts published yet.</p>
      </div>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <div>
      <div className="mb-10 border-b border-neutral-200 pb-6 dark:border-neutral-800">
        <SplitText
          text="Journal"
          tag="h1"
          splitType="chars"
          delay={35}
          duration={0.65}
          ease="power3.out"
          from={{ opacity: 0, y: 24 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0}
          textAlign="left"
          className="!block font-serif text-3xl text-neutral-900 dark:text-neutral-50 sm:text-4xl"
        />
        <p className="mt-2 max-w-xl text-sm text-neutral-500">
          Framing guides, material notes, and studio updates.
        </p>
      </div>

      <FadeContent>
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid cursor-pointer overflow-hidden border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
        >
          <div className="relative aspect-[16/10] max-h-[340px] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <img
              src={featured.featured_image || fallbackImage}
              alt={featured.title}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                {featured.category?.name || 'Journal'}
              </p>
              <h2 className="mt-2 font-serif text-2xl leading-tight text-neutral-900 dark:text-neutral-50 sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-neutral-500">
                {featured.seo_description ||
                  (featured.content ? `${featured.content.slice(0, 220)}…` : '')}
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs text-neutral-500 dark:border-neutral-800">
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                {featured.reading_time || 3} min read
              </span>
              <span className="flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100">
                Read <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>
      </FadeContent>

      {rest.length > 0 && (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <FadeContent key={post.id} delay={i * 60}>
              <Link href={`/blog/${post.slug}`} className="group block cursor-pointer">
                <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  <img
                    src={post.featured_image || fallbackImage}
                    alt={post.title}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-neutral-400">
                    {post.category?.name || 'Journal'}
                    {post.reading_time ? ` · ${post.reading_time} min` : ''}
                  </p>
                  <h3 className="mt-2 line-clamp-2 font-serif text-xl leading-snug text-neutral-900 group-hover:underline dark:text-neutral-50">
                    {post.title}
                  </h3>
                  {(post.seo_description || post.content) && (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">
                      {post.seo_description || `${post.content?.slice(0, 120)}…`}
                    </p>
                  )}
                </div>
              </Link>
            </FadeContent>
          ))}
        </div>
      )}
    </div>
  );
}
