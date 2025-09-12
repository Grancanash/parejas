class Tarjeta {
    #id;
    #color;
    #element;
    #resuelta;
    #volteada;

    constructor(id, color, game) {
        this.#id = id;
        this.#color = color;
        this.game = game;
        this.#resuelta = this.#volteada = false;
    }

    get id() {
        return this.#id;
    }

    get color() {
        return this.#color;
    }

    get volteada() {
        return this.#volteada;
    }

    set volteada(valor) {
        this.#volteada = valor;
    }

    get resuelta() {
        return this.#resuelta;
    }

    set resuelta(valor) {
        return this.#resuelta = valor;
    }

    get element() {
        return this.#element;
    }

    draw = () => {
        const divFront = document.createElement('div');
        divFront.classList.add('face', 'front');
        const divBack = document.createElement('div');
        divBack.classList.add('face', 'back');
        if (this.#volteada) divBack.style.backgroundColor = this.#color;
        const divCard = document.createElement('div');
        divCard.id = this.#id;
        divCard.dataset.color = this.#color;
        divCard.classList.add('card');
        if (this.#volteada) divCard.classList.add('flipped');
        divCard.append(divFront);
        divCard.append(divBack);
        const element = document.createElement('div');
        element.classList.add('card-container');
        if (this.#volteada) element.style.cursor = 'inherit';
        element.append(divCard);

        this.#element = element;
        this.initListeners();
        return element;
    }

    voltear = () => {
        const card = this.#element.querySelector('.card');

        if (!this.#volteada) {
            if (this.game.abriendo) return;
            this.game.abriendo = true;
            card.querySelector('.back').style.backgroundColor = this.#color;
            card.classList.toggle('flipped');
            card.addEventListener('transitionend', e => {
                this.game.abriendo = false;
                this.#volteada = true;
            }, { once: true });
        } else {
            if (!this.game.reiniciando && this.game.cerrando) return;
            this.game.cerrando = true;
            if (this.#resuelta) {
                this.game.cerrando = false;
                return;
            }
            card.classList.toggle('flipped');
            card.addEventListener('transitionend', e => {
                this.game.cerrando = false;
                this.#volteada = false;
                if (this.game.reiniciando) {
                    this.game.checkFlips(this);
                }
            }, { once: true });
        }

    }

    initListeners = () => {
        this.#element.addEventListener('mousedown', () => {
            this.game.dragging = true;
            this.game.toFront(this);
            this.game.timerStart();
            this.game.currentCard = this;
        })
        this.#element.addEventListener('mouseup', () => {
            this.game.dragging = false;
            this.game.checkFlips(this);
            this.game.recolocar();
            this.game.checkMatch(this);
            this.voltear();
        })
    }
}

export default Tarjeta;
