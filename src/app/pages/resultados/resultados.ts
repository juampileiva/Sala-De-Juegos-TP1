import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  created_at?: string;
  creado_en?: string;
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

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.cargarResultados();
  }

  async cargarResultados() {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    const { data, error } = await supabase
      .from('resultados_juegos')
      .select('*')
      .order('puntaje', { ascending: false })
      .order('tiempo_segundos', { ascending: true })
      .limit(200);

    if (error) {
      console.log('Error cargando resultados:', error);
      this.error = 'No se pudieron cargar los resultados.';
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.resultados = data || [];
    this.cargando = false;
    this.cdr.detectChanges();
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

  obtenerFechaResultado(resultado: ResultadoJuego) {
    if (resultado.created_at) {
      return resultado.created_at;
    }

    if (resultado.creado_en) {
      return resultado.creado_en;
    }

    return '';
  }

  formatearFecha(resultado: ResultadoJuego) {
    const fechaTexto = this.obtenerFechaResultado(resultado);

    if (!fechaTexto) {
      return 'Sin fecha';
    }

    const fechaResultado = new Date(fechaTexto);

    if (isNaN(fechaResultado.getTime())) {
      return 'Sin fecha';
    }

    return fechaResultado.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}