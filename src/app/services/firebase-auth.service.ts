import {
  Injectable,
  signal,
  DestroyRef,
  computed,
  inject,
} from '@angular/core';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { firebaseAuth } from '../firebase.client';

@Injectable({ providedIn: 'root' })
export class FirebaseAuthService {
  private readonly userState = signal<User | null>(null);
  private readonly readyState = signal(false);

  readonly user = this.userState.asReadonly();
  readonly ready = this.readyState.asReadonly();
  readonly userId = computed(() => this.user()?.uid ?? null);

  constructor() {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      this.userState.set(user?.isAnonymous ? null : user);
      this.readyState.set(true);
    });
    inject(DestroyRef).onDestroy(unsubscribe);
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(firebaseAuth, email, password);
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
  }
}
