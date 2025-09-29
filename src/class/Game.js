import { unsortList, getStorage, setStorage, arrayToTime } from '../utils/utils';
import Tarjeta from './Tarjeta';

class Game {
    #cols;
    #rows;
    #totalCards;
    #cards;
    #currentCard;
    #dragging;
    #xIni;
    #yIni;
    #prevElement;
    #timer;
    #finJuego;

    constructor(timer) {
        this.promptbox();
        this.#xIni = this.#yIni = 0;
        this.#timer = timer;
        this.#dragging = false;
        this.initListeners();
        if (getStorage('parejas_records')) {
            this.displayRecords();
        }
    }

    set rows(valor) {
        this.#rows = valor;
    }
    set cols(valor) {
        this.#cols = valor;
    }

    set currentCard(valor) {
        this.#currentCard = valor;
    }

    get dragging() {
        return this.#dragging;
    }

    set dragging(valor) {
        this.#dragging = valor;
    }

    static checkStorage = () => {
        if (!localStorage.getItem('parejas_settings')) {
            this.resetStorage();
        };
    }

    static resetStorage = () => {
        localStorage.removeItem('parejas_settings');
        localStorage.removeItem('parejas_timer');
        localStorage.removeItem('parejas_cards');
    }

    promptbox = () => {
        this.#finJuego = false;
        const promptbox = document.getElementById('promptbox');
        for (const input of promptbox.querySelectorAll('input[type=number]')) {
            input.value = '';
        }
        promptbox.querySelector('#rows').addEventListener('input', (e) => {
            promptbox.querySelector('#rowsvalue').textContent = e.target.value;
        });
        promptbox.querySelector('#cols').addEventListener('input', (e) => {
            promptbox.querySelector('#colsvalue').textContent = e.target.value;
        });
        promptbox.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const rows = parseInt(document.querySelector('input[id=rows]').value);
            const cols = parseInt(document.querySelector('input[id=cols]').value);
            const totalCards = rows * cols;
            if (totalCards % 2) {
                document.getElementById('errormessage').style.opacity = 1;
            } else {
                this.#rows = rows;
                this.#cols = cols;
                this.#totalCards = totalCards;
                setStorage('parejas_settings', { 'rows': rows, 'cols': cols });
                promptbox.style.display = 'none';
                const colores = unsortList(this.generateColors());
                this.initGrid(colores);
                this.drawCards();
            }
        });
        const settingsStorage = getStorage('parejas_settings');
        if (settingsStorage) {
            this.#rows = settingsStorage.rows;
            this.#cols = settingsStorage.cols;
            this.#totalCards = settingsStorage.rows * settingsStorage.cols;
            if (settingsStorage.finjuego) this.#finJuego = settingsStorage.finjuego;
            const cardsStorage = getStorage('parejas_cards');
            const colores = cardsStorage.map(card => card.color);
            this.initGrid(colores);
            this.drawCards();
        } else {
            localStorage.removeItem('parejas_timer');
            localStorage.removeItem('parejas_cards');
            promptbox.style.display = 'block';
        }
    }

    timerStart = () => {
        if (!this.#finJuego) {
            this.#timer.start();
        }
    }

    generateColors = () => {
        const array = ['maroon', 'red', 'purple', 'fuchsia', 'green', 'lime', 'olive', 'yellow', 'navy', 'blue', 'teal', 'aqua', 'antiquewhite', 'aquamarine', 'brown', 'burlywood', 'cadetblue', 'chocolate', 'coral', 'cornflowerblue', 'darkgoldenrod', 'darkgray', 'darkolivegreen', 'darkorange', 'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray', 'darkturquoise', 'deeppink', 'dodgerblue', 'firebrick', 'gold', 'indianred', 'indigo', 'khaki', 'lavender', 'lightblue', 'lightcoral', 'lightcyan', 'lightsalmon', 'lightslategrey', 'lightsteelblue', 'midnightblue', 'navajowhite', 'olivedrab', 'orange', 'palegreen', 'palevioletred', 'rosybrown'];
        let colors = [];
        const numPares = this.#totalCards / 2;
        // Creamos un array temporal para no repetir colores
        const disponibles = [...array];
        for (let i = 0; i < numPares; i++) {
            // Elegir un índice aleatorio del array de disponibles
            const indiceAleatorio = Math.floor(Math.random() * disponibles.length);
            const color = disponibles.splice(indiceAleatorio, 1)[0]; // lo sacamos para no repetir
            colors.push(color, color); // añadimos el par
        }

        return colors;
    }

    initGrid = (colors) => {
        this.#cards = [];
        let cards = []
        const cardsStorage = getStorage('parejas_cards');
        for (let id = 0; id < this.#totalCards; id++) {
            const card = new Tarjeta(id, colors[id], this);
            let resuelta = false;
            if (cardsStorage) {
                resuelta = cardsStorage[id].resuelta;
                if (resuelta) {
                    card.resuelta = card.volteada = true;
                }
            }
            this.#cards.push(card);
            cards.push({ id: id, color: colors[id], resuelta: resuelta, volteada: resuelta });
        }
        setStorage('parejas_cards', cards);
    }

    drawCards = () => {
        const grid = document.getElementById('cuadricula');
        grid.textContent = '';
        const extraHeight = 5 * (this.#rows - 1) + 40;
        const rowHeight = parseInt((485 - extraHeight) / this.#rows);

        grid.style.gridTemplateRows = `repeat(${this.#rows}, ${rowHeight}px)`;
        grid.style.gridTemplateColumns = `repeat(${this.#cols}, 1fr)`;

        for (let id = 0; id < this.#totalCards; id++) {
            const card = this.#cards[id];
            let cardElement = card.draw();
            grid.appendChild(cardElement);
        }
    }

    closeOpenCards = (currentCard) => {
        for (const card of this.#cards) {
            if (card !== currentCard && card.volteada && !card.resuelta) {
                card.volteada = false;
            }
        }
    }

    checkMatch = (currentCard) => {
        if (this.#prevElement && this.#prevElement !== currentCard) {
            const prevCard = this.#prevElement.element.querySelector('.card');
            prevCard.style.border = 'none';
            const prevId = prevCard.id;

            if (currentCard.color === this.#cards[prevId].color) {
                currentCard.resuelta = true;
                this.#cards[prevId].resuelta = true;
                currentCard.element.style.cursor = 'inherit';
                this.#cards[prevId].element.style.cursor = 'inherit';
                this.#cards[prevId].volteada = true;


                const cardsStorage = getStorage('parejas_cards');
                cardsStorage[currentCard.id].resuelta = cardsStorage[this.#cards[prevId].id].resuelta = true;
                setStorage('parejas_cards', cardsStorage);

                let resueltas = 0;
                for (const card of this.#cards) {
                    if (card.resuelta) {
                        resueltas++;
                    }
                }
                // Fin Juego
                if (this.checkFinJuego()) {
                    this.#timer.stop();
                    this.#finJuego = true;
                    const settingsStorage = getStorage('parejas_settings');
                    settingsStorage.finjuego = true;
                    setStorage('parejas_settings', settingsStorage);
                    this.checkRecords();
                }
            }
            this.#prevElement = null;
        }
    }

    checkRecords = () => {
        let recordsStorage = getStorage('parejas_records') || {};
        const arrNewTime = this.#timer.getTime();
        const newTime = ((arrNewTime[0] * 60 + arrNewTime[1]) * 60 + arrNewTime[2]) * 100 + arrNewTime[3];
        const currentRecord = recordsStorage[this.#totalCards];
        if (!currentRecord || newTime < currentRecord) {
            // Nuevo récord
            recordsStorage[this.#totalCards] = newTime;
            setStorage('parejas_records', recordsStorage);
            this.displayRecords();
            document.getElementById('msgnewrecord').style.display = 'block';
        }
    }

    displayRecords = () => {
        let recordsStorage = getStorage('parejas_records');
        if (recordsStorage) {
            const containerRecords = document.getElementById('records');
            if (!containerRecords.style.display) {
                containerRecords.style.display = 'block';
            }
            let divRecords = containerRecords.querySelector('#records > div:last-of-type');
            divRecords.textContent = '';
            const div1 = document.createElement('div');
            div1.textContent = 'Número de cartas:';
            divRecords.append(div1);
            const div2 = document.createElement('div');
            div2.textContent = 'tiempo:';
            divRecords.append(div2);
            for (const [key, value] of Object.entries(recordsStorage)) {
                const div1 = document.createElement('div');
                div1.classList.add('titlerecord');
                div1.append(key);
                divRecords.append(div1);
                const div2 = document.createElement('div');
                div2.classList.add('valurecord');
                div2.append(arrayToTime(value));
                divRecords.append(div2);
            }
        }
    }

    checkFinJuego = () => {
        let resueltas = this.#cards.reduce((cont, card) => card.resuelta ? cont + 1 : cont, 0);
        return resueltas === this.#totalCards;
    }

    toFront = (currentCard) => {
        for (const card of this.#cards) {
            card.element.style.zIndex = 0;
        }
        currentCard.element.style.zIndex = 1;
    }

    recolocar = () => {
        for (const card of this.#cards) {
            card.element.style.left = 0
            card.element.style.top = 0
        }
    }

    initListeners = () => {
        document.getElementById('reiniciar').addEventListener('click', () => {
            this.#finJuego = false;
            this.#timer.reset();
            Game.resetStorage();
            for (const card of this.#cards) {
                card.resuelta = false;
                card.volteada = false;
                card.element.style.cursor = 'pointer';
            }

            // Reiniciar nodo prompot
            this.#rows = 3;
            this.#cols = 4;
            document.getElementById('errormessage').style.opacity = 0;
            document.getElementById('rowsvalue').textContent = this.#rows;
            document.getElementById('colsvalue').textContent = this.#cols;
            document.getElementById('rows').value = this.#rows;
            document.getElementById('cols').value = this.#cols;
            document.getElementById('promptbox').style.display = 'inherit';

        })

        document.getElementById('btnNewRecord').addEventListener('click', (e) => {
            document.getElementById('msgnewrecord').style.display = 'none';
        })

        document.addEventListener('mousedown', this.handlerMouseDown);
        document.addEventListener('touchstart', this.handlerMouseDown);
        document.addEventListener('mousemove', this.handlerMouseMove);
        document.addEventListener('touchmove', this.handlerMouseMove, { passive: false });
    }

    handlerMouseDown = (e) => {
        this.#xIni = e.clientX;
        this.#yIni = e.clientY;
    }

    handlerMouseMove = (e) => {
        e.preventDefault();

        if (this.#currentCard) {
            if (this.#currentCard.resuelta) return;
            if (this.#dragging && this.#currentCard.volteada) {
                const element = this.#currentCard.element;
                element.style.left = (e.clientX - this.#xIni) + 'px';
                element.style.top = (e.clientY - this.#yIni) + 'px';
                element.style.pointerEvents = 'none';
                const elementBellow = document.elementFromPoint(e.clientX, e.clientY).parentElement;
                if (elementBellow.classList.contains('card')) {
                    if (this.#prevElement) {
                        const card = this.#prevElement.element.querySelector('.card');
                        if (elementBellow !== card) {
                            card.style.border = 'none';
                        }
                    }
                    this.#prevElement = this.#cards[elementBellow.id];
                    elementBellow.style.border = 'dashed yellow'
                }
                element.style.pointerEvents = 'auto';
            }
        }
    }
}

export default Game;