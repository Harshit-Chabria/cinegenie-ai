import React from 'react';

export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/10 rounded-md ${className}`} />
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`p-4 bg-[#1a1a2e]/50 border border-white/5 rounded-xl ${className}`}>
    <Skeleton className="h-6 w-3/4 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

export const SkeletonTable = ({ rows = 5, className = '' }) => (
  <div className={`w-full ${className}`}>
    <div className="flex gap-4 mb-4 pb-4 border-b border-white/5">
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/4" />
      <Skeleton className="h-5 w-1/4" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 mb-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))}
  </div>
);
