import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { supabase } from './services/supabase';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  estaLogueado = false;
  emailUsuario = '';
  nombreUsuario = '';

  private authSubscription: any;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.obtenerSesion();

    const { data } = supabase.auth.onAuthStateChange(() => {
      setTimeout(async () => {
        await this.obtenerSesion();
      }, 0);
    });

    this.authSubscription = data.subscription;
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async obtenerSesion() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session || !data.session.user) {
      this.limpiarSesion();
      this.cdr.detectChanges();
      return;
    }

    this.estaLogueado = true;
    this.emailUsuario = data.session.user.email || '';

    await this.obtenerNombreUsuario(data.session.user.id, this.emailUsuario);

    this.cdr.detectChanges();
  }

  async obtenerNombreUsuario(idUsuario: string, email: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('nombre')
      .eq('id', idUsuario)
      .maybeSingle();

    if (!error && data && data.nombre) {
      this.nombreUsuario = data.nombre;
      return;
    }

    this.nombreUsuario = this.obtenerNombreRapido(email);
  }

  obtenerNombreRapido(email: string) {
    if (email === 'jugador1@test.com') {
      return 'Jugador 1';
    }

    if (email === 'jugador2@test.com') {
      return 'Jugador 2';
    }

    if (email === 'jugador3@test.com') {
      return 'Jugador 3';
    }

    return email;
  }

  async cerrarSesion() {
    this.limpiarSesion();
    this.cdr.detectChanges();

    await supabase.auth.signOut();

    this.borrarSesionLocalSupabase();

    window.location.href = '/';
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  borrarSesionLocalSupabase() {
    const clavesParaBorrar: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);

      if (clave && clave.startsWith('sb-')) {
        clavesParaBorrar.push(clave);
      }
    }

    for (let i = 0; i < clavesParaBorrar.length; i++) {
      localStorage.removeItem(clavesParaBorrar[i]);
    }
  }

  limpiarSesion() {
    this.estaLogueado = false;
    this.emailUsuario = '';
    this.nombreUsuario = '';
  }
}