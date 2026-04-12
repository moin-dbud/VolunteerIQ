'use client';

import dynamic from 'next/dynamic';
import { Issue } from '@/lib/types';
import type L from 'leaflet';

// Dynamic import prevents Leaflet from running during SSR (it requires window)
const LeafletMapComponent = dynamic(() => import('./LeafletMapComponent'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        fontSize: '13px',
      }}
    >
      Loading map...
    </div>
  ),
});

interface Props {
  issues: Issue[];
  onIssueClick?: (issue: Issue) => void;
  flyTo?: [number, number, number] | null;
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  mapRef?: React.MutableRefObject<L.Map | null>;
}

export default function MapWrapper(props: Props) {
  return <LeafletMapComponent {...props} />;
}
