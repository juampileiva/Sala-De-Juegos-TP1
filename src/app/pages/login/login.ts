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
    const passwordLimpia = this.password.trim();

    const errorValidacion = this.validarLogin(emailLimpio, passwordLimpia);

    if (errorValidacion !== '') {
      this.abrirModal('Revisá los datos', errorValidacion, 'error');
      return;
    }

    this.cargando = true;

    const existeUsuario = await this.existeUsuarioEnTabla(emailLimpio);

    if (!existeUsuario) {
      this.cargando = false;
      this.abrirModal(
        'Correo no registrado',
        'No existe ningún usuario registrado con ese correo. Verificá si lo escribiste bien o creá una cuenta nueva.',
        'error'
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailLimpio,
      password: passwordLimpia
    });

    this.cargando = false;

    if (error) {
      this.abrirModal(
        'Contraseña incorrecta',
        'El correo existe, pero la contraseña ingresada no es correcta.',
        'error'
      );
      return;
    }

    this.abrirModal('Sesión iniciada', 'Ingresaste correctamente a la Sala de Juegos.', 'exito');

    setTimeout(() => {
      window.location.replace('/');
    }, 900);
  }

  validarLogin(email: string, password: string) {
    if (email === '') {
      return 'Falta ingresar el correo electrónico.';
    }

    if (!email.includes('@')) {
      return 'El correo electrónico debe tener arroba (@).';
    }

    if (!email.includes('.')) {
      return 'El correo electrónico debe tener un dominio válido, por ejemplo: usuario@gmail.com.';
    }

    if (password === '') {
      return 'Falta ingresar la contraseña.';
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    return '';
  }

  async existeUsuarioEnTabla(email: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!error && data) {
      return true;
    }

    if (
      email === 'jugador1@test.com' ||
      email === 'jugador2@test.com' ||
      email === 'jugador3@test.com'
    ) {
      return true;
    }

    return false;
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