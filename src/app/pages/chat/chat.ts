import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { supabase } from '../../services/supabase';

interface MensajeChat {
  id: number;
  usuario_id: string;
  email: string;
  nombre: string;
  mensaje: string;
  creado_en: string;
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat implements OnInit, OnDestroy {
  @ViewChild('contenedorMensajes') contenedorMensajes!: ElementRef;

  mensajes: MensajeChat[] = [];
  mensajeNuevo = '';
  usuarioId = '';
  emailUsuario = '';
  nombreUsuario = '';
  cargando = true;
  enviando = false;
  error = '';
  canal: any;

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.obtenerUsuario();
    await this.cargarMensajes();
    this.escucharMensajes();
  }

  ngOnDestroy() {
    if (this.canal) {
      supabase.removeChannel(this.canal);
    }
  }

  async obtenerUsuario() {
    const { data } = await supabase.auth.getSession();

    if (!data.session || !data.session.user) {
      return;
    }

    this.usuarioId = data.session.user.id;
    this.emailUsuario = data.session.user.email || '';
    this.nombreUsuario = await this.obtenerNombreUsuario(this.usuarioId, this.emailUsuario);
  }

  async obtenerNombreUsuario(idUsuario: string, email: string) {
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

  async cargarMensajes() {
    this.cargando = true;
    this.error = '';

    const { data, error } = await supabase
      .from('mensajes_chat')
      .select('*')
      .order('creado_en', { ascending: true })
      .limit(80);

    if (error) {
      this.error = 'No se pudieron cargar los mensajes.';
      this.cargando = false;
      return;
    }

    this.mensajes = data || [];
    this.cargando = false;

    setTimeout(() => {
      this.bajarScroll();
    }, 100);
  }

  escucharMensajes() {
    this.canal = supabase
      .channel('chat-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat'
        },
        (payload) => {
          const mensaje = payload.new as MensajeChat;
          this.mensajes.push(mensaje);
          this.cdr.detectChanges();

          setTimeout(() => {
            this.bajarScroll();
          }, 100);
        }
      )
      .subscribe();
  }

  async enviarMensaje() {
    const texto = this.mensajeNuevo.trim();

    if (texto.length === 0 || this.enviando) {
      return;
    }

    this.enviando = true;
    this.error = '';

    const { error } = await supabase.from('mensajes_chat').insert({
      usuario_id: this.usuarioId,
      email: this.emailUsuario,
      nombre: this.nombreUsuario,
      mensaje: texto
    });

    if (error) {
      this.error = 'No se pudo enviar el mensaje.';
    } else {
      this.mensajeNuevo = '';
    }

    this.enviando = false;
  }

  esMensajePropio(mensaje: MensajeChat) {
    return mensaje.usuario_id === this.usuarioId;
  }

  formatearFecha(fecha: string) {
    const fechaMensaje = new Date(fecha);

    return fechaMensaje.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  bajarScroll() {
    if (!this.contenedorMensajes) {
      return;
    }

    const elemento = this.contenedorMensajes.nativeElement;
    elemento.scrollTop = elemento.scrollHeight;
  }
}