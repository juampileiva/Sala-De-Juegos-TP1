import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResultadosService } from '../../services/resultados.service';

interface PaisApi {
  name: {
    common: string;
  };
  translations?: {
    spa?: {
      common: string;
    };
  };
  capital?: string[];
  region?: string;
}

interface PreguntaJuego {
  pregunta: string;
  respuestaCorrecta: string;
  opciones: string[];
}

@Component({
  selector: 'app-preguntados',
  imports: [CommonModule, RouterLink],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css'
})
export class Preguntados implements OnInit {
  cargando = true;
  error = '';

  paises: PaisApi[] = [];
  preguntas: PreguntaJuego[] = [];

  indicePregunta = 0;
  puntaje = 0;
  aciertos = 0;
  errores = 0;

  opcionElegida = '';
  respondio = false;
  juegoTerminado = false;
  gano = false;
  mensaje = '';

  tiempoInicio = 0;
  resultadoGuardado = false;

  constructor(
    private resultadosService: ResultadosService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    await this.iniciarJuego();
  }

  async iniciarJuego() {
    this.cargando = true;
    this.error = '';
    this.preguntas = [];
    this.indicePregunta = 0;
    this.puntaje = 0;
    this.aciertos = 0;
    this.errores = 0;
    this.opcionElegida = '';
    this.respondio = false;
    this.juegoTerminado = false;
    this.gano = false;
    this.mensaje = '';
    this.tiempoInicio = Date.now();
    this.resultadoGuardado = false;
    this.cdr.detectChanges();

    try {
      const respuesta = await fetch(
        'https://restcountries.com/v3.1/all?fields=name,translations,capital,region'
      );

      if (!respuesta.ok) {
        throw new Error('No se pudo obtener información de la API.');
      }

      const data = await respuesta.json();
      this.paises = this.filtrarPaisesValidos(data);
      this.preguntas = this.crearPreguntas();

      if (this.preguntas.length === 0) {
        this.error = 'No se pudieron crear preguntas con los datos recibidos.';
      }
    } catch (error) {
      console.log(error);
      this.error = 'No se pudo cargar Preguntados. Revisá la conexión o intentá de nuevo.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  filtrarPaisesValidos(data: PaisApi[]) {
    const paisesValidos: PaisApi[] = [];

    for (let i = 0; i < data.length; i++) {
      const pais = data[i];

      if (
        pais &&
        pais.capital &&
        pais.capital.length > 0 &&
        pais.capital[0] &&
        pais.name &&
        pais.name.common
      ) {
        paisesValidos.push(pais);
      }
    }

    return paisesValidos;
  }

  crearPreguntas() {
    const preguntasCreadas: PreguntaJuego[] = [];
    const paisesUsados: string[] = [];

    while (preguntasCreadas.length < 10 && paisesUsados.length < this.paises.length) {
      const paisCorrecto = this.obtenerPaisAleatorio();

      if (!paisCorrecto) {
        break;
      }

      const nombrePais = this.obtenerNombrePais(paisCorrecto);

      if (this.estaUsado(nombrePais, paisesUsados)) {
        continue;
      }

      paisesUsados.push(nombrePais);

      const capitalCorrecta = paisCorrecto.capital ? paisCorrecto.capital[0] : '';
      const opciones = this.crearOpciones(capitalCorrecta);

      if (opciones.length === 4) {
        preguntasCreadas.push({
          pregunta: '¿Cuál es la capital de ' + nombrePais + '?',
          respuestaCorrecta: capitalCorrecta,
          opciones: this.mezclarArray(opciones)
        });
      }
    }

    return preguntasCreadas;
  }

  crearOpciones(capitalCorrecta: string) {
    const opciones: string[] = [capitalCorrecta];

    while (opciones.length < 4) {
      const pais = this.obtenerPaisAleatorio();

      if (pais && pais.capital && pais.capital[0]) {
        const capital = pais.capital[0];

        if (!this.estaUsado(capital, opciones)) {
          opciones.push(capital);
        }
      }
    }

    return opciones;
  }

  obtenerPaisAleatorio() {
    if (this.paises.length === 0) {
      return null;
    }

    const indice = Math.floor(Math.random() * this.paises.length);
    return this.paises[indice];
  }

  obtenerNombrePais(pais: PaisApi) {
    if (pais.translations && pais.translations.spa && pais.translations.spa.common) {
      return pais.translations.spa.common;
    }

    return pais.name.common;
  }

  estaUsado(valor: string, lista: string[]) {
    for (let i = 0; i < lista.length; i++) {
      if (lista[i] === valor) {
        return true;
      }
    }

    return false;
  }

  mezclarArray(lista: string[]) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
      const indiceAleatorio = Math.floor(Math.random() * (i + 1));
      const temporal = copia[i];
      copia[i] = copia[indiceAleatorio];
      copia[indiceAleatorio] = temporal;
    }

    return copia;
  }

  obtenerPreguntaActual() {
    return this.preguntas[this.indicePregunta];
  }

  responder(opcion: string) {
    if (this.respondio || this.juegoTerminado) {
      return;
    }

    this.opcionElegida = opcion;
    this.respondio = true;

    const pregunta = this.obtenerPreguntaActual();

    if (opcion === pregunta.respuestaCorrecta) {
      this.aciertos++;
      this.puntaje += 10;
      this.mensaje = 'Correcto.';
    } else {
      this.errores++;
      this.mensaje = 'Incorrecto. La respuesta correcta era ' + pregunta.respuestaCorrecta + '.';
    }

    this.cdr.detectChanges();
  }

  siguientePregunta() {
    if (this.indicePregunta + 1 >= this.preguntas.length) {
      this.finalizarJuego();
      return;
    }

    this.indicePregunta++;
    this.opcionElegida = '';
    this.respondio = false;
    this.mensaje = '';
    this.cdr.detectChanges();
  }

  finalizarJuego() {
    this.juegoTerminado = true;
    this.gano = this.aciertos >= 6;

    if (this.gano) {
      this.mensaje = '¡Ganaste! Respondiste bien ' + this.aciertos + ' preguntas.';
    } else {
      this.mensaje = 'Perdiste. Respondiste bien ' + this.aciertos + ' preguntas.';
    }

    this.guardarResultado();
    this.cdr.detectChanges();
  }

  claseOpcion(opcion: string) {
    if (!this.respondio) {
      return '';
    }

    const pregunta = this.obtenerPreguntaActual();

    if (opcion === pregunta.respuestaCorrecta) {
      return 'correcta';
    }

    if (opcion === this.opcionElegida && opcion !== pregunta.respuestaCorrecta) {
      return 'incorrecta';
    }

    return '';
  }

  async guardarResultado() {
    if (this.resultadoGuardado) {
      return;
    }

    this.resultadoGuardado = true;

    const tiempoSegundos = Math.floor((Date.now() - this.tiempoInicio) / 1000);
    const resultado = this.gano ? 'Victoria' : 'Derrota';

    await this.resultadosService.guardarResultado(
      'Preguntados',
      resultado,
      this.puntaje,
      tiempoSegundos,
      {
        aciertos: this.aciertos,
        errores: this.errores,
        cantidadPreguntas: this.preguntas.length
      }
    );
  }
}