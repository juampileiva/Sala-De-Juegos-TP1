import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { supabase } from './services/supabase';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  estaLogueado = false;
  nombreUsuario = '';
  emailUsuario = '';
  menuAbierto = false;
  cerrandoSesion = false;

  authSubscription: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private zone: NgZone
  ) {}

  async ngOnInit() {
    await this.actualizarUsuario();

    const { data } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        this.zone.run(() => {
          this.estaLogueado = false;
          this.nombreUsuario = '';
          this.emailUsuario = '';
          this.menuAbierto = false;
          this.cerrandoSesion = false;
          this.cdr.detectChanges();
        });

        return;
      }

      await this.actualizarUsuario();
    });

    this.authSubscription = data.subscription;
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async actualizarUsuario() {
    const { data } = await supabase.auth.getSession();

    this.zone.run(async () => {
      if (data.session && data.session.user) {
        this.estaLogueado = true;
        this.emailUsuario = data.session.user.email || '';
        this.nombreUsuario = await this.obtenerNombreUsuario(data.session.user.id, this.emailUsuario);
      } else {
        this.estaLogueado = false;
        this.emailUsuario = '';
        this.nombreUsuario = '';
        this.menuAbierto = false;
      }

      this.cdr.detectChanges();
    });
  }

  async obtenerNombreUsuario(idUsuario: string, email: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('nombre')
      .eq('id', idUsuario)
      .maybeSingle();

    if (!error && data && data.nombre) {
      return data.nombre;
    }

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

  toggleMenu() {
    if (this.cerrandoSesion) {
      return;
    }

    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu() {
    this.menuAbierto = false;
  }

  navegar(ruta: string) {
    if (this.cerrandoSesion) {
      return;
    }

    this.menuAbierto = false;
    this.cdr.detectChanges();

    this.router.navigateByUrl(ruta);
  }

  async cerrarSesion(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (this.cerrandoSesion) {
      return;
    }

    this.cerrandoSesion = true;
    this.menuAbierto = false;
    this.estaLogueado = false;
    this.nombreUsuario = '';
    this.emailUsuario = '';

    this.cdr.detectChanges();

    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.log('Error cerrando sesión:', error);
    }

    this.limpiarStorageSupabase();

    this.zone.run(() => {
      this.estaLogueado = false;
      this.nombreUsuario = '';
      this.emailUsuario = '';
      this.menuAbierto = false;
      this.cdr.detectChanges();
    });

    window.location.href = '/';
  }

  limpiarStorageSupabase() {
    const clavesLocalStorage: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);

      if (
        clave &&
        (
          clave.includes('supabase') ||
          clave.includes('sb-') ||
          clave.includes('auth-token')
        )
      ) {
        clavesLocalStorage.push(clave);
      }
    }

    for (let i = 0; i < clavesLocalStorage.length; i++) {
      localStorage.removeItem(clavesLocalStorage[i]);
    }

    const clavesSessionStorage: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const clave = sessionStorage.key(i);

      if (
        clave &&
        (
          clave.includes('supabase') ||
          clave.includes('sb-') ||
          clave.includes('auth-token')
        )
      ) {
        clavesSessionStorage.push(clave);
      }
    }

    for (let i = 0; i < clavesSessionStorage.length; i++) {
      sessionStorage.removeItem(clavesSessionStorage[i]);
    }
  }
}