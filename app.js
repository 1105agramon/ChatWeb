const API_URL = 'https://chatweb.juangranados.org';

const btnToggle = document.getElementById('btn-toggle');
const formLogin = document.getElementById('form-login');
const formRegistro = document.getElementById('form-registro');
const formRecuperar = document.getElementById('form-recuperar');
const tituloPantalla = document.getElementById('titulo-pantalla');

let vistaActual = 'login'; 

// --- MINI MODAL ---
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

// --- NAVEGACIÓN ---
function mostrarVista(vista) {
    document.getElementById('error-login').innerText = '';
    document.getElementById('error-registro').innerText = '';
    document.getElementById('error-recuperar').innerText = '';

    formLogin.classList.remove('active-form');
    formLogin.classList.add('hidden-form');
    formRegistro.classList.remove('active-form');
    formRegistro.classList.add('hidden-form');
    formRecuperar.classList.remove('active-form');
    formRecuperar.classList.add('hidden-form');

    vistaActual = vista;

    if (vista === 'login') {
        formLogin.classList.remove('hidden-form');
        formLogin.classList.add('active-form');
        tituloPantalla.innerText = "INICIAR SESIÓN";
        btnToggle.innerText = "CREAR CUENTA";
        btnToggle.style.display = 'block'; 
    } else if (vista === 'registro') {
        formRegistro.classList.remove('hidden-form');
        formRegistro.classList.add('active-form');
        tituloPantalla.innerText = "CREAR CUENTA";
        btnToggle.innerText = "VOLVER A INICIAR SESIÓN";
        btnToggle.style.display = 'block';
    } else if (vista === 'recuperar') {
        formRecuperar.classList.remove('hidden-form');
        formRecuperar.classList.add('active-form');
        tituloPantalla.innerText = "RECUPERAR CUENTA";
        btnToggle.style.display = 'none'; 
        
        document.getElementById('rec-paso-2').style.display = 'none';
        document.getElementById('btn-buscar-cuenta').style.display = 'block';
        document.getElementById('rec-grupo-telefono').style.display = 'flex';
    }
}

btnToggle.addEventListener('click', () => {
    if (vistaActual === 'login') mostrarVista('registro');
    else mostrarVista('login');
});

// --- REGISTRO ---
async function registrar() {
    const telefono = document.getElementById('reg-telefono').value.trim();
    const alias = document.getElementById('reg-alias').value.trim();
    const password = document.getElementById('reg-password').value.trim();
    
    let preguntaSeguridad = document.getElementById('reg-pregunta').value.trim();
    let respuestaSeguridad = document.getElementById('reg-respuesta').value.trim();
    const pinRecuperacion = document.getElementById('reg-pin').value.trim();
    
    const errorTexto = document.getElementById('error-registro');
    errorTexto.innerText = '';

    if (!telefono || !alias || !password || !preguntaSeguridad || !respuestaSeguridad || !pinRecuperacion) {
        errorTexto.innerText = "Por favor, llena todos los campos.";
        return;
    }

    if (!preguntaSeguridad.includes('¿') || !preguntaSeguridad.includes('?')) {
        errorTexto.innerText = "La pregunta secreta debe incluir los signos (¿) y (?).";
        return;
    }

    if (pinRecuperacion.length !== 4 || isNaN(pinRecuperacion)) {
        errorTexto.innerText = "El PIN debe ser exactamente de 4 números.";
        return;
    }

    preguntaSeguridad = preguntaSeguridad.toUpperCase();
    respuestaSeguridad = respuestaSeguridad.toUpperCase();

    try {
        const respuesta = await fetch(`${API_URL}/api/usuarios/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                telefono, alias, password, 
                preguntaSeguridad, respuestaSeguridad, pinRecuperacion 
            })
        });

        if (respuesta.ok) {
            const usuario = await respuesta.json();
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            window.location.href = 'chat.html';
        } else {
            errorTexto.innerText = await respuesta.text();
        }
    } catch (e) {
        errorTexto.innerText = "Error de conexión con el servidor.";
    }
}

// --- LOGIN Y REACTIVACIÓN ---
async function login() {
    const telefono = document.getElementById('log-telefono').value.trim();
    const password = document.getElementById('log-password').value.trim();
    const errorTexto = document.getElementById('error-login');
    errorTexto.innerText = '';

    if (!telefono || !password) {
        errorTexto.innerText = "Por favor, llena todos los campos.";
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/api/usuarios/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telefono, password })
        });

        if (respuesta.ok) {
            const usuario = await respuesta.json();
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            window.location.href = 'chat.html';
        } else {
            const errorDetectado = await respuesta.text();
            
            if (errorDetectado === "CUENTA_INACTIVA") {
                mostrarMiniModal("Tu cuenta está desactivada.\n¿Deseas reactivarla y entrar?", true, () => {
                    ejecutarReactivacion(telefono, password);
                });
            } else {
                errorTexto.innerText = errorDetectado;
            }
        }
    } catch (e) {
        errorTexto.innerText = "Error de conexión con el servidor.";
    }
}

async function ejecutarReactivacion(telefono, password) {
    const errorTexto = document.getElementById('error-login');
    try {
        const respuesta = await fetch(`${API_URL}/api/usuarios/reactivar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telefono, password })
        });

        if (respuesta.ok) {
            const usuario = await respuesta.json();
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));
            window.location.href = 'chat.html';
        } else {
            errorTexto.innerText = await respuesta.text();
        }
    } catch (e) {
        errorTexto.innerText = "Error al intentar reactivar la cuenta.";
    }
}

