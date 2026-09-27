const API_URL = 'http://localhost:8080';

// 1. Verificar sesión al cargar
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
let conversacionActiva = null;
let stompClient = null; 
let stompClientGeneral = null; 
let mensajeEnEdicionId = null;

if (!usuarioActual) {
    window.location.href = 'index.html'; 
} else {
    document.getElementById('mi-nombre-perfil').innerText = usuarioActual.alias;
    cargarConversaciones();
    conectarNotificacionesGenerales(); 
    configurarEnterEnInput(); 
    solicitarPermisoNotificaciones(); 
}

function solicitarPermisoNotificaciones() {
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

// --- MINI MODAL (Alertas y Confirmaciones) ---
function mostrarMiniModal(mensaje, esConfirmacion, callbackSi) {
    const modal = document.getElementById('mini-modal');
    const texto = document.getElementById('mini-modal-text');
    const btnNo = document.getElementById('mini-btn-no');
    const btnSi = document.getElementById('mini-btn-si');

    texto.innerText = mensaje;
    modal.classList.remove('hidden');

    if (esConfirmacion) {
        btnNo.style.display = 'block';
        btnSi.innerText = 'SÍ';
        btnNo.onclick = () => modal.classList.add('hidden');
        btnSi.onclick = () => { modal.classList.add('hidden'); if (callbackSi) callbackSi(); };
    } else {
        btnNo.style.display = 'none';
        btnSi.innerText = 'OK';
        btnSi.onclick = () => { modal.classList.add('hidden'); if (callbackSi) callbackSi(); };
    }
}

// --- DESACTIVAR CUENTA LÓGICAMENTE ---
function confirmarDesactivarCuenta() {
    mostrarMiniModal("¿Estás seguro de desactivar tu cuenta?\nSe cerrará tu sesión.", true, async () => {
        try {
            const respuesta = await fetch(`${API_URL}/api/usuarios/${usuarioActual.idUsuario}/desactivar`, {
                method: 'PUT'
            });

            if (respuesta.ok) {
                mostrarMiniModal("Cuenta desactivada correctamente.", false, () => {
                    cerrarSesion();
                });
            } else {
                const error = await respuesta.text();
                mostrarMiniModal("Error al desactivar: " + error, false);
            }
        } catch (e) {
            mostrarMiniModal("Error de conexión.", false);
        }
    });
}

function cerrarSesion() {
    if (stompClient !== null) stompClient.disconnect();
    if (stompClientGeneral !== null) stompClientGeneral.disconnect();
    localStorage.removeItem('usuarioActual');
    window.location.href = 'index.html';
}

// 2. Cargar lista de chats
async function cargarConversaciones() {
    try {
        const respuesta = await fetch(`${API_URL}/api/conversaciones/usuario/${usuarioActual.idUsuario}`);
        const conversaciones = await respuesta.json();
        
        const listaHTML = document.getElementById('lista-conversaciones');
        listaHTML.innerHTML = '';

        const htmlConversaciones = await Promise.all(conversaciones.map(async (conv) => {
            const otroUsuario = conv.usuario1.idUsuario === usuarioActual.idUsuario ? conv.usuario2 : conv.usuario1;

            const resNoLeidos = await fetch(`${API_URL}/api/mensajes/no-leidos/${conv.idConversacion}/${usuarioActual.idUsuario}`);
            const cantidadNoLeidos = await resNoLeidos.json();

            const badgeHTML = cantidadNoLeidos > 0 
                ? `<div class="unread-badge">${cantidadNoLeidos}</div>` 
                : '';

            return `
                <div class="chat-item" onclick="abrirChat(${conv.idConversacion}, '${otroUsuario.alias}')">
                    <div class="avatar"><i class="fa-solid fa-user"></i></div>
                    <div class="chat-info" style="display: flex; align-items: center; width: 100%;">
                        <div class="chat-name">${otroUsuario.alias}</div>
                        ${badgeHTML}
                    </div>
                </div>
            `;
        }));

        listaHTML.innerHTML = htmlConversaciones.join('');

    } catch (e) {
        console.error("Error al cargar conversaciones", e);
    }
}

// 3. Iniciar un chat nuevo
async function iniciarNuevoChat() {
    const numero = document.getElementById('buscar-numero').value;
    if (!numero) return;

    try {
        const resBusqueda = await fetch(`${API_URL}/api/usuarios/sincronizar-contactos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([numero])
        });
        
        const contactos = await resBusqueda.json();
        
        if (contactos.length === 0) {
            mostrarMiniModal("No se encontró ningún usuario con ese número.", false);
            return;
        }

        const idDestino = contactos[0].idUsuario;

        const resChat = await fetch(`${API_URL}/api/conversaciones/iniciar?idUsuario1=${usuarioActual.idUsuario}&idUsuario2=${idDestino}`, { method: 'POST' });
        
        if (resChat.ok) {
            document.getElementById('buscar-numero').value = '';
            cargarConversaciones(); 
        }
    } catch (e) {
        console.error("Error al iniciar chat", e);
    }
}

// 4. Abrir un chat
async function abrirChat(idConversacion, nombreContacto) {
    conversacionActiva = idConversacion;
    cancelarEdicion(); 
    
    document.getElementById('pantalla-vacia').classList.add('hidden');
    document.getElementById('pantalla-activa').classList.remove('hidden');
    document.getElementById('nombre-chat-activo').innerText = nombreContacto;

    document.querySelector('.app-container').classList.add('chat-activo-mobile');

    try {
        await fetch(`${API_URL}/api/mensajes/leer/${idConversacion}/${usuarioActual.idUsuario}`, { method: 'PUT' });
        cargarConversaciones(); 

        const respuesta = await fetch(`${API_URL}/api/mensajes/historial/${idConversacion}`);
        const mensajes = await respuesta.json();
        
        const historialHTML = document.getElementById('historial-mensajes');
        historialHTML.innerHTML = '';

        mensajes.forEach(msg => agregarMensajeAlDOM(msg, false));
        historialHTML.scrollTop = historialHTML.scrollHeight;

        conectarWebSocket(idConversacion);

    } catch (e) {
        console.error("Error al cargar historial", e);
    }
}

function actualizarPalomitasALeido() {
    const palomitasGrises = document.querySelectorAll('.msg-status.status-enviado, .msg-status.status-entregado');
    
    palomitasGrises.forEach(icono => {
        icono.classList.remove('status-enviado', 'status-entregado', 'fa-check');
        icono.classList.add('status-leido', 'fa-check-double');
    });
}

// 5. Motor de WebSockets por Conversación
function conectarWebSocket(idConversacion) {
    if (stompClient !== null) {
        stompClient.disconnect();
    }

    const socket = new SockJS(`${API_URL}/chat-websocket`);
    stompClient = Stomp.over(socket);
    stompClient.debug = null; 

    stompClient.connect({}, function (frame) {
        
        stompClient.subscribe(`/topic/conversacion/${idConversacion}`, async function (mensajeEnVivo) {
            const nuevoMensaje = JSON.parse(mensajeEnVivo.body);
            
            const mensajeExistente = document.getElementById(`msg-${nuevoMensaje.idMensaje}`);
            if (mensajeExistente) {
                const textoSpan = mensajeExistente.querySelector('.msg-texto');
                if (textoSpan) textoSpan.innerText = nuevoMensaje.contenido;
            } else {
                agregarMensajeAlDOM(nuevoMensaje, true);
            }

            if (nuevoMensaje.remitente.idUsuario !== usuarioActual.idUsuario) {
                await fetch(`${API_URL}/api/mensajes/leer/${idConversacion}/${usuarioActual.idUsuario}`, { method: 'PUT' });
                cargarConversaciones(); 
            }
        });

        stompClient.subscribe(`/topic/conversacion/${idConversacion}/leido`, function (payload) {
            const idUsuarioQueLeyo = parseInt(payload.body);
            if (idUsuarioQueLeyo !== usuarioActual.idUsuario) {
                actualizarPalomitasALeido();
            }
        });
    });
}

// 6. Generador visual de globos de chat
function agregarMensajeAlDOM(msg, autoScroll) {
    const historialHTML = document.getElementById('historial-mensajes');
    const esMio = msg.remitente.idUsuario === usuarioActual.idUsuario;
    const claseGlobo = esMio ? 'mensaje-enviado' : 'mensaje-recibido';
    
    const divMensaje = document.createElement('div');
    divMensaje.className = `mensaje ${claseGlobo}`;
    divMensaje.id = `msg-${msg.idMensaje}`;

    if (msg.urlImagen) {
        const imageUrl = `${API_URL}${msg.urlImagen}`;
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.className = 'mensaje-img';
        imgElement.onclick = () => abrirModalImagen(imageUrl); 
        divMensaje.appendChild(imgElement);
    }

    if (msg.contenido) {
        const spanTexto = document.createElement('span');
        spanTexto.className = 'msg-texto';
        spanTexto.innerText = msg.contenido;
        divMensaje.appendChild(spanTexto);
    }

    const hora = new Date(msg.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let checkmarkHTML = '';
    if (esMio) {
        if (msg.estado === 'leido') {
            checkmarkHTML = `<i class="fa-solid fa-check-double msg-status status-leido"></i>`;
        } else if (msg.estado === 'entregado') {
            checkmarkHTML = `<i class="fa-solid fa-check-double msg-status status-entregado"></i>`;
        } else {
            checkmarkHTML = `<i class="fa-solid fa-check msg-status status-enviado"></i>`;
        }
    }

    const infoInferior = document.createElement('div');
    infoInferior.className = 'mensaje-info-inferior';
    infoInferior.innerHTML = `
        <span class="mensaje-hora">${hora}</span>
        ${checkmarkHTML}
    `;
    divMensaje.appendChild(infoInferior);

    if (esMio && msg.contenido) {
        divMensaje.addEventListener('contextmenu', (e) => {
            e.preventDefault(); 
            activarModoEdicion(msg.idMensaje, msg.contenido);
        });
    }

    historialHTML.appendChild(divMensaje);

    if (autoScroll) historialHTML.scrollTop = historialHTML.scrollHeight;
}

// --- EDICIÓN FLOTANTE ---
function activarModoEdicion(idMensaje, texto) {
    mensajeEnEdicionId = idMensaje;
    const inputTexto = document.getElementById('input-texto');
    const bannerEdicion = document.getElementById('banner-edicion');

    inputTexto.value = texto; 
    inputTexto.focus();
    bannerEdicion.classList.remove('hidden'); 
}

function cancelarEdicion() {
    mensajeEnEdicionId = null;
    document.getElementById('input-texto').value = '';
    const bannerEdicion = document.getElementById('banner-edicion');
    if (bannerEdicion) bannerEdicion.classList.add('hidden');
}

// 7. Vista previa de imagen
function mostrarVistaPrevia() {
    const input = document.getElementById('input-imagen');
    const preview = document.getElementById('nombre-archivo-preview');
    if (input.files.length > 0) {
        preview.innerText = "📎 " + input.files[0].name;
        preview.classList.remove('hidden');
    }
}

// 8. Enviar o Guardar Edición
async function enviarMensaje() {
    if (!conversacionActiva) return;

    const texto = document.getElementById('input-texto').value;
    const archivoInput = document.getElementById('input-imagen');
    const archivo = archivoInput.files[0];

    if (!texto.trim() && !archivo) return;

    if (mensajeEnEdicionId) {
        const idEditando = mensajeEnEdicionId;
        cancelarEdicion(); 

        try {
            const respuesta = await fetch(`${API_URL}/api/mensajes/editar/${idEditando}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contenido: texto })
            });

            if (!respuesta.ok) mostrarMiniModal("No se pudo actualizar el mensaje.", false);
        } catch (e) {
            console.error("Error al editar mensaje", e);
        }
        return;
    }

    const formData = new FormData();
    formData.append('idConversacion', conversacionActiva);
    formData.append('idRemitente', usuarioActual.idUsuario);
    if (texto) formData.append('contenido', texto);
    if (archivo) formData.append('imagen', archivo);

    try {
        const respuesta = await fetch(`${API_URL}/api/mensajes/enviar`, {
            method: 'POST',
            body: formData 
        });

        if (respuesta.ok) {
            document.getElementById('input-texto').value = '';
            archivoInput.value = '';
            document.getElementById('nombre-archivo-preview').classList.add('hidden');
        }
    } catch (e) {
        console.error("Error al enviar mensaje", e);
    }
}

