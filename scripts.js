
let bloqueActivo = null;
let volteando = false;
let xIni = 0;
let yIni = 0;
let totalCartas = 30;

let timer;
let ms = 0;
let s = 0;
let m = 0;
let h = 0;

let finJuego = false;

// Función para crear e iniciar el cronómetro
function startTimer() {
    timer = setInterval(() => {
        ms++;
        if (ms == 100) {
            ms = 0;
            s++;
        }
        if (s == 60) {
            s = 0;
            m++;
        }
        if (m == 60) {
            m = 0;
            h++;
        }
        document.getElementById("display").innerText =
            `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}:${ms < 10 ? "0" + ms : ms}`;
    }, 10);
}

// Parar el cronómetro
function stopTimer() {
    clearInterval(timer);
}

// Creación de la rejilla con las cartas de colores
const inicializarRejilla = () => {
    // Creación de la carta
    const cuadricula = document.getElementById('cuadricula');
    const cartaHTML =
        `<div class="card-container">
            <div class="card">
            <div class="face front"></div>
            <div class="face back"></div>
            </div>
        </div>`;

    // Inserción de todas las cartas en la rejilla
    for (let i = 0; i < totalCartas; i++) {
        cuadricula.insertAdjacentHTML('beforeend', cartaHTML);
    }

    // Inicialización de los 15 colores para las parejas de cartas. Se decidió inicializar los colores de forma manual y no aleatoria
    // para que haya una variedad y contraste decente, y evitar así que se añadan colores muy parecidos y difíciles de distinguir
    const colores = ["#e6194b", "#e6194b", "#3cb44b", "#3cb44b", "#ffe119", "#ffe119", "#4363d8", "#4363d8", "#f58231", "#f58231", "#911eb4", "#911eb4", "#46f0f0", "#46f0f0", "#f032e6", "#f032e6", "#bcf60c", "#bcf60c", "#fabebe", "#fabebe", "#008080", "#008080", "#e6beff", "#e6beff", "#9a6324", "#9a6324", "#fffac8", "#fffac8", "#800000", "#800000"];

    // Desordenar lista
    let indiceActual = colores.length, indiceAleatorio;
    while (indiceActual !== 0) { // Mientras queden elementos por desordenar.
        // Selecciona un elemento restante.
        indiceAleatorio = Math.floor(Math.random() * indiceActual);
        indiceActual--;

        // Intercámbialo con el elemento actual.
        [colores[indiceActual], colores[indiceAleatorio]] = [
            colores[indiceAleatorio],
            colores[indiceActual],
        ];
    }

    // Asignación de los colroes desordenados a las cartas de la rejilla
    const cajas = document.querySelectorAll('#cuadricula .card');
    for (let indice = 0; indice < cajas.length; indice++) {
        cajas[indice].dataset.color = colores[indice];
    }

    // Dibujar cronómetro
    document.getElementById("display").innerText = '00:00:00:00';
}



// MOUSE DOWN
document.getElementById('cuadricula').addEventListener('mousedown', (e) => {
    // Se almacena en la variable global 'bloqueActivo' la carta seleccionada para controlar el arrastre de la misma con mousemove
    bloqueActivo = e.target.parentElement;
    let padre = bloqueActivo.parentElement;

    // Si la carta que pulsamos no está resuelta (no ha encontrado pareja) almacenamos el vamlor inicial del ratón y asignamos 
    // z-index para que la carta seleccionada esté por encima del resto.
    if (!bloqueActivo.dataset.resuelto) {
        xIni = e.clientX;
        yIni = e.clientY;

        for (const caja of document.querySelectorAll('#cuadricula .card-container')) {
            caja.style.zIndex = 0;
        }

        padre.style.zIndex = 1;
    }
});

