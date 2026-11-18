import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  X,
  FileText,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';
import {
  FilterState,
  ListingTab,
  SOPRecord,
  SOPStatus,
  UserProfile,
} from '../types/sop';
import { CATEGORY_SUBCATEGORY_MAP } from '../data/seedData';
import {
  filterSops,
  getForMyReviewSops,
  getMySops,
  getRowActionVisibility,
  paginateItems,
} from '../utils/sopRules';
import { formatDateShort } from '../utils/storage';
import { RowActionsMenu } from './RowActionsMenu';
import { StatusBadge } from './StatusBadge';

interface SopListingScreenProps {
  sops: SOPRecord[];
  currentUser: UserProfile;
  activeTab: ListingTab;
  onChangeTab: (tab: ListingTab) => void;
  filters: FilterState;
  onChangeFilters: (next: FilterState) => void;
  onAddSop: () => void;
  onViewSop: (sop: SOPRecord) => void;
  onOpenActivity: (sopId: string) => void;
  onEditSop: (sopId: string) => void;
  onMakeChanges: (sopId: string) => void;
  onReviewSop: (sopId: string) => void;
}

const ALL_STATUSES: SOPStatus[] = [
  'Draft',
  'Submitted',
  'Requested Modification',
  'Modification In Progress',
  'Resubmitted',
  'Approved',
  'Rejected',
];

