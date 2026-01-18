import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Config,
  Transformation,
  Stock,
  Price,
  Run,
  HistoryEntry,
  TransformationHistoryEntry,
} from '../types';

// Configuration
export const getConfig = async (): Promise<Config | null> => {
  const docRef = doc(db, 'configs', 'default');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as Config) : null;
};

export const getTransformations = async (): Promise<Transformation[]> => {
  const collectionRef = collection(db, 'configs', 'default', 'transformations');
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Transformation));
};

export const getTransformation = async (id: string): Promise<Transformation | null> => {
  const docRef = doc(db, 'configs', 'default', 'transformations', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Transformation) : null;
};

// User data - Stocks
export const getStocks = async (uid: string): Promise<Stock[]> => {
  const collectionRef = collection(db, 'users', uid, 'stocks');
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map((doc) => ({ ...doc.data() } as Stock));
};

export const subscribeToStocks = (uid: string, callback: (stocks: Stock[]) => void) => {
  const collectionRef = collection(db, 'users', uid, 'stocks');
  return onSnapshot(collectionRef, (snapshot) => {
    const stocks = snapshot.docs.map((doc) => ({ ...doc.data() } as Stock));
    callback(stocks);
  });
};

export const updateStock = async (uid: string, crateId: string, quantity: number, label: string) => {
  const docRef = doc(db, 'users', uid, 'stocks', crateId);
  await setDoc(docRef, {
    crateId,
    label,
    quantity,
    updatedAt: serverTimestamp(),
  });
};

// User data - Prices
export const getPrices = async (uid: string): Promise<Price[]> => {
  const collectionRef = collection(db, 'users', uid, 'prices');
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map((doc) => ({ ...doc.data() } as Price));
};

export const subscribeToPrices = (uid: string, callback: (prices: Price[]) => void) => {
  const collectionRef = collection(db, 'users', uid, 'prices');
  return onSnapshot(collectionRef, (snapshot) => {
    const prices = snapshot.docs.map((doc) => ({ ...doc.data() } as Price));
    callback(prices);
  });
};

export const addPrice = async (uid: string, crateId: string, price: number) => {
  const docRef = doc(db, 'users', uid, 'prices', crateId);
  const docSnap = await getDoc(docRef);

  const currentValues = docSnap.exists() ? (docSnap.data() as Price).values : [];

  await setDoc(docRef, {
    crateId,
    values: [...currentValues, price],
    updatedAt: serverTimestamp(),
  });
};

export const deletePrice = async (uid: string, crateId: string, index: number) => {
  const docRef = doc(db, 'users', uid, 'prices', crateId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const currentValues = (docSnap.data() as Price).values;
  const newValues = currentValues.filter((_, i) => i !== index);

  if (newValues.length === 0) {
    await deleteDoc(docRef);
  } else {
    await updateDoc(docRef, {
      values: newValues,
      updatedAt: serverTimestamp(),
    });
  }
};

// User data - Runs
export const getRuns = async (uid: string): Promise<Run[]> => {
  const collectionRef = collection(db, 'users', uid, 'runs');
  const q = query(collectionRef, orderBy('startedAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Run));
};

export const subscribeToRuns = (uid: string, callback: (runs: Run[]) => void) => {
  const collectionRef = collection(db, 'users', uid, 'runs');
  const q = query(collectionRef, orderBy('startedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const runs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Run));
    callback(runs);
  });
};

export const createRun = async (
  uid: string,
  transformationId: string,
  inputQuantityUsed: number,
  durationHours: number
) => {
  const collectionRef = collection(db, 'users', uid, 'runs');
  const now = Timestamp.now();
  const endsAt = Timestamp.fromMillis(
    now.toMillis() + durationHours * 60 * 60 * 1000
  );

  const runData: Omit<Run, 'id'> = {
    transformationId,
    inputQuantityUsed,
    startedAt: now,
    durationHours,
    reducedByAction: false,
    endsAt,
    status: 'RUNNING',
    createdAt: serverTimestamp() as Timestamp,
  };

  const docRef = await setDoc(doc(collectionRef), runData);
  return docRef;
};

export const updateRunStatus = async (uid: string, runId: string, status: Run['status']) => {
  const docRef = doc(db, 'users', uid, 'runs', runId);
  await updateDoc(docRef, { status });
};

export const waterRun = async (uid: string, runId: string, timeReductionHours: number = 1) => {
  const docRef = doc(db, 'users', uid, 'runs', runId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return;

  const run = docSnap.data() as Run;

  // Ne pas arroser si déjà arrosé
  if (run.reducedByAction) return;

  // Réduire le temps de fin de 1h
  const newEndsAt = Timestamp.fromMillis(
    run.endsAt.toMillis() - timeReductionHours * 60 * 60 * 1000
  );

  await updateDoc(docRef, {
    reducedByAction: true,
    endsAt: newEndsAt,
  });
};

export const deleteRun = async (uid: string, runId: string) => {
  const docRef = doc(db, 'users', uid, 'runs', runId);
  await deleteDoc(docRef);
};

// User data - History
export const getHistory = async (uid: string): Promise<HistoryEntry[]> => {
  const collectionRef = collection(db, 'users', uid, 'history');
  const q = query(collectionRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HistoryEntry));
};

export const subscribeToHistory = (uid: string, callback: (history: HistoryEntry[]) => void) => {
  const collectionRef = collection(db, 'users', uid, 'history');
  const q = query(collectionRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const history = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as HistoryEntry));
    callback(history);
  });
};

export const addHistoryEntry = async (
  uid: string,
  transformationId: string,
  startedAt: Timestamp,
  endsAt: Timestamp,
  reducedByAction: boolean
) => {
  const collectionRef = collection(db, 'users', uid, 'history');

  const entryData: Omit<TransformationHistoryEntry, 'id'> = {
    type: 'TRANSFORMATION',
    transformationId,
    startedAt,
    endsAt,
    reducedByAction,
    createdAt: serverTimestamp() as Timestamp,
  };

  await setDoc(doc(collectionRef), entryData);
};

export const addSaleHistoryEntry = async (
  uid: string,
  crateId: string,
  crateLabel: string,
  quantitySold: number,
  estimatedValue: number,
  actualValue: number,
  notes?: string
) => {
  const collectionRef = collection(db, 'users', uid, 'history');

  const entryData: any = {
    type: 'SALE',
    crateId,
    crateLabel,
    quantitySold,
    estimatedValue,
    actualValue,
    createdAt: serverTimestamp(),
  };

  // N'ajouter notes que s'il est défini
  if (notes) {
    entryData.notes = notes;
  }

  await setDoc(doc(collectionRef), entryData);
};
