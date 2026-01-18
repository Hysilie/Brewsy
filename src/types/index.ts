import { Timestamp } from 'firebase/firestore';

// Configuration types
export interface ConfigRules {
  timeReductionHours: number;
}

export interface Config {
  name: string;
  rules: ConfigRules;
  updatedAt: Timestamp;
}

export interface TransformationInput {
  materialName: string;
  quantity: number;
}

export interface TransformationTool {
  name: string;
  price: number;
}

export interface TransformationCrate {
  name: string;
  quantityPerCrate: number;
}

export interface Transformation {
  id: string;
  name: string;
  input: TransformationInput;
  tool: TransformationTool;
  durationHours: number;
  crate: TransformationCrate;
}

// User data types
export interface Stock {
  crateId: string;
  label: string;
  quantity: number;
  updatedAt: Timestamp;
}

export interface Price {
  crateId: string;
  values: number[];
  updatedAt: Timestamp;
}

export type RunStatus = 'RUNNING' | 'READY' | 'DONE';

export interface Run {
  id?: string;
  transformationId: string;
  inputQuantityUsed: number;
  startedAt: Timestamp;
  durationHours: number;
  reducedByAction: boolean;
  endsAt: Timestamp;
  status: RunStatus;
  createdAt: Timestamp;
}

export interface TransformationHistoryEntry {
  id?: string;
  type: 'TRANSFORMATION';
  transformationId: string;
  startedAt: Timestamp;
  endsAt: Timestamp;
  reducedByAction: boolean;
  createdAt: Timestamp;
}

export interface SaleHistoryEntry {
  id?: string;
  type: 'SALE';
  crateId: string;
  crateLabel: string;
  quantitySold: number;
  estimatedValue: number;  // Prix moyen × quantité
  actualValue: number;     // Ce qui a vraiment été récolté
  notes?: string;          // Optionnel: pourquoi différence
  createdAt: Timestamp;
}

export type HistoryEntry = TransformationHistoryEntry | SaleHistoryEntry;

// UI types
export interface ProductionCalculation {
  transformation: Transformation;
  numberOfRuns: number;
  materialsNeeded: number;
  toolsRequired: number;
  totalToolCost: number;
  estimatedCrates: number;
}
