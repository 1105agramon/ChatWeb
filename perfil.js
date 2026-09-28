// perfil.js
// NOTA: API_URL, usuarioActual, mostrarMiniModal() y cerrarSesion() ya existen gracias a chat.js

// --- LÓGICA DEL MENÚ DESPLEGABLE ---
function toggleMenuDesplegable() {
    const menu = document.getElementById('menu-opciones');
    menu.classList.toggle('hidden');
}

// Cierra el menú automáticamente si haces clic en otra parte de la pantalla
document.addEventListener('click', function(event) {
    const menu = document.getElementById('menu-opciones');
    const botonMenu = event.target.closest('.header-actions');
    
    if (!botonMenu && menu && !menu.classList.contains('hidden')) {
        menu.classList.add('hidden');
    }
});

// --- APERTURA Y CIERRE DE MODALES ---
function abrirModalPerfil() {
    document.getElementById('menu-opciones').classList.add('hidden');
    
    // NUEVO: Limpiar cualquier mensaje de error anterior al abrir
    const msgBox = document.getElementById('perfil-mensaje');
    msgBox.className = 'inline-message hidden';
    msgBox.innerText = '';

    // Pre-carga los datos actuales en los inputs
    document.getElementById('edit-alias').value = usuarioActual.alias;
    document.getElementById('edit-telefono').value = usuarioActual.telefono;
    
    document.getElementById('modal-perfil').classList.remove('hidden');
}

function cerrarModalPerfil() {
    document.getElementById('modal-perfil').classList.add('hidden');
}

// --- APERTURA Y CIERRE DEL MODAL DE SEGURIDAD ---
function abrirModalSeguridad() {
    document.getElementById('menu-opciones').classList.add('hidden');
    
    // Limpiamos cualquier mensaje viejo al abrir la ventana
    const msgBox = document.getElementById('seguridad-mensaje');
    msgBox.className = 'inline-message hidden';
    msgBox.innerText = '';

    // Limpiamos los inputs por seguridad para que no quede nada escrito de antes
    document.getElementById('seg-current-password').value = '';
    document.getElementById('seg-new-password').value = '';
    document.getElementById('seg-new-pin').value = '';
    document.getElementById('seg-new-pregunta').value = '';
    document.getElementById('seg-new-respuesta').value = '';

    document.getElementById('modal-seguridad').classList.remove('hidden');
}

function cerrarModalSeguridad() {
    document.getElementById('modal-seguridad').classList.add('hidden');
}

// --- ACTUALIZACIÓN DE PERFIL ---
async function guardarPerfil() {
    const nuevoAlias = document.getElementById('edit-alias').value.trim();
    const nuevoTelefono = document.getElementById('edit-telefono').value.trim();
    const msgBox = document.getElementById('perfil-mensaje');

    // Función interna para mostrar el texto en la caja
    const mostrarMensajeInline = (texto, tipo) => {
        msgBox.innerText = texto;
        msgBox.className = `inline-message ${tipo}`;
    };

    if (!nuevoAlias || !nuevoTelefono) {
        mostrarMensajeInline("Alias y Teléfono son obligatorios.", "error");
        return;
    }

    // Si el usuario no cambió nada, simplemente cerramos la ventana
    if (nuevoAlias === usuarioActual.alias && nuevoTelefono === usuarioActual.telefono) {
        cerrarModalPerfil();
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/api/usuarios/${usuarioActual.idUsuario}/perfil`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                alias: nuevoAlias, 
                telefono: nuevoTelefono 
            })
        });

        if (respuesta.ok) {
            const usuarioActualizado = await respuesta.json();
            
            // Refresca la sesión guardada
            localStorage.setItem('usuarioActual', JSON.stringify(usuarioActualizado));
            usuarioActual = usuarioActualizado;
            
            // Actualiza visualmente el nombre
            document.getElementById('mi-nombre-perfil').innerText = usuarioActual.alias;
            
            // Mensaje de éxito y cerramos la ventana tras 1.5 segundos
            mostrarMensajeInline("¡Perfil actualizado correctamente!", "success");
            setTimeout(() => {
                cerrarModalPerfil();
            }, 1500);

        } else {
            const error = await respuesta.text();
            
            if (error === "NUMERO_EXISTENTE" || respuesta.status === 409) {
                mostrarMensajeInline("Este número ya está registrado.\nSi crees que es un error, contacta a:\n1105agramon@gmail.com", "error");
            } else {
                mostrarMensajeInline(error, "error");
            }
        }
    } catch (e) {
        mostrarMensajeInline("Error de conexión al servidor.", "error");
    }
}

// --- ACTUALIZACIÓN DE SEGURIDAD ---
async function guardarSeguridad() {
    const currentPassword = document.getElementById('seg-current-password').value.trim();
    const newPassword = document.getElementById('seg-new-password').value.trim();
    const newPin = document.getElementById('seg-new-pin').value.trim();
    const newPregunta = document.getElementById('seg-new-pregunta').value.trim();
    const newRespuesta = document.getElementById('seg-new-respuesta').value.trim();
    
    const msgBox = document.getElementById('seguridad-mensaje');

    // Función interna para mostrar mensajes
    const mostrarMensajeInline = (texto, tipo) => {
        msgBox.innerText = texto;
        msgBox.className = `inline-message ${tipo}`;
    };

    // Validaciones iniciales
    if (!currentPassword) {
        mostrarMensajeInline("Debes ingresar tu contraseña actual para autorizar los cambios.", "error");
        return;
    }

    if (!newPassword && !newPin && !newPregunta && !newRespuesta) {
        mostrarMensajeInline("No has escrito ningún dato nuevo para actualizar.", "error");
        return;
    }

    if (newPin && (newPin.length !== 4 || isNaN(newPin))) {
        mostrarMensajeInline("El nuevo PIN debe ser exactamente de 4 números.", "error");
        return;
    }

    if (newPregunta && (!newPregunta.includes('¿') || !newPregunta.includes('?'))) {
        mostrarMensajeInline("La nueva pregunta debe incluir los signos (¿) y (?).", "error");
        return;
    }

    if ((newPregunta && !newRespuesta) || (!newPregunta && newRespuesta)) {
        mostrarMensajeInline("Si cambias la pregunta de seguridad, debes ingresar tanto la pregunta como la respuesta.", "error");
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/api/usuarios/${usuarioActual.idUsuario}/seguridad`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword,
                newPin: newPin,
                newPregunta: newPregunta,
                newRespuesta: newRespuesta
            })
        });

        if (respuesta.ok) {
            mostrarMensajeInline("¡Datos de seguridad actualizados correctamente!", "success");
            
            // Cerramos la ventana automáticamente después de 1.5 segundos
            setTimeout(() => {
                cerrarModalSeguridad();
            }, 1500);
        } else {
            const error = await respuesta.text();
            mostrarMensajeInline(error, "error"); // Muestra si la contraseña actual era incorrecta
        }
    } catch (e) {
        mostrarMensajeInline("Error de conexión con el servidor.", "error");
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
                    cerrarSesion(); // Esta función viene desde chat.js y limpia la sesión
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