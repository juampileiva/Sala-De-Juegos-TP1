import { Injectable } from '@angular/core';
import { supabase } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class ResultadosService {
  async guardarResultado(
    juego: string,
    resultado: string,
    puntaje: number,
    tiempoSegundos: number,
    detalle: any
  ) {
    const { data } = await supabase.auth.getSession();

    if (!data.session || !data.session.user) {
      return;
    }

    const usuario = data.session.user;
    const email = usuario.email || '';
    const nombre = await this.obtenerNombreUsuario(usuario.id, email);

    await supabase.from('resultados_juegos').insert({
      usuario_id: usuario.id,
      email: email,
      nombre: nombre,
      juego: juego,
      resultado: resultado,
      puntaje: puntaje,
      tiempo_segundos: tiempoSegundos,
      detalle: detalle
    });
  }

  private async obtenerNombreUsuario(idUsuario: string, email: string) {
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
}