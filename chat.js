const API_URL = 'https://chatweb.juangranados.org';

// 1. Verificar sesión al cargar
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
let conversacionActiva = null;
let stompClient = null; 
let stompClientGeneral = null; 
let mensajeEnEdicionId = null;

let enviandoMensaje = false; // Candado para evitar envíos múltiples

if (!usuarioActual) {
    window.location.href = 'index.html'; 
} else {
    document.getElementById('mi-nombre-perfil').innerText = usuarioActual.alias;
    cargarConversaciones();
    conectarNotificacionesGenerales(); 
    configurarEnterEnInput(); 
    configurarEnterBuscador();
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

// --- CERRAR SESIÓN ---
function cerrarSesion() {
    if (stompClient !== null) stompClient.disconnect();
    if (stompClientGeneral !== null) stompClientGeneral.disconnect();
    localStorage.removeItem('usuarioActual');
    window.location.href = 'index.html';
}

// --- VARIABLES PARA TOQUE LARGO EN MÓVILES ---
let toqueLargoTimer;
let esToqueLargo = false;
let chatSeleccionadoContextual = null;

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
                <div class="chat-item" 
                     onclick="abrirChatSeguro(${conv.idConversacion}, '${otroUsuario.alias}')"
                     oncontextmenu="mostrarMenuContextual(event, ${conv.idConversacion})"
                     ontouchstart="iniciarToqueLargo(event, ${conv.idConversacion})"
                     ontouchend="cancelarToqueLargo()"
                     ontouchmove="cancelarToqueLargo()">
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

// --- CONTROL DEL CLIC Y TOQUE LARGO ---
function abrirChatSeguro(id, nombre) {
    if (esToqueLargo) return; // Si fue un toque largo, no abrimos el chat
    abrirChat(id, nombre);
}

function iniciarToqueLargo(event, idConv) {
    esToqueLargo = false;
    toqueLargoTimer = setTimeout(() => {
        esToqueLargo = true;
        mostrarMenuContextual(event, idConv, true);
    }, 600); // 600 milisegundos para detectar "Toque largo"
}

function cancelarToqueLargo() {
    clearTimeout(toqueLargoTimer);
}

function mostrarMenuContextual(e, idConv, esMovil = false) {
    e.preventDefault(); // Evita el menú nativo del navegador
    chatSeleccionadoContextual = idConv;
    
    const menu = document.getElementById('menu-contextual');
    
    // Calcula la posición del clic o del dedo
    let x = esMovil ? e.touches[0].clientX : e.clientX;
    let y = esMovil ? e.touches[0].clientY : e.clientY;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.remove('hidden');
}

// Ocultar el menú al hacer clic en cualquier otro lado
document.addEventListener('click', (e) => {
    const menu = document.getElementById('menu-contextual');
    if (menu && !menu.contains(e.target)) {
        menu.classList.add('hidden');
    }
});

// --- ELIMINAR CONVERSACIÓN ---
function confirmarEliminarChat() {
    document.getElementById('menu-contextual').classList.add('hidden');
    
    if (!chatSeleccionadoContextual) return;

    mostrarMiniModal("¿Eliminar este chat?\nSe borrará para ti, pero la otra persona aún podrá verlo.", true, async () => {
        try {
            const respuesta = await fetch(`${API_URL}/api/conversaciones/${chatSeleccionadoContextual}/eliminar/${usuarioActual.idUsuario}`, {
                method: 'PUT'
            });

            if (respuesta.ok) {
                // Si teníamos ese chat abierto en pantalla, lo cerramos
                if (conversacionActiva === chatSeleccionadoContextual) {
                    volverAListaChats();
                    document.getElementById('pantalla-vacia').classList.remove('hidden');
                    document.getElementById('pantalla-activa').classList.add('hidden');
                    conversacionActiva = null;
                }
                // Refrescamos la lista
                cargarConversaciones();
            } else {
                mostrarMiniModal("Error al eliminar la conversación.", false);
            }
        } catch (e) {
            mostrarMiniModal("Error de conexión.", false);
        }
    });
}

// 3. Iniciar un chat nuevo
async function iniciarNuevoChat() {
    const inputBuscador = document.getElementById('buscar-numero');
    const numero = inputBuscador.value.trim(); // .trim() elimina espacios en blanco accidentales
    
    if (!numero) return;

    try {
        const resBusqueda = await fetch(`${API_URL}/api/usuarios/sincronizar-contactos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([numero])
        });
        
        const contactos = await resBusqueda.json();
        
        // Si la lista viene vacía, el usuario no existe
        if (contactos.length === 0) {
            mostrarMiniModal("No se encontró ningún usuario registrado con el número:\n" + numero, false);
            return;
        }

        const idDestino = contactos[0].idUsuario;

        const resChat = await fetch(`${API_URL}/api/conversaciones/iniciar?idUsuario1=${usuarioActual.idUsuario}&idUsuario2=${idDestino}`, { method: 'POST' });
        
        if (resChat.ok) {
            inputBuscador.value = ''; // Limpiamos la barra tras tener éxito
            cargarConversaciones(); 
        }
    } catch (e) {
        console.error("Error al iniciar chat", e);
        mostrarMiniModal("Error de conexión al buscar el usuario.", false);
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

        const respuesta = await fetch(`${API_URL}/api/mensajes/historial/${idConversacion}/${usuarioActual.idUsuario}`);
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

    // --- NUEVO: Cuadro de mensaje citado (respuesta) ---
    if (msg.mensajeRespondido) {
        const divCitado = document.createElement('div');
        divCitado.className = 'mensaje-citado';
        
        // Al hacer clic en la cita, hace scroll hacia el mensaje original
        divCitado.onclick = () => {
            const original = document.getElementById(`msg-${msg.mensajeRespondido.idMensaje}`);
            if (original) original.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        
        const autorCitado = msg.mensajeRespondido.remitente.idUsuario === usuarioActual.idUsuario ? "Tú" : msg.mensajeRespondido.remitente.alias;
        const textoCitado = msg.mensajeRespondido.contenido ? msg.mensajeRespondido.contenido : "📷 Imagen";
        
        divCitado.innerHTML = `
            <span class="citado-autor">${autorCitado}</span>
            <span class="citado-texto">${textoCitado}</span>
        `;
        divMensaje.appendChild(divCitado);
    }

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

    // --- NUEVO: Flecha de Responder y acción de Doble clic ---
    const textoRespuesta = msg.contenido ? msg.contenido.replace(/'/g, "\\'") : '';
    const autorRespuesta = esMio ? "Tú" : msg.remitente.alias;
    
    // Al hacer doble clic en el mensaje, se activa la caja de respuesta
    divMensaje.ondblclick = () => prepararRespuesta(msg.idMensaje, autorRespuesta, textoRespuesta);

    const infoInferior = document.createElement('div');
    infoInferior.className = 'mensaje-info-inferior';
    infoInferior.innerHTML = `
        <i class="fa-solid fa-reply btn-responder" onclick="prepararRespuesta(${msg.idMensaje}, '${autorRespuesta}', '${textoRespuesta}')"></i>
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

// 8. Enviar o Guardar Edición con protección Anti-Spam
async function enviarMensaje() {
    if (!conversacionActiva || enviandoMensaje) return;

    const inputTexto = document.getElementById('input-texto');
    const archivoInput = document.getElementById('input-imagen');
    const texto = inputTexto.value;
    const archivo = archivoInput.files[0];

    if (!texto.trim() && !archivo) return;

    enviandoMensaje = true;
    const btnSend = document.querySelector('.btn-send');
    const iconoOriginal = btnSend.innerHTML; 
    btnSend.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; 
    btnSend.style.opacity = '0.6';
    btnSend.style.cursor = 'not-allowed';

    try {
        if (mensajeEnEdicionId) {
            const idEditando = mensajeEnEdicionId;
            cancelarEdicion(); 

            const respuesta = await fetch(`${API_URL}/api/mensajes/editar/${idEditando}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contenido: texto })
            });

            if (!respuesta.ok) mostrarMiniModal("No se pudo actualizar el mensaje.", false);
            return; 
        }

        const formData = new FormData();
        formData.append('idConversacion', conversacionActiva);
        formData.append('idRemitente', usuarioActual.idUsuario);
        if (texto) formData.append('contenido', texto);
        if (archivo) formData.append('imagen', archivo);

        // --- NUEVO: Adjuntamos el ID del mensaje original si estamos respondiendo ---
        if (mensajeEnRespuestaId) {
            formData.append('idMensajeRespondido', mensajeEnRespuestaId);
        }

        const respuesta = await fetch(`${API_URL}/api/mensajes/enviar`, {
            method: 'POST',
            body: formData 
        });

        if (respuesta.ok) {
            inputTexto.value = '';
            archivoInput.value = '';
            document.getElementById('nombre-archivo-preview').classList.add('hidden');
            
            // --- NUEVO: Limpiamos el banner de respuesta al enviar exitosamente ---
            cancelarRespuesta(); 
        } else {
            mostrarMiniModal("Ocurrió un error al enviar el mensaje.", false);
        }

    } catch (e) {
        console.error("Error al enviar mensaje", e);
        mostrarMiniModal("Fallo de conexión. Revisa tu internet.", false);
    } finally {
        enviandoMensaje = false;
        btnSend.innerHTML = iconoOriginal;
        btnSend.style.opacity = '1';
        btnSend.style.cursor = 'pointer';
        inputTexto.focus(); 
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

// --- NUEVO: Configurar Enter en el Buscador ---
function configurarEnterBuscador() {
    const inputBuscador = document.getElementById('buscar-numero');
    inputBuscador.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Evita comportamientos raros del navegador
            iniciarNuevoChat();
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

let mensajeEnRespuestaId = null;

function prepararRespuesta(idMensaje, autor, texto) {
    cancelarEdicion(); // No puedes editar y responder al mismo tiempo
    mensajeEnRespuestaId = idMensaje;
    
    document.getElementById('respuesta-autor').innerText = autor;
    document.getElementById('respuesta-texto').innerText = texto || "📷 Imagen";
    
    document.getElementById('banner-respuesta').classList.remove('hidden');
    document.getElementById('input-texto').focus();
}

function cancelarRespuesta() {
    mensajeEnRespuestaId = null;
    document.getElementById('banner-respuesta').classList.add('hidden');
}