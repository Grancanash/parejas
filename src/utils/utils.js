const unsortList = (lista) => {
    // Desordenar lista
    let indiceActual = lista.length, indiceAleatorio;
    while (indiceActual !== 0) { // Mientras queden elementos por desordenar.
        // Selecciona un elemento restante.
        indiceAleatorio = Math.floor(Math.random() * indiceActual);
        indiceActual--;
        // Intercámbialo con el elemento actual.
        [lista[indiceActual], lista[indiceAleatorio]] = [
            lista[indiceAleatorio],
            lista[indiceActual],
        ];
    }
    return lista;
}

const createTimer = () => {
    let ms = 0;
    let s = 0;
    let m = 0;
    let h = 0;
    const timerStorage = JSON.parse(localStorage.getItem('timer'));
    if (timerStorage) {
        ms = timerStorage.ms;
        s = timerStorage.s;
        m = timerStorage.m;
        h = timerStorage.h;
    }
    let interval = null;
    const start = () => {
        if (interval) return;
        interval = setInterval(() => {
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

            let crono = [h, m, s, ms];
            localStorage.setItem('crono', JSON.stringify(crono));

            displayTime();
        }, 10);
    }
    const stop = () => {
        clearInterval(interval);
        interval = null;
    }
    const reset = () => {
        stop();
        ms = 0;
        s = 0;
        m = 0;
        h = 0;
        displayTime();
    }
    const getTime = () => {
        return [h, m, s, ms];
    }
    const displayTime = () => {
        document.getElementById("displaytime").innerText =
            `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}:${s < 10 ? "0" + s : s}:${ms < 10 ? "0" + ms : ms}`;
        localStorage.setItem('timer', JSON.stringify({ h: h, m: m, s: s, ms: ms }));
    }
    displayTime();
    return { start, stop, reset, getTime };
}

const arrayToTime = (totalms) => {
    const h = Math.floor(totalms / (100 * 60 * 60));
    const m = Math.floor((totalms % (100 * 60 * 60)) / (100 * 60));
    const s = Math.floor((totalms % (100 * 60)) / 100);
    const ms = totalms % 100;

    const t = n => String(n).padStart(2, '0');
    return `${t(h)}:${t(m)}:${t(s)}:${t(ms)}`;
}

const getStorage = (key) => {
    return JSON.parse(localStorage.getItem(key))
}

const setStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
}


export { unsortList, createTimer, getStorage, setStorage, arrayToTime };