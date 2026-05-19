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

    if (!emailLimpio || !nombreLimpio || !apellidoLimpio || !this.edad || !this.password) {
      this.abrirModal('Datos incompletos', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    if (this.password.length < 6) {
      this.abrirModal('Contraseña inválida', 'La contraseña debe tener al menos 6 caracteres.', 'error');
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
        this.abrirModal('Usuario existente', 'Ya existe un usuario registrado con ese correo.', 'error');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailLimpio,
        password: this.password
      });

      if (error) {
        this.abrirModal('Error de registro', 'No se pudo crear el usuario. Verificá los datos ingresados.', 'error');
        return;
      }

      const usuarioAuth = data.user;

      if (!usuarioAuth) {
        this.abrirModal('Error de registro', 'No se pudo crear el usuario.', 'error');
        return;
      }

      if (usuarioAuth.identities && usuarioAuth.identities.length === 0) {
        this.abrirModal('Usuario existente', 'Ya existe un usuario registrado con ese correo.', 'error');
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
        this.abrirModal('Error en base de datos', 'No se pudieron guardar los datos del usuario.', 'error');
        return;
      }

      await supabase.auth.signInWithPassword({
        email: emailLimpio,
        password: this.password
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