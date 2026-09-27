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

// --- ACTUALIZACIÓN DE PERFIL ---
async function guardarPerfil() {
    const nuevoAlias = document.getElementById('edit-alias').value.trim();
    const nuevoTelefono = document.getElementById('edit-telefono').value.trim();

    if (!nuevoAlias || !nuevoTelefono) {
        mostrarMiniModal("Alias y Teléfono son obligatorios.", false);
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
            
            // Actualiza visualmente el nombre en el panel izquierdo
            document.getElementById('mi-nombre-perfil').innerText = usuarioActual.alias;
            
            cerrarModalPerfil();
            mostrarMiniModal("¡Perfil actualizado correctamente!", false);
        } else {
            // Evaluamos si el backend nos rechaza porque el número ya existe
            const error = await respuesta.text();
            
            if (error === "NUMERO_EXISTENTE" || respuesta.status === 409) {
                mostrarMiniModal(
                    "Este número ya está registrado por una tercera persona.\n\nSi crees que es un error, por favor comunícate con soporte enviando un correo a:\n1105agramon@gmail.com", 
                    false
                );
            } else {
                mostrarMiniModal(error, false);
            }
        }
    } catch (e) {
        mostrarMiniModal("Error de conexión al guardar el perfil.", false);
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