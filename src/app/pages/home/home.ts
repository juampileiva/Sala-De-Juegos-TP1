import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { supabase } from '../../services/supabase';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  estaLogueado = false;
  emailUsuario = '';
  nombreUsuario = '';

  private authSubscription: any;

  juegos = [
    {
      nombre: 'Ahorcado',
      descripcion: 'Descubrí la palabra oculta seleccionando letras.',
      ruta: '/ahorcado',
      inicial: 'A'
    },
    {
      nombre: 'Mayor o menor',
      descripcion: 'Adiviná si la próxima carta será mayor o menor.',
      ruta: '/mayor-menor',
      inicial: 'M'
    },
    {
      nombre: 'Preguntados',
      descripcion: 'Respondé preguntas y poné a prueba tus conocimientos.',
      ruta: '/preguntados',
      inicial: 'P'
    },
    {
      nombre: 'No explotes',
      descripcion: 'Juego propio de riesgo: sumá puntos sin explotar.',
      ruta: '/no-explotes',
      inicial: 'N'
    }
  ];

  listados = [
    {
      nombre: 'Resultados',
      descripcion: 'Consultá los puntajes y partidas guardadas.',
      ruta: '/resultados'
    },
    {
      nombre: 'Chat',
      descripcion: 'Sala común para usuarios registrados.',
      ruta: '/chat'
    }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.obtenerSesion();

    const { data } = supabase.auth.onAuthStateChange(async () => {
      await this.obtenerSesion();
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

  limpiarSesion() {
    this.estaLogueado = false;
    this.emailUsuario = '';
    this.nombreUsuario = '';
  }
}