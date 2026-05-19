import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Modal } from '../../components/modal/modal';
import { supabase } from '../../services/supabase';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  cargando = false;
  mostrarRapidos = false;

  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'exito' | 'error' | 'info' = 'info';

  usuariosRapidos = [
    { texto: 'Jugador 1', email: 'jugador1@test.com', password: '123456' },
    { texto: 'Jugador 2', email: 'jugador2@test.com', password: '123456' },
    { texto: 'Jugador 3', email: 'jugador3@test.com', password: '123456' }
  ];

  async ingresar() {
    const emailLimpio = this.email.trim().toLowerCase();

    if (!emailLimpio || !this.password) {
      this.abrirModal('Datos incompletos', 'Debe ingresar correo y contraseña.', 'error');
      return;
    }

    this.cargando = true;

    const { error } = await supabase.auth.signInWithPassword({
      email: emailLimpio,
      password: this.password
    });

    this.cargando = false;

    if (error) {
      this.abrirModal('Error al iniciar sesión', 'Correo o contraseña incorrectos.', 'error');
      return;
    }

    this.abrirModal('Sesión iniciada', 'Ingresaste correctamente a la Sala de Juegos.', 'exito');

    setTimeout(() => {
      window.location.replace('/');
    }, 900);
  }

  toggleRapidos() {
    this.mostrarRapidos = !this.mostrarRapidos;
  }

  cargarUsuarioRapido(email: string, password: string) {
    this.email = email;
    this.password = password;
    this.mostrarRapidos = false;
  }

  abrirModal(titulo: string, mensaje: string, tipo: 'exito' | 'error' | 'info') {
    this.modalTitulo = titulo;
    this.modalMensaje = mensaje;
    this.modalTipo = tipo;
    this.modalVisible = true;
  }

  cerrarModal() {
    this.modalVisible = false;
  }
}