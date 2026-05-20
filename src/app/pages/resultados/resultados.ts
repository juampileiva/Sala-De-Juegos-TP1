import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { supabase } from '../../services/supabase';

interface ResultadoJuego {
  id: number;
  nombre: string;
  email: string;
  juego: string;
  resultado: string;
  puntaje: number;
  tiempo_segundos: number;
  creado_en: string;
}

@Component({
  selector: 'app-resultados',
  imports: [CommonModule, RouterLink],
  templateUrl: './resultados.html',
  styleUrl: './resultados.css'
})
export class Resultados implements OnInit {
  resultados: ResultadoJuego[] = [];
  cargando = true;
  error = '';

  juegos = ['Ahorcado', 'Mayor o Menor', 'Preguntados', 'No explotes'];

  async ngOnInit() {
    await this.cargarResultados();
  }

  async cargarResultados() {
    this.cargando = true;
    this.error = '';

    const { data, error } = await supabase
      .from('resultados_juegos')
      .select('*')
      .order('puntaje', { ascending: false })
      .order('tiempo_segundos', { ascending: true })
      .limit(200);

    if (error) {
      this.error = 'No se pudieron cargar los resultados.';
      this.cargando = false;
      return;
    }

    this.resultados = data || [];
    this.cargando = false;
  }

  obtenerResultadosPorJuego(juego: string) {
    const lista: ResultadoJuego[] = [];

    for (let i = 0; i < this.resultados.length; i++) {
      if (this.resultados[i].juego === juego) {
        lista.push(this.resultados[i]);
      }
    }

    return lista;
  }

  formatearFecha(fecha: string) {
    const fechaResultado = new Date(fecha);

    return fechaResultado.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}