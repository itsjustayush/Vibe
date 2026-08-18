import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Sparkles } from "lucide-react";
import { useState } from "react";
import Markdown from "react-markdown";
import { Post } from "../types";
import BlurText from "./BlurText";
import Reveal from "./Reveal";

interface StoriesViewProps {
  posts: Post[];
  onNavigate: (view: string) => void;
}

const formatDate = (value: string | number | Date, full = false) =>
  new Date(value).toLocaleDateString("en-US", full ? { day: "numeric", month: "long", year: "numeric" } : { month: "short", year: "numeric" });

export default function StoriesView({ posts, onNavigate }: StoriesViewProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const openPost = (post: Post) => {
    setSelectedPost(post);
    try {
      import("../dbHelper").then(({ trackInsightEncounter }) => trackInsightEncounter("storyViews")).catch(() => {});
    } catch {
      // Analytics is intentionally non-blocking for the reader.
    }
  };

  if (selectedPost) {
    return (
      <main className="page-shell max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 md:py-16">
        <Reveal>
          <button type="button" onClick={() => setSelectedPost(null)} className="button-ghost mb-8">
            <ArrowLeft size={16} aria-hidden="true" />
            Return to journal
          </button>

          <article>
            <div className="story-cover-frame relative overflow-hidden">
              <img src={selectedPost.coverImage} alt={selectedPost.title} className="story-cover-image" referrerPolicy="no-referrer" />
              <span className="story-cover-label">{selectedPost.category}</span>
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-10 items-start">
              <header>
                <div className="eyebrow-row">
                  <span>Series monograph</span>
                  <span className="eyebrow-dot" aria-hidden="true" />
                  <span>{selectedPost.category}</span>
                </div>
                <h1 className="display-title display-title--article">
                  <BlurText text={selectedPost.title} delay={42} animateBy="words" />
                </h1>
                <div className="story-byline">
                  <span>By Ayush Bhattacharya</span>
                  <span aria-hidden="true">/</span>
                  <span>{formatDate(selectedPost.createdAt, true)}</span>
                </div>
              </header>

              <aside className="story-aside">
                <div className="story-aside-icon"><BookOpen size={18} aria-hidden="true" /></div>
                <p className="eyebrow">Reading note</p>
                <p>Slow looking, structural detail, and the stories held between frames.</p>
              </aside>
            </div>

            <div className="story-article-copy prose prose-stone max-w-none mt-12">
              <Markdown>{selectedPost.content}</Markdown>
            </div>

            {selectedPost.analyzedThemes && selectedPost.analyzedThemes.length > 0 && (
              <aside className="story-theme-panel mt-14">
                <div className="flex items-start gap-3">
                  <Sparkles size={18} aria-hidden="true" className="mt-0.5 text-[var(--accent)]" />
                  <div>
                    <p className="eyebrow">Curation layer</p>
                    <h2 className="mt-1 font-serif text-2xl text-[var(--foreground)]">Themes found in this story</h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-5">
                  {selectedPost.analyzedThemes.map((tag) => <span key={tag} className="tag-chip tag-chip--active">#{tag}</span>)}
                </div>
              </aside>
            )}

            <div className="mt-14 pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <p className="eyebrow">End of entry</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">Return to the archive for another visual essay.</p>
              </div>
              <button type="button" onClick={() => setSelectedPost(null)} className="button-primary">
                Browse journal <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </article>
        </Reveal>
      </main>
    );
  }

  return (
    <main className="page-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10 md:py-16">
      <Reveal>
        <header className="page-hero page-hero--journal">
          <div>
            <div className="eyebrow-row"><span>The chronicles of vibe</span><span className="eyebrow-dot" aria-hidden="true" /><span>{posts.length} entries</span></div>
            <h1 className="display-title mt-4"><BlurText text="Editorial journal" delay={75} animateBy="words" /></h1>
          </div>
          <p className="page-hero-copy">Detailed thoughts, structural mechanics, design reviews, and architectural stories written as a slow curation diary accompanying high focal plane imagery.</p>
        </header>
      </Reveal>

      {posts.length === 0 ? (
        <Reveal delay={80}>
          <div className="empty-state">
            <BookOpen size={28} aria-hidden="true" />
            <h2>No narratives published yet</h2>
            <p>The magazine is raw material pending curation.</p>
          </div>
        </Reveal>
      ) : (
        <div className="story-list">
          {posts.map((post, idx) => {
            const firstLine = post.content.split("\n\n")[0] || post.content;
            const excerpt = firstLine.length > 220 ? `${firstLine.slice(0, 220)}…` : firstLine;
            return (
              <Reveal key={post.id || idx} delay={Math.min(idx * 70, 280)}>
                <button type="button" onClick={() => openPost(post)} className="story-row group" aria-label={`Read ${post.title}`}>
                  <div className="story-row-media">
                    <img src={post.coverImage} alt="" className="story-row-image" referrerPolicy="no-referrer" />
                    <span className="story-cover-label">{post.category}</span>
                  </div>
                  <div className="story-row-body">
                    <div className="eyebrow-row"><span>{post.category}</span><span className="eyebrow-dot" aria-hidden="true" /><span className="inline-flex items-center gap-1"><CalendarDays size={12} aria-hidden="true" />{formatDate(post.createdAt)}</span></div>
                    <h2 className="story-row-title">{post.title}</h2>
                    <p className="story-row-excerpt">{excerpt}</p>
                    <span className="story-read-more">Read story <ArrowRight size={15} aria-hidden="true" /></span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      )}
    </main>
  );
}
