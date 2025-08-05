'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Pool, PoolInput } from '@/lib/types';

const poolsCollection = collection(db, 'pools');

export async function getPools(): Promise<Pool[]> {
  const snapshot = await getDocs(poolsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pool));
}

export async function getPool(id: string): Promise<Pool | null> {
    const docRef = doc(db, 'pools', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Pool;
    }
    return null;
}

export async function addPool(poolData: PoolInput): Promise<string> {
    const docRef = await addDoc(poolsCollection, poolData);
    return docRef.id;
}

export async function updatePool(id: string, poolData: Partial<PoolInput>): Promise<void> {
    const docRef = doc(db, 'pools', id);
    await updateDoc(docRef, poolData);
}

export async function deletePool(id: string): Promise<void> {
    const docRef = doc(db, 'pools', id);
    await deleteDoc(docRef);
}
