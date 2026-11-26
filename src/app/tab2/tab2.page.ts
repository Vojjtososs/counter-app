import { Component, inject, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import {
  AlertController,
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { FirebaseCounterService } from '../services/firebase-counter.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page {
  private readonly alertCtrl = inject(AlertController);
  private readonly toastCtrl = inject(ToastController);
  readonly auth = inject(FirebaseAuthService);
  readonly counterService = inject(FirebaseCounterService);
  readonly signingOut = signal(false);
  readonly logoutError = signal('');

  async logout(): Promise<void> {
    if (this.signingOut()) {
      return;
    }

    this.logoutError.set('');
    this.signingOut.set(true);
    try {
      await this.auth.logout();
    } catch {
      this.logoutError.set('Odhlášení se nezdařilo. Zkuste to znovu.');
    } finally {
      this.signingOut.set(false);
    }
  }

  // Signály pro vyhledávání a řazení
  searchQuery = signal('');
  sortType = signal<'name' | 'value'>('name');

  // Vypočítaný signál pro zobrazení (řeší hledání i řazení)
  displayCounters = computed(() => {
    let list = this.counterService.counters();
    const query = this.searchQuery().toLowerCase();

    if (query) {
      list = list.filter((c) => c.name.toLowerCase().includes(query));
    }

    // Vytvoříme kopii pole [...list], abychom nemutovali původní data
    return [...list].sort((a, b) => {
      if (this.sortType() === 'name') return a.name.localeCompare(b.name);
      return b.value - a.value; // Sestupně podle hodnoty
    });
  });

  // Vypočítaný součet všech hodnot
  totalSum = computed(() => {
    return this.counterService
      .counters()
      .reduce((sum, current) => sum + current.value, 0);
  });

  minMaxValues = computed(() => {
    const list = this.counterService.counters();
    if (list.length === 0) {
      return { min: 0, max: 0 };
    }

    const values = list.map((c) => c.value);

    return {
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  /* async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    
    // Zobrazení toastu po smazání
    const toast = await this.toastCtrl.create({
      message: 'Počítadlo bylo smazáno.',
      duration: 2000,
      color: 'dark'
    });
    await toast.present();
  }

  async clear(): Promise<void> {
    // Zobrazení potvrzovacího alertu před smazáním
    const alert = await this.alertCtrl.create({
      header: 'Vymazat historii?',
      message: 'Opravdu chcete smazat všechna uložená počítadla? Tento krok nelze vrátit.',
      buttons: [
        { text: 'Zrušit', role: 'cancel' },
        { 
          text: 'Vymazat', 
          role: 'destructive',
          handler: async () => {
            await this.counterService.clear();
            const toast = await this.toastCtrl.create({
              message: 'Historie byla vymazána.',
              duration: 2000,
              color: 'danger'
            });
            await toast.present();
          }
        }
      ]
    });
    await alert.present();
  }*/
}
