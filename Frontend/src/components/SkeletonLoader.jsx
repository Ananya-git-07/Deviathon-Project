import React from 'react';
const SkeletonLoader = ({ className }) => (
<div className={`bg-slate-200 rounded-md animate-pulse ${className}`} />
);
export default SkeletonLoader;