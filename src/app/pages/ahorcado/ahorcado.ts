import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResultadosService } from '../../services/resultados.service';

interface PalabraJuego {
  palabra: string;
  pista: string;
}

@Component({
  selector: 'app-ahorcado',
  imports: [CommonModule, RouterLink],
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css'
})
export class Ahorcado implements OnInit {
  palabras: PalabraJuego[] = [
    { palabra: 'ANGULAR', pista: 'Framework usado en este TP.' },
    { palabra: 'SUPABASE', pista: 'Base de datos y autenticación del proyecto.' },
    { palabra: 'TYPESCRIPT', pista: 'Lenguaje usado junto con Angular.' },
    { palabra: 'COMPONENTE', pista: 'Parte visual y lógica de Angular.' },
    { palabra: 'GUARD', pista: 'Protege rutas privadas.' },
    { palabra: 'JUEGO', pista: 'Actividad principal de esta sala.' }
  ];

  palabraActual = '';
  pistaActual = '';
  letrasUsadas: string[] = [];
  errores = 0;
  maxErrores = 6;
  juegoTerminado = false;
  gano = false;
  mensaje = '';
  tiempoInicio = 0;
  resultadoGuardado = false;

  letras = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G',
    'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z'
  ];

  constructor(private resultadosService: ResultadosService) {}

  ngOnInit() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    const indice = Math.floor(Math.random() * this.palabras.length);
    this.palabraActual = this.palabras[indice].palabra;
    this.pistaActual = this.palabras[indice].pista;
    this.letrasUsadas = [];
    this.errores = 0;
    this.juegoTerminado = false;
    this.gano = false;
    this.mensaje = '';
    this.tiempoInicio = Date.now();
    this.resultadoGuardado = false;
  }

  elegirLetra(letra: string) {
    if (this.juegoTerminado || this.letraYaUsada(letra)) {
      return;
    }

    this.letrasUsadas.push(letra);

    if (!this.palabraActual.includes(letra)) {
      this.errores++;
    }

    this.verificarEstado();
  }

  letraYaUsada(letra: string) {
    for (let i = 0; i < this.letrasUsadas.length; i++) {
      if (this.letrasUsadas[i] === letra) {
        return true;
      }
    }

    return false;
  }

  obtenerPalabraVisible() {
    let texto = '';

    for (let i = 0; i < this.palabraActual.length; i++) {
      const letra = this.palabraActual[i];

      if (this.letraYaUsada(letra)) {
        texto += letra + ' ';
      } else {
        texto += '_ ';
      }
    }

    return texto;
  }

  verificarEstado() {
    let todasAdivinadas = true;

    for (let i = 0; i < this.palabraActual.length; i++) {
      if (!this.letraYaUsada(this.palabraActual[i])) {
        todasAdivinadas = false;
      }
    }

    if (todasAdivinadas) {
      this.gano = true;
      this.juegoTerminado = true;
      this.mensaje = '¡Ganaste! Adivinaste la palabra.';
      this.guardarResultado();
      return;
    }

    if (this.errores >= this.maxErrores) {
      this.gano = false;
      this.juegoTerminado = true;
      this.mensaje = 'Perdiste. La palabra era ' + this.palabraActual + '.';
      this.guardarResultado();
    }
  }

  obtenerIntentosRestantes() {
    return this.maxErrores - this.errores;
  }

  obtenerPuntaje() {
    if (!this.gano) {
      return 0;
    }

    return 100 - this.errores * 10;
  }

  async guardarResultado() {
    if (this.resultadoGuardado) {
      return;
    }

    this.resultadoGuardado = true;

    const tiempoSegundos = Math.floor((Date.now() - this.tiempoInicio) / 1000);
    const resultado = this.gano ? 'Victoria' : 'Derrota';

    await this.resultadosService.guardarResultado(
      'Ahorcado',
      resultado,
      this.obtenerPuntaje(),
      tiempoSegundos,
      {
        palabra: this.palabraActual,
        errores: this.errores,
        letrasUsadas: this.letrasUsadas
      }
    );
  }
}