export const SopListingScreen: React.FC<SopListingScreenProps> = ({
  sops,
  currentUser,
  activeTab,
  onChangeTab,
  filters,
  onChangeFilters,
  onAddSop,
  onViewSop,
  onOpenActivity,
  onEditSop,
  onMakeChanges,
  onReviewSop,
}) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const isReviewer = currentUser.role === 'Reviewer';

  const mySops = useMemo(
    () => getMySops(sops, currentUser.email),
    [sops, currentUser.email]
  );

  const forReviewSops = useMemo(
    () => getForMyReviewSops(sops, currentUser),
    [sops, currentUser]
  );

  const effectiveTab: ListingTab =
    !isReviewer && activeTab === 'for-review' ? 'my-sops' : activeTab;

  const baseList = effectiveTab === 'for-review' ? forReviewSops : mySops;

  const categoryOptions = useMemo(() => {
    const set = new Set<string>(Object.keys(CATEGORY_SUBCATEGORY_MAP));
    sops.forEach((s) => set.add(s.category));
    return Array.from(set).sort();
  }, [sops]);

  const subCategoryOptions = useMemo(() => {
    const set = new Set<string>();
    if (filters.category && CATEGORY_SUBCATEGORY_MAP[filters.category]) {
      CATEGORY_SUBCATEGORY_MAP[filters.category].forEach((sc) => set.add(sc));
    } else {
      Object.values(CATEGORY_SUBCATEGORY_MAP).forEach((arr) =>
        arr.forEach((sc) => set.add(sc))
      );
    }
    sops.forEach((s) => {
      if (!filters.category || s.category === filters.category) {
        set.add(s.subCategory);
      }
    });
    return Array.from(set).sort();
  }, [sops, filters.category]);

  const filteredSops = useMemo(
    () => filterSops(baseList, filters),
    [baseList, filters]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    effectiveTab,
    filters.search,
    filters.category,
    filters.subCategory,
    filters.status,
    filters.fromDate,
    filters.toDate,
    pageSize,
  ]);

  const paginated = useMemo(
    () => paginateItems(filteredSops, currentPage, pageSize),
    [filteredSops, currentPage, pageSize]
  );

  const advancedFilterCount = [
    filters.category,
    filters.subCategory,
    filters.status,
    filters.fromDate,
    filters.toDate,
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(filters.search || advancedFilterCount > 0);

  const clearFilters = () => {
    onChangeFilters({
      search: '',
      category: '',
      subCategory: '',
      status: '',
      fromDate: '',
      toDate: '',
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Title & + Add SOP Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            SOP Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create, submit, track, and govern RetailOps Standard Operating Procedures
          </p>
        </div>

        <button
          type="button"
          onClick={onAddSop}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#97144D] px-4 py-2.5 min-h-[44px] text-sm font-bold text-white shadow-sm hover:bg-[#7A0F3D] active:bg-[#5E0B2E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#97144D] focus-visible:ring-offset-2 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add SOP
        </button>
      </div>

      {/* Role-Based Tabs + Search & Multi-Filter Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-3 sm:px-6 bg-white">
          <div className="flex items-center gap-1 -mb-px overflow-x-auto" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={effectiveTab === 'my-sops'}
              onClick={() => onChangeTab('my-sops')}
              className={`inline-flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3.5 text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
                effectiveTab === 'my-sops'
                  ? 'border-[#97144D] text-[#97144D] bg-[#F9EFF3]/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              My SOPs
              <span
                className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                  effectiveTab === 'my-sops'
                    ? 'bg-[#97144D] text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {mySops.length}
              </span>
            </button>

            {isReviewer && (
              <button
                type="button"
                role="tab"
                aria-selected={effectiveTab === 'for-review'}
                onClick={() => onChangeTab('for-review')}
                className={`inline-flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3.5 text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
                  effectiveTab === 'for-review'
                    ? 'border-[#97144D] text-[#97144D] bg-[#F9EFF3]/60'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                For My Review
                <span
                  className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                    effectiveTab === 'for-review'
                      ? 'bg-[#97144D] text-white'
                      : forReviewSops.length > 0
                      ? 'bg-[#ED1164] text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {forReviewSops.length}
                </span>
              </button>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 whitespace-nowrap">
            <Filter className="h-3.5 w-3.5 text-[#97144D]" />
            <span>
              Showing{' '}
              <strong className="text-slate-800 tabular-nums">
                {paginated.totalItems === 0
                  ? '0'
                  : `${paginated.startIndex}–${paginated.endIndex}`}
              </strong>{' '}
              of{' '}
              <strong className="text-slate-800 tabular-nums">
                {filteredSops.length}
              </strong>{' '}
              SOPs
            </span>
          </div>
        </div>

        {/* Search & Multi-Filter Bar */}
        <div className="border-b border-slate-200 bg-[#F8FAFC] px-3 py-3 sm:px-6 sm:py-3.5 space-y-3">
          {/* Mobile Search + Filter Drawer Toggle Row */}
          <div className="flex items-end gap-2 md:hidden">
            <div className="flex-1">
              <label
                htmlFor="filter-search-mobile"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
              >
                Search SOP
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="filter-search-mobile"
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="SOP ID or Name..."
                  className="w-full min-h-[42px] rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-[#97144D] focus:outline-none focus:ring-1 focus:ring-[#97144D]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              aria-expanded={mobileFiltersOpen}
              className={`inline-flex items-center gap-1.5 min-h-[42px] rounded-md border px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                mobileFiltersOpen || advancedFilterCount > 0
                  ? 'border-[#97144D] bg-[#F9EFF3] text-[#97144D]'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {advancedFilterCount > 0 && (
                <span className="rounded-full bg-[#97144D] px-1.5 py-0.5 text-[10px] text-white tabular-nums">
                  {advancedFilterCount}
                </span>
              )}
              {mobileFiltersOpen ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Full Multi-Filter Grid (Always visible on md+, collapsible on mobile) */}
          <div
            className={`${
              mobileFiltersOpen ? 'grid' : 'hidden md:grid'
            } grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-12 items-end`}
          >
            {/* Desktop Search by SOP Name or ID */}
            <div className="hidden md:block lg:col-span-2 xl:col-span-3">
              <label
                htmlFor="filter-search"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
              >
                Search SOP
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="filter-search"
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="SOP ID or Name..."
                  className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:border-[#97144D] focus:outline-none focus:ring-1 focus:ring-[#97144D]"
                />
              </div>
            </div>

            {/* Category */}
            <div className="lg:col-span-2 xl:col-span-2">
              <label
                htmlFor="filter-category"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
              >
                Category
              </label>
              <select
                id="filter-category"
                value={filters.category}
                onChange={(e) =>
                  onChangeFilters({
                    ...filters,
                    category: e.target.value,
                    subCategory: '',
                  })
                }
                className="w-full min-h-[40px] md:min-h-0 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-[#97144D] focus:outline-none focus:ring-1 focus:ring-[#97144D]"
              >
                <option value="">All Categories</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-category */}
            <div className="lg:col-span-2 xl:col-span-2">
              <label
                htmlFor="filter-subcategory"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
              >
                Sub-category
              </label>
              <select
                id="filter-subcategory"
                value={filters.subCategory}
                onChange={(e) =>
                  onChangeFilters({ ...filters, subCategory: e.target.value })
                }
                className="w-full min-h-[40px] md:min-h-0 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-[#97144D] focus:outline-none focus:ring-1 focus:ring-[#97144D]"
              >
                <option value="">All Sub-categories</option>
                {subCategoryOptions.map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="lg:col-span-2 xl:col-span-2">
              <label
                htmlFor="filter-status"
                className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
              >
                Status
              </label>
              <select
                id="filter-status"
                value={filters.status}
                onChange={(e) =>
                  onChangeFilters({ ...filters, status: e.target.value })
                }
                className="w-full min-h-[40px] md:min-h-0 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 focus:border-[#97144D] focus:outline-none focus:ring-1 focus:ring-[#97144D]"
              >
                <option value="">All Statuses</option>
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="sm:col-span-2 lg:col-span-4 xl:col-span-3 grid grid-cols-2 gap-2 items-end">
              <div className="min-w-0">
                <label
                  htmlFor="filter-from-date"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
                >
                  From Date
                </label>
                <input
                  id="filter-from-date"
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, fromDate: e.target.value })
                  }
                  className="w-full min-w-0 min-h-[40px] md:min-h-0 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 tabular-nums focus:border-[#97144D] focus:outline-none focus:ring-1 focus:ring-[#97144D]"
                />
              </div>
              <div className="min-w-0">
                <label
                  htmlFor="filter-to-date"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1"
                >
                  To Date
                </label>
                <input
                  id="filter-to-date"
                  type="date"
                  value={filters.toDate}
                  onChange={(e) =>
                    onChangeFilters({ ...filters, toDate: e.target.value })
                  }
                  className="w-full min-w-0 min-h-[40px] md:min-h-0 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 tabular-nums focus:border-[#97144D] focus:outline-none focus:ring-1 focus:ring-[#97144D]"
                />
              </div>
            </div>
          </div>

          {/* Desktop Active Filters & Clear Filters Row */}
          {hasActiveFilters && (
            <div className="hidden md:flex items-center justify-between gap-3 border-t border-slate-200/80 pt-2.5 text-xs">
              <span className="text-slate-500">
                Active filters applied —{' '}
                <strong className="text-slate-800 tabular-nums">
                  {filteredSops.length}
                </strong>{' '}
                matching SOP{filteredSops.length === 1 ? '' : 's'}
              </span>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#97144D]/35 bg-white px-3 py-1 text-xs font-bold text-[#97144D] hover:bg-[#F9EFF3] hover:border-[#97144D] transition-colors whitespace-nowrap shrink-0"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            </div>
          )}

          {/* Mobile Result Count Summary & Clear Filters */}
          <div className="flex md:hidden items-center justify-between text-xs text-slate-500 pt-0.5">
            <span>
              Showing{' '}
              <strong className="text-slate-800 tabular-nums">
                {paginated.totalItems === 0
                  ? '0'
                  : `${paginated.startIndex}–${paginated.endIndex}`}
              </strong>{' '}
              of{' '}
              <strong className="text-slate-800 tabular-nums">
                {filteredSops.length}
              </strong>{' '}
              SOPs
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 font-bold text-[#97144D] hover:underline whitespace-nowrap"
              >
                <X className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filteredSops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F9EFF3] text-[#97144D]">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">
              {effectiveTab === 'for-review'
                ? hasActiveFilters
                  ? 'No matching SOPs for review'
                  : 'No SOPs to review'
                : hasActiveFilters
                ? 'No SOPs match your filters'
                : 'No SOPs uploaded yet'}
            </h3>
            <p className="mt-1 max-w-md text-xs sm:text-sm text-slate-500">
              {effectiveTab === 'for-review'
                ? 'Pending SOPs submitted or resubmitted by other colleagues will appear here for your review.'
                : hasActiveFilters
                ? 'Try adjusting or clearing your search and filter criteria.'
                : 'Click "+ Add SOP" above to upload and submit a new Standard Operating Procedure.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-md border border-[#97144D] px-3.5 py-2 text-xs font-bold text-[#97144D] hover:bg-[#F9EFF3]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile & Tablet Card List (< lg): Axis Bank Mobile-Native Cards */}
            <div className="lg:hidden divide-y divide-slate-200">
              {paginated.items.map((sop) => {
                const vis = getRowActionVisibility(
                  sop,
                  effectiveTab,
                  currentUser
                );
                return (
                  <article
                    key={sop.id}
                    className="p-4 bg-white hover:bg-[#F9EFF3]/30 transition-colors space-y-3"
                  >
                    {/* Top Row: ID + Version + Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-[#97144D] font-mono-tabular">
                          {sop.id}
                        </span>
                        <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-700 tabular-nums border border-slate-200">
                          v{sop.version}
                        </span>
                      </div>
                      <StatusBadge status={sop.status} compact />
                    </div>

                    {/* SOP Name & File */}
                    <div>
                      <button
                        type="button"
                        onClick={() => onViewSop(sop)}
                        className="text-left text-sm font-extrabold text-slate-900 hover:text-[#97144D] hover:underline leading-snug"
                      >
                        {sop.name}
                      </button>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {sop.file.fileName}
                      </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg bg-slate-50 border border-slate-200/80 p-3 text-xs">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Category
                        </span>
                        <span className="font-semibold text-slate-800">
                          {sop.category}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Sub-category
                        </span>
                        <span className="font-medium text-slate-700">
                          {sop.subCategory}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Uploaded by
                        </span>
                        <span className="font-semibold text-slate-800 block truncate">
                          {sop.uploadedByName}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Created / Updated
                        </span>
                        <span className="text-slate-700 tabular-nums">
                          {formatDateShort(sop.createdAt)} ·{' '}
                          {formatDateShort(sop.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Touch-Friendly Row Actions */}
                    <div className="pt-0.5">
                      <RowActionsMenu
                        sop={sop}
                        visibility={vis}
                        onViewSop={onViewSop}
                        onOpenActivity={onOpenActivity}
                        onEditSop={onEditSop}
                        onMakeChanges={onMakeChanges}
                        onReviewSop={onReviewSop}
                        compact={false}
                      />
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop Data Table (lg+: Exact 10 Columns) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-[#F8FAFC]">
                  <tr>
                    <th className="px-2.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap">
                      SOP ID
                    </th>
                    <th className="px-2.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                      SOP name
                    </th>
                    <th className="px-2 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap">
                      Version
                    </th>
                    <th className="px-2 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap">
                      Category
                    </th>
                    <th className="px-2 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap">
                      Sub-category
                    </th>
                    <th className="px-2 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-2 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap">
                      Uploaded by
                    </th>
                    <th className="px-2 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap">
                      Created date
                    </th>
                    <th className="px-2 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap">
                      Last updated
                    </th>
                    <th className="px-2.5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#475569] whitespace-nowrap text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paginated.items.map((sop) => {
                    const vis = getRowActionVisibility(
                      sop,
                      effectiveTab,
                      currentUser
                    );

                    return (
                      <tr
                        key={sop.id}
                        className="hover:bg-[#F9EFF3]/50 transition-colors"
                      >
                        <td className="px-2.5 py-3 text-xs font-bold text-[#97144D] font-mono-tabular whitespace-nowrap">
                          {sop.id}
                        </td>
                        <td className="px-2.5 py-3 w-[205px] max-w-[205px]">
                          <button
                            type="button"
                            onClick={() => onViewSop(sop)}
                            className="text-left text-[13px] font-bold text-slate-900 hover:text-[#97144D] hover:underline leading-snug line-clamp-2"
                          >
                            {sop.name}
                          </button>
                          <p
                            className="text-[11px] text-slate-400 truncate mt-0.5"
                            title={sop.file.fileName}
                          >
                            {sop.file.fileName}
                          </p>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs font-bold text-slate-700 tabular-nums border border-slate-200">
                            v{sop.version}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-xs font-medium text-slate-700 max-w-[115px] leading-snug">
                          {sop.category}
                        </td>
                        <td className="px-2 py-3 text-xs text-slate-600 max-w-[115px] leading-snug">
                          {sop.subCategory}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <StatusBadge status={sop.status} compact />
                        </td>
                        <td className="px-2 py-3 max-w-[130px]">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {sop.uploadedByName}
                          </p>
                          <p
                            className="text-[11px] text-slate-400 truncate"
                            title={sop.uploadedByEmail}
                          >
                            {sop.uploadedByEmail}
                          </p>
                        </td>
                        <td className="px-2 py-3 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                          {formatDateShort(sop.createdAt)}
                        </td>
                        <td className="px-2 py-3 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                          {formatDateShort(sop.updatedAt)}
                        </td>
                        <td className="px-2.5 py-3 whitespace-nowrap text-right w-[152px]">
                          <RowActionsMenu
                            sop={sop}
                            visibility={vis}
                            onViewSop={onViewSop}
                            onOpenActivity={onOpenActivity}
                            onEditSop={onEditSop}
                            onMakeChanges={onMakeChanges}
                            onReviewSop={onReviewSop}
                            compact
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 bg-[#F8FAFC] px-4 py-3 sm:px-6">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="sop-page-size"
                    className="font-semibold text-slate-600 whitespace-nowrap"
                  >
                    Rows per page:
                  </label>
                  <select
                    id="sop-page-size"
                    aria-label="Rows per page"
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800 tabular-nums focus:border-[#97144D] focus:outline-none focus:ring-1 focus:ring-[#97144D]"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <span className="tabular-nums text-slate-500">
                  Showing{' '}
                  <strong className="text-slate-800">
                    {paginated.startIndex}–{paginated.endIndex}
                  </strong>{' '}
                  of{' '}
                  <strong className="text-slate-800">
                    {paginated.totalItems}
                  </strong>
                </span>
              </div>

              <nav
                aria-label="SOP table pagination"
                className="flex items-center justify-between sm:justify-end gap-1.5"
              >
                <button
                  type="button"
                  disabled={paginated.currentPage <= 1}
                  onClick={() =>
                    setCurrentPage((p) => Math.max(1, p - 1))
                  }
                  aria-label="Previous page"
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#97144D] hover:text-[#97144D] disabled:opacity-45 disabled:hover:border-slate-300 disabled:hover:text-slate-700 transition-colors whitespace-nowrap"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: paginated.totalPages },
                    (_, i) => i + 1
                  ).map((pageNum) => {
                    const isActive = pageNum === paginated.currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`Page ${pageNum}`}
                        className={`min-w-[30px] rounded-md border px-2 py-1 text-xs font-bold tabular-nums transition-colors ${
                          isActive
                            ? 'border-[#97144D] bg-[#97144D] text-white shadow-xs'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-[#97144D] hover:text-[#97144D]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={paginated.currentPage >= paginated.totalPages}
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(paginated.totalPages, p + 1)
                    )
                  }
                  aria-label="Next page"
                  className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#97144D] hover:text-[#97144D] disabled:opacity-45 disabled:hover:border-slate-300 disabled:hover:text-slate-700 transition-colors whitespace-nowrap"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
