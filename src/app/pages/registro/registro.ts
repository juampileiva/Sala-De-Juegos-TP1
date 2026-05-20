import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Modal } from '../../components/modal/modal';
import { supabase } from '../../services/supabase';

@Component({
  selector: 'app-registro',
  imports: [CommonModule, FormsModule, Modal],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {
  email = '';
  nombre = '';
  apellido = '';
  edad: number | null = null;
  password = '';

  cargando = false;

  modalVisible = false;
  modalTitulo = '';
  modalMensaje = '';
  modalTipo: 'exito' | 'error' | 'info' = 'info';

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  async registrar() {
    const emailLimpio = this.email.trim().toLowerCase();
    const nombreLimpio = this.nombre.trim();
    const apellidoLimpio = this.apellido.trim();
    const passwordLimpia = this.password.trim();

    const errorValidacion = this.validarRegistro(
      emailLimpio,
      nombreLimpio,
      apellidoLimpio,
      this.edad,
      passwordLimpia
    );

    if (errorValidacion !== '') {
      this.abrirModal('Revisá el formulario', errorValidacion, 'error');
      return;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    try {
      const { data: usuarioExistente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', emailLimpio)
        .maybeSingle();

      if (usuarioExistente) {
        this.abrirModal(
          'Correo ya registrado',
          'Ya existe una cuenta creada con ese correo electrónico.',
          'error'
        );
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailLimpio,
        password: passwordLimpia
      });

      if (error) {
        this.abrirModal(
          'Error de registro',
          'No se pudo crear el usuario. Revisá que el correo sea válido y que la contraseña cumpla los requisitos.',
          'error'
        );
        return;
      }

      const usuarioAuth = data.user;

      if (!usuarioAuth) {
        this.abrirModal('Error de registro', 'No se pudo crear el usuario.', 'error');
        return;
      }

      if (usuarioAuth.identities && usuarioAuth.identities.length === 0) {
        this.abrirModal(
          'Correo ya registrado',
          'Ya existe una cuenta creada con ese correo electrónico.',
          'error'
        );
        return;
      }

      const { error: errorInsert } = await supabase.from('usuarios').insert({
        id: usuarioAuth.id,
        email: emailLimpio,
        nombre: nombreLimpio,
        apellido: apellidoLimpio,
        edad: this.edad
      });

      if (errorInsert) {
        this.abrirModal(
          'Error en base de datos',
          'El usuario se creó, pero no se pudieron guardar sus datos personales.',
          'error'
        );
        return;
      }

      await supabase.auth.signInWithPassword({
        email: emailLimpio,
        password: passwordLimpia
      });

      this.abrirModal('Registro exitoso', 'Tu usuario fue creado correctamente.', 'exito');

      setTimeout(async () => {
        await this.router.navigateByUrl('/');
      }, 900);
    } catch (error) {
      console.log('Error en registro:', error);
      this.abrirModal('Error inesperado', 'No se pudo completar el registro.', 'error');
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  validarRegistro(
    email: string,
    nombre: string,
    apellido: string,
    edad: number | null,
    password: string
  ) {
    if (nombre === '') {
      return 'Falta ingresar tu nombre.';
    }

    if (nombre.length < 2) {
      return 'El nombre debe tener al menos 2 letras.';
    }

    if (apellido === '') {
      return 'Falta ingresar tu apellido.';
    }

    if (apellido.length < 2) {
      return 'El apellido debe tener al menos 2 letras.';
    }

    if (email === '') {
      return 'Falta ingresar el correo electrónico.';
    }

    if (!email.includes('@')) {
      return 'El correo electrónico debe tener arroba (@).';
    }

    if (!email.includes('.')) {
      return 'El correo electrónico debe tener un dominio válido, por ejemplo: usuario@gmail.com.';
    }

    if (email.startsWith('@') || email.endsWith('@')) {
      return 'El correo electrónico no puede empezar ni terminar con arroba.';
    }

    if (!edad) {
      return 'Falta ingresar tu edad.';
    }

    if (edad < 13) {
      return 'La edad mínima para registrarse es 13 años.';
    }

    if (edad > 100) {
      return 'Ingresá una edad válida.';
    }

    if (password === '') {
      return 'Falta ingresar la contraseña.';
    }

    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }

    return '';
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