"use client";

import SEOGuide from '../../../../components/SEOGuide';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function UserSEOGuidePage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading guide…</div>}>
      <SEOGuide />
    </Suspense>
  );
}