// MOUSE UP
document.getElementById('cuadricula').addEventListener('mouseup', (e) => {
    // Iniciar cronómetro
    if (!timer && !finJuego) startTimer();

    const cajaActual = e.target.parentElement;
    padre = cajaActual.parentElement;

    // Si la caja actual ya está resuelta (encontró pareja) o se está ejecutando la animaci´ñon de volteo, no continuamos ejecutando el código
    if (cajaActual.dataset.resuelto || volteando) return;

    // Se eliminan los bordes discontinuos de las cajas sobre las que arrastramos la anteriormente seleccionada
    for (const caja of document.querySelectorAll('#cuadricula .card-container')) {
        caja.style.border = 'none';
    }

    // Comprarmos el color de la caja que se está arrastrando con la que hay debajo. Desactivamos de forma temporal los eventos de
    // la caja que estamos arrastrando para poder detectar qué caja está debajo
    const color1 = bloqueActivo.dataset.color;
    cajaActual.style.pointerEvents = 'none';
    padre.style.pointerEvents = 'none';
    const cajaDebajo = document.elementFromPoint(e.clientX, e.clientY).parentElement;
    const color2 = (cajaDebajo.dataset.color);
    cajaActual.style.pointerEvents = 'auto';
    padre.style.pointerEvents = 'auto';

    // Pareja encontrada
    if (color1 === color2) {
        voltear(cajaDebajo);
        bloqueActivo.dataset.resuelto = true;
        cajaDebajo.dataset.resuelto = true;
        cajaDebajo.style.backgroundColor = cajaDebajo.dataset.color;
    }

    // Se colocan en su sitios original las cajas arrastradas previamente
    padre.style.left = 0;
    padre.style.top = 0;

    // Poner a negro las cajas volteadas previamente que no hayan encontrado pareja
    for (const caja of document.querySelectorAll('#cuadricula .card')) {
        if (caja !== cajaActual && caja.dataset.volteada && !caja.dataset.resuelto) {
            voltear(caja);
        }
    }

    // Se voltea la caja si no se ha resuelto pareja
    if (!cajaActual.dataset.resuelto) {
        voltear(cajaActual);
    }

    // Conteo de parejas encontradas y finalización
    if (document.querySelectorAll('#cuadricula .card[data-resuelto="true"]').length >= totalCartas) {
        stopTimer();
        finJuego = true;
    }

    // Se elimina el bloque activo para que no pueda ser arrastrado en el mousemove
    bloqueActivo = null;
})

// MOUSE MOVE
document.getElementById('cuadricula').addEventListener('mousemove', (e) => {

    // Si existe un bloque activo (acción realizada con el mousedown) se procede a arrastar la caja seleccionada
    if (bloqueActivo && bloqueActivo.dataset.volteada && !bloqueActivo.dataset.resuelto) {
        // Se arrastre el bloque activo
        const padre = bloqueActivo.parentElement;
        padre.style.left = (e.clientX - xIni) + 'px'
        padre.style.top = (e.clientY - yIni) + 'px'

        // Se desactivan provisionalmente eventos del bloque arrastrado para poder detectar el que hay debajo
        bloqueActivo.style.pointerEvents = 'none';
        padre.style.pointerEvents = 'none';

        // Se elimnan los bordes de los elementos sobre los que ya no estamos encima
        for (const caja of document.querySelectorAll('#cuadricula .card-container')) {
            caja.style.border = 'none';
        }

        // Se selecciona la caja que está debajo de la arrastrada
        let bloqueDebajo = document.elementFromPoint(e.clientX, e.clientY).parentElement.parentElement;

        // Se pinta borde discontinuo en la caja sobre la que estamos pasando
        if (bloqueDebajo.classList.contains('card-container')) {
            bloqueDebajo.style.border = 'dashed salmon';
        }

        padre.style.pointerEvents = 'auto';
        bloqueActivo.style.pointerEvents = 'auto';

    }
})

// Función de volteo de la caja seleccionada
const voltear = caja => {
    // Se bloquean todas las cajas mientras la seleccionada está ejecutando la animación de volteo
    volteando = true;

    if (!caja.dataset.volteada) {
        // Gestión del volteo de las cajas negras (cuando una caja negra se voltea y muestra su color, se convierte en uan caja volteada)
        caja.querySelector('.back').style.backgroundColor = caja.dataset.color;
        caja.classList.toggle('flipped');
        caja.addEventListener('transitionend', e => {
            caja.dataset.volteada = true;
            volteando = false;
        }, { once: true });
    } else {
        // Gestión del volteo de las cajas volteadas (de color)
        caja.classList.toggle('flipped');
        caja.addEventListener('transitionend', e => {
            delete caja.dataset.volteada;
            volteando = false;
        }, { once: true });
    }
}

inicializarRejilla();