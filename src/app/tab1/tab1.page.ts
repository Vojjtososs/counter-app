import { Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar, ToastController } from '@ionic/angular';
import { CounterComponent } from '../components/counter/counter.component';
import { SavedCounter } from '../models/saved-counter';
import { FirebaseCounterService } from '../services/firebase-counter.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [CounterComponent, IonContent, IonHeader, IonTitle, IonToolbar],
})
export class Tab1Page {
  private readonly toastCtrl = inject(ToastController);
  private readonly counterService = inject(FirebaseCounterService);

  async onSaved(counter: SavedCounter): Promise<void> {

    await this.counterService.add(counter);
    
    const toast = await this.toastCtrl.create({
      message: 'Počítadlo bylo úspěšně uloženo!',
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    await toast.present();
  }
}