function configurarEnterEnInput() {
    const inputTexto = document.getElementById('input-texto');
    inputTexto.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            enviarMensaje();
        }
    });
}

// --- VISOR FLOTANTE DE IMÁGENES ---
function abrirModalImagen(url) {
    const modal = document.getElementById('modal-imagen');
    const imgAmpliada = document.getElementById('img-ampliada');
    imgAmpliada.src = url;
    modal.classList.remove('hidden');
}

function cerrarModalImagen() {
    document.getElementById('modal-imagen').classList.add('hidden');
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModalImagen();
});

document.getElementById('modal-imagen')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-imagen') cerrarModalImagen();
});

function volverAListaChats() {
    document.querySelector('.app-container').classList.remove('chat-activo-mobile');
    conversacionActiva = null; 
}

// --- TOAST Y NOTIFICACIONES NATIVAS ---
function mostrarToast(titulo, mensaje, idConversacion) {
    const toast = document.getElementById('toast-notificacion');
    if (!toast) return; 

    document.getElementById('toast-titulo').innerText = titulo;
    document.getElementById('toast-cuerpo').innerText = mensaje;
    
    toast.classList.remove('hidden');

    toast.onclick = () => {
        toast.classList.add('hidden');
        abrirChat(idConversacion, titulo);
    };

    setTimeout(() => { toast.classList.add('hidden'); }, 4000);
}

