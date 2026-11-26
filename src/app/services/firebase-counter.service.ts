import { Injectable, inject, signal, computed, effect } from '@angular/core';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore';
import { firestore } from '../firebase.client';
import { SavedCounter } from '../models/saved-counter';
import { FirebaseAuthService } from './firebase-auth.service';

@Injectable({ providedIn: 'root' })
export class FirebaseCounterService {
  private readonly auth = inject(FirebaseAuthService);
  private readonly countersState = signal<SavedCounter[]>([]);
  private readonly initializedState = signal(false);
  private readonly errorState = signal('');

  readonly initialized = computed(
    () => this.owner() === this.auth.userId() && this.initializedState(),
  );
  readonly counters = computed(() =>
    this.initialized() ? this.countersState() : [],
  );
  readonly errorMessage = computed(() =>
    this.owner() === this.auth.userId() ? this.errorState() : '',
  );

  private readonly owner = signal<string | null>(null);

  constructor() {
    effect((onCleanup) => {
      const uid = this.auth.userId();
      this.owner.set(uid);
      this.countersState.set([]);
      this.initializedState.set(false);
      this.errorState.set('');

      if (uid !== null) {
        const unsubscribe = this.connect(uid);
        if (unsubscribe) {
          onCleanup(unsubscribe);
        }
      }
    });
  }

  private connect(uid: string) {
    try {
      const counters = this.userCounters(uid);
      const countersQuery = query(counters, orderBy('createdAt', 'desc'));

      return onSnapshot(
        countersQuery,
        (snapshot) => {
          const items = snapshot.docs.map(
            (item) => item.data() as SavedCounter,
          );
          this.countersState.set(items);
          this.initializedState.set(true);
        },
        (error) => {
          console.error(error);
          this.errorState.set('Živou historii se nepodařilo načíst.');
          this.initializedState.set(true);
        },
      );
    } catch (error) {
      console.error(error);
      this.errorState.set('Připojení k historii se nezdařilo.');
      this.initializedState.set(true);
      return undefined;
    }
  }

  private userCounters(uid: string) {
    return collection(firestore, 'users', uid, 'counters');
  }

  async add(counter: SavedCounter): Promise<void> {
    const uid = this.auth.userId();
    if (uid === null) {
      return;
    }

    this.errorState.set('');

    try {
      const counters = this.userCounters(uid);
      await setDoc(doc(counters, counter.id), counter);
    } catch (error) {
      console.error(error);
      if (this.auth.userId() === uid) {
        this.errorState.set('Záznam se nepodařilo uložit.');
      }
    }
  }
}
