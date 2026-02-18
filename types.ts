
export enum Country {
  DE = 'Germany (DE)',
  FR = 'France (FR)'
}

export enum Brand {
  LAZIZA = 'Laziza',
  MDH = 'MDH',
  TRS = 'TRS',
  SHAN = 'Shan',
  NATIONAL = 'National',
  ALIBABA = 'Ali Baba',
  EVEREST = 'Everest'
}

export enum AnchorStatus {
  ACTIVE = 'ACTIVE',
  FALLBACK = 'FALLBACK',
  UNKNOWN = 'UNKNOWN'
}

export enum GuardrailStatus {
  PASS = 'PASS',
  FAIL = 'FAIL',
  UNKNOWN = 'UNKNOWN'
}

export enum ActorType {
  IMPORTER = 'Importer',
  DISTRIBUTOR = 'Distributor',
  RETAILER = 'Retailer',
  CONSUMER = 'Consumer'
}

export enum TransactionRoute {
  DIRECT_IMPORT = 'Direct Import',
  INTRA_EU = 'Intra-EU Supply',
  DOMESTIC = 'Domestic B2B'
}

export interface SKU {
  id: number;
  category: string;
  description: string;
  packSize: string;
  cost: number;
  vatType: 'Reduced' | 'Standard';
}

export interface MarketPrice {
  id: string;
  brand: Brand;
  productTitle: string;
  shelfPrice: number;
  normalizedPrice: number;
  metric: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  platform: string;
}

export interface PricingState {
  brandMargin: number;
  distributorMargin: number;
  retailerMargin: number;
  vatRate: number;
  isVatDeferred: boolean;
  isVatIncluded: boolean;
  customerType: 'B2B' | 'DTC';
  route: TransactionRoute;
  vatReturnCycle: number; // days
}

export interface VATStage {
  stage: string;
  actor: string;
  netPrice: number;
  vatRate: number;
  vatCollected: number;
  vatReclaimed: number;
  cashImpact: number;
  notes: string;
}

export interface AnchorBand {
  brand: Brand;
  median: number;
  lower: number;
  upper: number;
  status: AnchorStatus;
}

export interface AgentLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}
