
import { SKU, Brand } from './types';

export const VAT_CONFIG = {
  'Germany (DE)': {
    Reduced: 0.07,
    Standard: 0.19,
    deferredAvailable: true
  },
  'France (FR)': {
    Reduced: 0.055,
    Standard: 0.20,
    deferredAvailable: true
  }
};

export const SKUS: SKU[] = [
  { id: 1, category: 'Biryani Range', description: 'Yakhni Pulao', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 2, category: 'Biryani Range', description: 'Bombay Biryani', packSize: '130 g', cost: 0.6948, vatType: 'Reduced' },
  { id: 3, category: 'Biryani Range', description: 'Sindhi Biryani', packSize: '120 g', cost: 0.6867, vatType: 'Reduced' },
  { id: 4, category: 'Biryani Range', description: 'Biryani Masala', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 5, category: 'Biryani Range', description: 'Pulao Biryani', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 6, category: 'BBQ Range', description: 'Tikka Boti', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 7, category: 'BBQ Range', description: 'Tandoori Masala', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 8, category: 'BKF Range', description: 'Nihari Masala', packSize: '120 g', cost: 0.6867, vatType: 'Reduced' },
  { id: 9, category: 'Biryani Range', description: 'Hyderabadi Biryani', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 10, category: 'Biryani Range', description: 'Fish Biryani', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 11, category: 'BBQ Range', description: 'Seekh Kabab Masala', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 12, category: 'BBQ Range', description: 'Bihari Kabab Masala', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 13, category: 'BBQ Range', description: 'Shami Kabab Masala', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 14, category: 'BBQ Range', description: 'Chapli Kabab Masala', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 15, category: 'Curry Range', description: 'Quorma Masala', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 16, category: 'Curry Range', description: 'Karahi Masala', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 17, category: 'Curry Range', description: 'Achar Gosht Masala', packSize: '100 g', cost: 0.6706, vatType: 'Reduced' },
  { id: 18, category: 'BKF Range', description: 'Haleem Mix', packSize: '150 g', cost: 0.8500, vatType: 'Reduced' },
  { id: 19, category: 'Basic Spices', description: 'Red Chilli Powder', packSize: '100 g', cost: 0.55, vatType: 'Reduced' },
  { id: 20, category: 'Basic Spices', description: 'Turmeric Powder', packSize: '100 g', cost: 0.48, vatType: 'Reduced' },
  { id: 21, category: 'GGP (Pastes)', description: 'Ginger Paste', packSize: '750 g', cost: 2.13, vatType: 'Reduced' },
  { id: 22, category: 'GGP (Pastes)', description: 'Garlic Paste', packSize: '750 g', cost: 1.95, vatType: 'Reduced' },
  { id: 23, category: 'GGP (Pastes)', description: 'Ginger Garlic Paste', packSize: '750 g', cost: 2.05, vatType: 'Reduced' },
  { id: 24, category: 'Salt & Onion', description: 'Red Fried Onion', packSize: '1000 g', cost: 2.55, vatType: 'Reduced' },
  { id: 25, category: 'Salt & Onion', description: 'Himalayan Pink Salt', packSize: '800 g', cost: 1.25, vatType: 'Reduced' },
];

export const BRAND_CONFIG = {
  [Brand.LAZIZA]: { color: '#16A34A', label: 'ANCHOR', tooltip: 'Primary pricing anchor' },
  [Brand.MDH]: { color: '#F59E0B', label: 'FALLBACK', tooltip: 'Fallback anchor due to insufficient Laziza data' },
  [Brand.TRS]: { color: '#64748B', label: 'CONTEXT', tooltip: 'Market context only' },
  [Brand.SHAN]: { color: '#64748B', label: 'CONTEXT', tooltip: 'Market context only' },
  [Brand.NATIONAL]: { color: '#64748B', label: 'CONTEXT', tooltip: 'Market context only' },
  [Brand.ALIBABA]: { color: '#64748B', label: 'CONTEXT', tooltip: 'Market context only' },
  [Brand.EVEREST]: { color: '#64748B', label: 'CONTEXT', tooltip: 'Market context only' },
};