// 10. Conexión general
function conectarNotificacionesGenerales() {
    if (stompClientGeneral !== null) {
        stompClientGeneral.disconnect();
    }

    const socket = new SockJS(`${API_URL}/chat-websocket`);
    stompClientGeneral = Stomp.over(socket);
    stompClientGeneral.debug = null;

    stompClientGeneral.connect({}, function (frame) {
        stompClientGeneral.subscribe(`/topic/usuario/${usuarioActual.idUsuario}`, function (notificacion) {
            
            let datosMensaje;
            try {
                datosMensaje = JSON.parse(notificacion.body);
            } catch (e) {
                return; 
            }

            cargarConversaciones(); 

            if (datosMensaje.idMensaje && datosMensaje.remitente.idUsuario !== usuarioActual.idUsuario) {
                
                const idChatNotificado = datosMensaje.conversacion.idConversacion;
                const nombreRemitente = datosMensaje.remitente.alias;
                const textoNotificacion = datosMensaje.contenido ? datosMensaje.contenido : "📷 Foto recibida";

                if (conversacionActiva !== idChatNotificado && !document.hidden) {
                    mostrarToast(nombreRemitente, textoNotificacion, idChatNotificado);
                }

                if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
                    const alertaNativa = new Notification(nombreRemitente, {
                        body: textoNotificacion,
                        icon: "https://cdn-icons-png.flaticon.com/512/1041/1041916.png" 
                    });

                    alertaNativa.onclick = function() {
                        window.focus(); 
                        abrirChat(idChatNotificado, nombreRemitente); 
                    };
                }
            }
        });
    });
}