import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { GithubService } from '../../services/github';

@Component({
  selector: 'app-quien-soy',
  imports: [CommonModule],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css'
})
export class QuienSoy implements OnInit {
  usuario: any = null;
  cargando = true;
  mensaje = '';

  constructor(private githubService: GithubService) {}

  async ngOnInit() {
    await this.cargarDatosGithub();
  }

  async cargarDatosGithub() {
    try {
      this.usuario = await this.githubService.obtenerUsuario();
    } catch (error) {
      this.mensaje = 'Ocurrió un error al conectar con GitHub.';
    } finally {
      this.cargando = false;
    }
  }
}