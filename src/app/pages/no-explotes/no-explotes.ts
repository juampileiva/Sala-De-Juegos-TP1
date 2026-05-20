import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResultadosService } from '../../services/resultados.service';

@Component({
  selector: 'app-no-explotes',
  imports: [CommonModule, RouterLink],
  templateUrl: './no-explotes.html',
  styleUrl: './no-explotes.css'
})
export class NoExplotes {
  puntaje = 0;
  ronda = 1;
  maxRondas = 10;
  probabilidadExplosion = 20;

  juegoTerminado = false;
  gano = false;
  exploto = false;
  mensaje = 'Elegí si querés sumar puntos o plantarte antes de explotar.';

  tiempoInicio = Date.now();
  resultadoGuardado = false;

  constructor(private resultadosService: ResultadosService) {}

  iniciarJuego() {
    this.puntaje = 0;
    this.ronda = 1;
    this.probabilidadExplosion = 20;
    this.juegoTerminado = false;
    this.gano = false;
    this.exploto = false;
    this.mensaje = 'Elegí si querés sumar puntos o plantarte antes de explotar.';
    this.tiempoInicio = Date.now();
    this.resultadoGuardado = false;
  }

  arriesgar() {
    if (this.juegoTerminado) {
      return;
    }

    const numero = Math.floor(Math.random() * 100) + 1;

    if (numero <= this.probabilidadExplosion) {
      this.exploto = true;
      this.gano = false;
      this.juegoTerminado = true;
      this.puntaje = 0;
      this.mensaje = 'Explotaste. Perdiste todos los puntos.';
      this.guardarResultado();
      return;
    }

    const puntosGanados = 10 + this.ronda * 3;
    this.puntaje += puntosGanados;
    this.mensaje = 'Sumaste ' + puntosGanados + ' puntos. Ahora podés seguir o plantarte.';

    if (this.ronda >= this.maxRondas) {
      this.gano = true;
      this.juegoTerminado = true;
      this.mensaje = '¡Ganaste! Llegaste al máximo de rondas sin explotar.';
      this.guardarResultado();
      return;
    }

    this.ronda++;
    this.probabilidadExplosion += 6;
  }

  plantarse() {
    if (this.juegoTerminado) {
      return;
    }

    this.gano = this.puntaje >= 40;
    this.juegoTerminado = true;

    if (this.gano) {
      this.mensaje = 'Te plantaste a tiempo y ganaste con ' + this.puntaje + ' puntos.';
    } else {
      this.mensaje = 'Te plantaste, pero necesitabas al menos 40 puntos para ganar.';
    }

    this.guardarResultado();
  }

  async guardarResultado() {
    if (this.resultadoGuardado) {
      return;
    }

    this.resultadoGuardado = true;

    const tiempoSegundos = Math.floor((Date.now() - this.tiempoInicio) / 1000);
    const resultado = this.gano ? 'Victoria' : 'Derrota';

    await this.resultadosService.guardarResultado(
      'No explotes',
      resultado,
      this.puntaje,
      tiempoSegundos,
      {
        ronda: this.ronda,
        probabilidadExplosion: this.probabilidadExplosion,
        exploto: this.exploto
      }
    );
  }
}