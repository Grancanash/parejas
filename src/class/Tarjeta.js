class Tarjeta extends EventTarget {
    #id;
    #color;
    #element;
    #resuelta;
    #volteada;

    constructor(id, color, game) {
        super();
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
        if (valor !== this.#volteada) {
            this.#volteada = valor;
            this.dispatchEvent(new CustomEvent("cambioVolteada", {
                'detail': { 'valor': valor }
            }));
        }
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
        if (this.volteada) divBack.style.backgroundColor = this.#color;
        const divCard = document.createElement('div');
        divCard.id = this.#id;
        divCard.dataset.color = this.#color;
        divCard.classList.add('card');
        if (this.volteada) divCard.classList.add('flipped');
        divCard.append(divFront);
        divCard.append(divBack);
        const element = document.createElement('div');
        element.classList.add('card-container');
        if (this.volteada) element.style.cursor = 'inherit';
        element.append(divCard);
        this.#element = element;
        this.initListeners();
        return element;
    }

    openCard = () => {
        const card = this.#element.querySelector('.card');
        card.querySelector('.back').style.backgroundColor = this.#color;
        card.classList.toggle('flipped');
        card.addEventListener('transitionend', e => {
        }, { once: true });
    }

    closeCard = () => {
        const card = this.#element.querySelector('.card');
        card.classList.toggle('flipped');
        card.addEventListener('transitionend', e => {
        }, { once: true });
    }

    initListeners = () => {
        this.#element.addEventListener('mousedown', this.handlerMouseDown)
        this.#element.addEventListener('touchstart', this.handlerMouseDown)
        this.#element.addEventListener('mouseup', this.handlerMouseUp)
        this.#element.addEventListener('touchend', this.handlerMouseUp)
        this.addEventListener("cambioVolteada", e => {
            if (e.detail.valor) this.openCard();
            else this.closeCard();
        });
    }

    handlerMouseDown = () => {
        this.game.dragging = true;
        this.game.toFront(this);
        this.game.timerStart();
        this.game.currentCard = this;
    }

    handlerMouseUp = () => {
        this.game.dragging = false;
        this.game.closeOpenCards(this);
        this.game.recolocar();
        this.game.checkMatch(this);
        if (!this.resuelta) {
            if (this.volteada) {
                this.volteada = false;
            } else {
                this.volteada = true;
            }
        }
    }
}

export default Tarjeta;
