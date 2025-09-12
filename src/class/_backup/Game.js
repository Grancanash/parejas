import { unsortList } from '../utils/utils';
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
    #abriendo;
    #cerrando;
    #finJuego;
    #reiniciando;

    constructor(timer) {
        this.promptbox();
        this.#xIni = this.#yIni = 0;
        this.#timer = timer;
        this.#dragging = false;
        this.#abriendo = false;
        this.#cerrando = false;
        this.#reiniciando = false;
        this.initListeners();
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

    get abriendo() {
        return this.#abriendo;
    }

    set abriendo(valor) {
        this.#abriendo = valor;
    }

    get cerrando() {
        return this.#cerrando;
    }

    set cerrando(valor) {
        this.#cerrando = valor;
    }

    get reiniciando() {
        return this.#reiniciando;
    }

    static checkStorage = () => {
        if (!sessionStorage.getItem('settings')) {
            sessionStorage.removeItem('settings');
            sessionStorage.removeItem('timer');
            sessionStorage.removeItem('cards');
        };
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
                sessionStorage.setItem('settings', JSON.stringify({ 'rows': rows, 'cols': cols }));
                promptbox.style.display = 'none';
                const colores = unsortList(this.generateColors());
                this.initGrid(colores);
                this.drawCards();
            }
        });

        const settings = JSON.parse(sessionStorage.getItem('settings'));
        if (settings) {
            this.#rows = settings.rows;
            this.#cols = settings.cols;
            this.#totalCards = settings.rows * settings.cols;
            if (settings.finjuego) this.#finJuego = settings.finjuego;
            const cards = JSON.parse(sessionStorage.getItem('cards'));
            const colores = cards.map(card => card.color);
            this.initGrid(colores);
            this.drawCards();
        } else {
            sessionStorage.removeItem('timer');
            sessionStorage.removeItem('cards');
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

        let colores = [];
        for (let color = 0; color < this.#totalCards / 2; color++) {
            colores.push(array[color], array[color]);
        }
        return colores;
    }

    initGrid = (colores) => {
        this.#cards = [];
        let cards = []
        const cardsStorage = JSON.parse(sessionStorage.getItem('cards'));
        for (let id = 0; id < this.#totalCards; id++) {
            const card = new Tarjeta(id, colores[id], this);
            let resuelta = false;
            if (cardsStorage) {
                resuelta = cardsStorage[id].resuelta;
                if (resuelta) {
                    card.resuelta = card.volteada = true;
                }
            }
            this.#cards.push(card);
            cards.push({ id: id, color: colores[id], resuelta: resuelta, volteada: resuelta });
        }
        sessionStorage.setItem('cards', JSON.stringify(cards));
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

    checkFlips = (currentCard) => {
        for (const card of this.#cards) {
            if (card !== currentCard && card.volteada && !card.resuelta) {
                card.voltear();
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
                this.#cards[prevId].voltear();

                const cardsStorage = JSON.parse(sessionStorage.getItem('cards'));
                cardsStorage[currentCard.id].resuelta = cardsStorage[this.#cards[prevId].id].resuelta = true;
                sessionStorage.setItem('cards', JSON.stringify(cardsStorage));

                let resueltas = 0;
                for (const card of this.#cards) {
                    if (card.resuelta) {
                        resueltas++;
                    }
                }
                if (this.checkFinJuego()) {
                    this.#timer.stop();
                    this.#finJuego = true;
                    let settings = JSON.parse(sessionStorage.getItem('settings'));
                    settings.finjuego = true;
                    sessionStorage.setItem('settings', JSON.stringify(settings));
                }
            }
            this.#prevElement = null;
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
            this.#reiniciando = true;
            sessionStorage.removeItem('settings');
            sessionStorage.removeItem('timer');
            sessionStorage.removeItem('cards');

            for (const card of this.#cards) {
                card.resuelta = false;
                if (card.volteada) {
                    card.voltear();
                }
                card.element.style.cursor = 'pointer';
            }
            this.#reiniciando = false;

            // Reiniciar nodo prompot
            document.getElementById('errormessage').style.opacity = 0;
            document.getElementById('rows').value = document.getElementById('rowsvalue').value = this.#rows;
            document.getElementById('cols').value = document.getElementById('colsvalue').value = this.#cols;
            document.getElementById('promptbox').style.display = 'inherit';
        })

        document.addEventListener('mousedown', e => {
            this.#xIni = e.clientX;
            this.#yIni = e.clientY;
        });

        document.addEventListener('mousemove', e => {
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
                        // this.#prevElement = elementBellow;
                        this.#prevElement = this.#cards[elementBellow.id];
                        elementBellow.style.border = 'dashed yellow'
                    }
                    element.style.pointerEvents = 'auto';
                }
            }
        });

    }
}

export default Game;