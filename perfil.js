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
    // Pre-carga los datos actuales en los inputs
    document.getElementById('edit-alias').value = usuarioActual.alias;
    document.getElementById('edit-telefono').value = usuarioActual.telefono;
    
    document.getElementById('modal-perfil').classList.remove('hidden');
}

function cerrarModalPerfil() {
    document.getElementById('modal-perfil').classList.add('hidden');
}

function abrirModalSeguridad() {
    document.getElementById('menu-opciones').classList.add('hidden');
    document.getElementById('modal-seguridad').classList.remove('hidden');
}

function cerrarModalSeguridad() {
    document.getElementById('modal-seguridad').classList.add('hidden');
}

/// --- ACTUALIZACIÓN DE SEGURIDAD ---
async function guardarSeguridad() {
    const currentPassword = document.getElementById('seg-current-password').value.trim();
    const newPassword = document.getElementById('seg-new-password').value.trim();
    const newPin = document.getElementById('seg-new-pin').value.trim();
    const newPregunta = document.getElementById('seg-new-pregunta').value.trim();
    const newRespuesta = document.getElementById('seg-new-respuesta').value.trim();

    if (!currentPassword) {
        mostrarMiniModal("Debes ingresar tu contraseña actual para autorizar los cambios.", false);
        return;
    }

    if (!newPassword && !newPin && !newPregunta && !newRespuesta) {
        mostrarMiniModal("No has ingresado ningún dato nuevo para actualizar.", false);
        return;
    }

    if (newPin && (newPin.length !== 4 || isNaN(newPin))) {
        mostrarMiniModal("El nuevo PIN debe ser exactamente de 4 números.", false);
        return;
    }

    if (newPregunta && (!newPregunta.includes('¿') || !newPregunta.includes('?'))) {
        mostrarMiniModal("La nueva pregunta debe incluir los signos (¿) y (?).", false);
        return;
    }

    if ((newPregunta && !newRespuesta) || (!newPregunta && newRespuesta)) {
        mostrarMiniModal("Si deseas cambiar la pregunta de seguridad, debes ingresar tanto la nueva pregunta como la nueva respuesta.", false);
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
            mostrarMiniModal("¡Datos de seguridad actualizados correctamente!", false, () => {
                cerrarModalSeguridad();
                // Limpiamos los campos por seguridad
                document.getElementById('seg-current-password').value = '';
                document.getElementById('seg-new-password').value = '';
                document.getElementById('seg-new-pin').value = '';
                document.getElementById('seg-new-pregunta').value = '';
                document.getElementById('seg-new-respuesta').value = '';
            });
        } else {
            const error = await respuesta.text();
            mostrarMiniModal(error, false);
        }
    } catch (e) {
        mostrarMiniModal("Error de conexión con el servidor.", false);
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