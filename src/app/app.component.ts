import { Component, inject, signal } from '@angular/core';
import { FormsModule, type NgForm } from '@angular/forms';
import { FirebaseError } from 'firebase/app';
import { FirebaseAuthService } from './services/firebase-auth.service';
import {
  IonApp,
  IonRouterOutlet,
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [
    FormsModule,
    IonApp,
    IonRouterOutlet,
    IonButton,
    IonContent,
    IonHeader,
    IonInput,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class AppComponent {
  readonly auth = inject(FirebaseAuthService);
  readonly busy = signal(false);
  readonly errorMessage = signal('');
  registering = false;
  email = '';
  password = '';
  toggleMode(): void {
    this.registering = !this.registering;
    this.errorMessage.set('');
    this.password = '';
  }

  async submit(form: NgForm): Promise<void> {
    const email = this.email.trim();
    if (form.invalid || !email) {
      return;
    }

    await this.run(() =>
      this.registering
        ? this.auth.register(email, this.password)
        : this.auth.login(email, this.password),
    );
  }

  private async run(action: () => Promise<void>): Promise<void> {
    if (this.busy()) {
      return;
    }

    this.errorMessage.set('');
    this.busy.set(true);
    try {
      await action();
      this.password = '';
      this.registering = false;
    } catch (error) {
      this.errorMessage.set(this.messageFor(error));
    } finally {
      this.busy.set(false);
    }
  }

  private messageFor(error: unknown): string {
    const code = error instanceof FirebaseError ? error.code : '';
    switch (code) {
      case 'auth/invalid-email':
        return 'Zadejte platnou e-mailovou adresu.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Zkontrolujte e-mail a heslo.';
      case 'auth/email-already-in-use':
        return 'Účet se nepodařilo vytvořit. Pokud ho už máte, přihlaste se.';
      case 'auth/weak-password':
      case 'auth/password-does-not-meet-requirements':
        return 'Zvolte heslo podle požadavků projektu.';
      case 'auth/network-request-failed':
        return 'Zkontrolujte připojení k internetu a zkuste to znovu.';
      default:
        return 'Akci se nepodařilo dokončit.';
    }
  }
  constructor() {}
}
