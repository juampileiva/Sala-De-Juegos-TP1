import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResultadosService } from '../../services/resultados.service';

interface Carta {
  valor: number;
  nombre: string;
  palo: string;
}

@Component({
  selector: 'app-mayor-menor',
  imports: [CommonModule, RouterLink],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css'
})
export class MayorMenor implements OnInit {
  cartaActual!: Carta;
  cartaSiguiente!: Carta;

  puntaje = 0;
  rondas = 0;
  maxRondas = 8;
  juegoTerminado = false;
  gano = false;
  mensaje = '';
  tiempoInicio = 0;
  resultadoGuardado = false;

  ngOnInit() {
    this.iniciarJuego();
  }

  constructor(private resultadosService: ResultadosService) {}

  iniciarJuego() {
    this.cartaActual = this.generarCarta();
    this.cartaSiguiente = this.generarCarta();
    this.puntaje = 0;
    this.rondas = 0;
    this.juegoTerminado = false;
    this.gano = false;
    this.mensaje = '';
    this.tiempoInicio = Date.now();
    this.resultadoGuardado = false;
  }

  generarCarta(): Carta {
    const valor = Math.floor(Math.random() * 13) + 1;
    const palos = ['♥', '♦', '♣', '♠'];
    const palo = palos[Math.floor(Math.random() * palos.length)];

    let nombre = valor.toString();

    if (valor === 1) {
      nombre = 'A';
    } else if (valor === 11) {
      nombre = 'J';
    } else if (valor === 12) {
      nombre = 'Q';
    } else if (valor === 13) {
      nombre = 'K';
    }

    return {
      valor: valor,
      nombre: nombre,
      palo: palo
    };
  }

  elegir(opcion: string) {
    if (this.juegoTerminado) {
      return;
    }

    this.rondas++;

    let acerto = false;

    if (opcion === 'mayor' && this.cartaSiguiente.valor > this.cartaActual.valor) {
      acerto = true;
    }

    if (opcion === 'menor' && this.cartaSiguiente.valor < this.cartaActual.valor) {
      acerto = true;
    }

    if (this.cartaSiguiente.valor === this.cartaActual.valor) {
      acerto = true;
    }

    if (acerto) {
      this.puntaje += 10;
      this.mensaje = 'Acertaste. La carta era ' + this.cartaSiguiente.nombre + ' ' + this.cartaSiguiente.palo + '.';
    } else {
      this.mensaje = 'Fallaste. La carta era ' + this.cartaSiguiente.nombre + ' ' + this.cartaSiguiente.palo + '.';
    }

    this.cartaActual = this.cartaSiguiente;
    this.cartaSiguiente = this.generarCarta();

    if (this.rondas >= this.maxRondas) {
      this.finalizarJuego();
    }
  }

  finalizarJuego() {
    this.juegoTerminado = true;
    this.gano = this.puntaje >= 50;

    if (this.gano) {
      this.mensaje = '¡Ganaste! Terminaste con ' + this.puntaje + ' puntos.';
    } else {
      this.mensaje = 'Perdiste. Terminaste con ' + this.puntaje + ' puntos.';
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
      'Mayor o Menor',
      resultado,
      this.puntaje,
      tiempoSegundos,
      {
        rondas: this.rondas,
        maxRondas: this.maxRondas
      }
    );
  }
}