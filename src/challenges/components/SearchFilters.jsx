import React from 'react';

export default function SearchFilters({
  search,
  setSearch,
  difficulty,
  setDifficulty,
  category,
  setCategory,
  tag,
  setTag,
  sortBy,
  setSortBy,
  allTags = [],
  allCategories = [],
  onReset
}) {
  return (
    <div className="sticky top-[72px] z-30 bg-[var(--card)]/90 backdrop-blur-md border border-[var(--border)] rounded-2xl p-5 shadow-md flex flex-wrap items-center gap-4 w-full">
      
      {/* Search Input with generous padding to prevent icon overlapping */}
      <div className="flex-1 min-w-[280px] relative">
        <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm" />
        <input
          type="text"
          placeholder="Search by title, description or tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-[var(--orange)] focus:ring-1 focus:ring-[var(--orange)] transition-all placeholder:text-[var(--text-muted)] font-medium"
        />
      </div>

      {/* Filter items with explicit gaps */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        
        {/* Difficulty Select */}
        <div className="relative flex-1 sm:flex-initial">
          <i className="fa-solid fa-bolt absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--orange)] cursor-pointer appearance-none min-w-[130px] transition-colors"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px] pointer-events-none" />
        </div>

        {/* Category Select */}
        <div className="relative flex-1 sm:flex-initial">
          <i className="fa-solid fa-tags absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--orange)] cursor-pointer appearance-none min-w-[135px] transition-colors"
          >
            <option value="all">All Categories</option>
            {allCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px] pointer-events-none" />
        </div>

        {/* Tag Select */}
        <div className="relative flex-1 sm:flex-initial">
          <i className="fa-solid fa-hashtag absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
          <select
            value={tag}
            onChange={e => setTag(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--orange)] cursor-pointer appearance-none min-w-[130px] transition-colors"
          >
            <option value="all">All Tags</option>
            {allTags.map(t => (
              <option key={t} value={t}>#{t}</option>
            ))}
          </select>
          <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px] pointer-events-none" />
        </div>

        {/* Sort By Select */}
        <div className="relative flex-1 sm:flex-initial">
          <i className="fa-solid fa-arrow-down-wide-short absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs font-bold text-[var(--text)] outline-none focus:border-[var(--orange)] cursor-pointer appearance-none min-w-[140px] transition-colors"
          >
            <option value="newest">Newest First</option>
            <option value="xp-desc">XP: High to Low</option>
            <option value="xp-asc">XP: Low to High</option>
            <option value="title">Alphabetical</option>
          </select>
          <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px] pointer-events-none" />
        </div>

      </div>

      {/* Reset Filter Button with margin gap */}
      <button
        onClick={onReset}
        className="px-4 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto w-full sm:w-auto justify-center"
      >
        <i className="fa-solid fa-arrow-rotate-left text-xs" />
        Reset Filters
      </button>
    </div>
  );
}
