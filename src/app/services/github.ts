import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private url = 'https://api.github.com/users/juampileiva';

  async obtenerUsuario() {
    const respuesta = await fetch(this.url);

    if (!respuesta.ok) {
      throw new Error('No se pudieron cargar los datos de GitHub.');
    }

    return await respuesta.json();
  }
}