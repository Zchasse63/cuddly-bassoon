/**
 * Bento Grid Types
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 */

import type { PropertyWithDetails } from '@/lib/properties/types';

export interface BentoCellProps {
  property: PropertyWithDetails;
  className?: string;
  isExpanded?: boolean;
  onExpand?: () => void;
}

export interface HeroCellProps extends BentoCellProps {
  images?: string[];
  showStreetView?: boolean;
  onStreetViewToggle?: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StatsCellProps extends BentoCellProps {}

export interface ValueCellProps extends BentoCellProps {
  arv?: number;
  repairCost?: number;
}

export interface OwnerCellProps extends BentoCellProps {
  onSkipTrace?: () => void;
  isSkipTracing?: boolean;
}

export interface ScoutCellProps extends BentoCellProps {
  autoFetch?: boolean;
}

export interface CompsCellProps extends BentoCellProps {
  comps?: Array<{
    id: string;
    address: string;
    price: number;
    sqft: number;
    distance: number;
  }>;
}

export interface ActionsCellProps extends BentoCellProps {
  onCall?: () => void;
  onSkipTrace?: () => void;
  onCreateDeal?: () => void;
  onGenerateOffer?: () => void;
  isLoading?: boolean;
}