// --- RECUPERACIÓN DE CONTRASEÑA ---
async function buscarCuenta() {
    const telefono = document.getElementById('rec-telefono').value.trim();
    const errorTexto = document.getElementById('error-recuperar');
    errorTexto.innerText = '';

    if (!telefono) {
        errorTexto.innerText = "Ingresa tu número de teléfono.";
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/api/usuarios/pregunta-seguridad/${telefono}`);
        
        if (respuesta.ok) {
            const data = await respuesta.json();
            
            document.getElementById('rec-pregunta-texto').innerText = `¿${data.pregunta}?`.replace(/¿¿/g, '¿').replace(/\?\?/g, '?'); 
            
            document.getElementById('rec-grupo-telefono').style.display = 'none';
            document.getElementById('btn-buscar-cuenta').style.display = 'none';
            document.getElementById('rec-paso-2').style.display = 'flex';
        } else {
            errorTexto.innerText = await respuesta.text();
        }
    } catch (e) {
        errorTexto.innerText = "Error de conexión con el servidor.";
    }
}

async function ejecutarRestablecimiento() {
    const telefono = document.getElementById('rec-telefono').value.trim();
    let respuestaSeguridad = document.getElementById('rec-respuesta').value.trim();
    const pin = document.getElementById('rec-pin').value.trim();
    const nuevaPassword = document.getElementById('rec-nueva-password').value.trim();
    const errorTexto = document.getElementById('error-recuperar');
    errorTexto.innerText = '';

    if (!respuestaSeguridad || !pin || !nuevaPassword) {
        errorTexto.innerText = "Completa la respuesta, el PIN y tu nueva contraseña.";
        return;
    }

    respuestaSeguridad = respuestaSeguridad.toUpperCase();

    try {
        const respuesta = await fetch(`${API_URL}/api/usuarios/restablecer-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                telefono: telefono, 
                respuesta: respuestaSeguridad, 
                pin: pin, 
                nuevaPassword: nuevaPassword 
            })
        });

        if (respuesta.ok) {
            mostrarMiniModal("¡Excelente! Contraseña cambiada correctamente.", false, () => {
                document.getElementById('rec-respuesta').value = '';
                document.getElementById('rec-pin').value = '';
                document.getElementById('rec-nueva-password').value = '';
                mostrarVista('login');
            });
        } else {
            errorTexto.innerText = await respuesta.text();
        }
    } catch (e) {
        errorTexto.innerText = "Error al intentar cambiar la contraseña.";
    }
}