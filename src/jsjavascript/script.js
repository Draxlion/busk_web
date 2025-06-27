// Meninos, vou adicionar comentários pra nos ajudar a entender o que to fazendo kkkk

// Animações globais

ScrollReveal().reveal('#cta', {
    origin: 'left',
    duration: 2000,
    distance: '20%'
});

ScrollReveal().reveal('.dish', {
    origin: 'left',
    duration: 2000,
    distance: '20%'
});

ScrollReveal().reveal('#testimonals_image', {
    origin: 'left',
    duration: 1000,
    distance: '20%'
});

ScrollReveal().reveal('.feedback', {
    origin: 'right',
    duration: 2000,
    distance: '20%'
});

ScrollReveal().reveal('#primary', {
    origin: 'left',
    duration: 2000,
    distance: '20%'
});

// ------------------------------------------------------------------------------------

//Funcionalidades do carrinho (Botões e tals)
// NOTE: Combinei os dois $(document).ready para evitar duplicação de variáveis e lógica.

$(document).ready(function () {
    const cartSidebar = $('.cart-sidebar');
    const openCartButton = $('#open-cart-sidebar');
    const closeCartButton = $('#close-cart-sidebar');
    const cartItemsList = $('.cart-items');
    const cartTotalValue = $('#cart-total-value');
    const pizzaItemAddButtons = $('.boxs_price button#pizza_item_add'); // Seletor para os botões de adicionar

    const cartModal = $('#cartModal');
    const closeModalButton = $('.close-button');
    const modalItemName = $('#modal-item-name');
    const pizzaSizesContainer = $('#pizza-sizes');
    const sizeButtons = $('.size-button');
    const selectedPizzaSizeInput = $('#selected-pizza-size');
    const selectedSizeMultiplierInput = $('#selected-size-multiplier');
    const additionalOptions = $('#additional-options input[type="checkbox"]');
    const itemObservationsInput = $('#item-observations');
    const addToCartWithOptionsButton = $('#add-to-cart-with-options');
    const cancelAddToCartButton = $('#cancel-add-to-cart');
    const checkoutButton = $('#checkout-button'); // Declaração
    const paymentModal = $('#paymentModal');
    const paymentCloseButton = $('.payment-close-button');

    let cart = []; // Array para armazenar os itens do carrinho
    let currentItem = null; // Para guardar os detalhes do item atual no modal


    // abrir o sidebar do carrinho
    openCartButton.on('click', function () {
        cartSidebar.addClass('open');
    });

    // fechar o sidebar do carrinho
    closeCartButton.on('click', function () {
        cartSidebar.removeClass('open');
    });

    // Event listener para os botões de "Adicionar ao Carrinho" para abrir o modal
    pizzaItemAddButtons.on('click', function () {
        const box = $(this).closest('.boxs');
        const itemName = box.find('.boxs_title').text();
        const itemBasePriceText = box.find('.boxs_price h4').text().replace('R$ ', '').replace(',', '.');
        const itemBasePrice = parseFloat(itemBasePriceText);
        const itemImageSrc = box.find('.boxs_image').attr('src');

        currentItem = {
            name: itemName,
            basePrice: itemBasePrice,
            image: itemImageSrc
        };

        modalItemName.text(itemName);
        cartModal.css('display', 'block');

        // Resetar modal ao abrir
        sizeButtons.removeClass('active');
        pizzaSizesContainer.find('[data-size="grande"]').addClass('active'); // Define Grande como padrão
        selectedPizzaSizeInput.val('grande');
        selectedSizeMultiplierInput.val('1.05'); // Ajuste para o multiplicador padrão de "grande"
        additionalOptions.prop('checked', false);
        itemObservationsInput.val('');
    });

    // Event listener para os botões de tamanho
    sizeButtons.on('click', function () {
        sizeButtons.removeClass('active');
        $(this).addClass('active');
        selectedPizzaSizeInput.val($(this).data('size'));
        selectedSizeMultiplierInput.val($(this).data('multiplier'));
    });

    // fechar o modal de detalhes do item
    closeModalButton.on('click', function () {
        cartModal.css('display', 'none');
        currentItem = null;
    });

    cancelAddToCartButton.on('click', function () {
        cartModal.css('display', 'none');
        currentItem = null;
    });

    //adicionar o item ao carrinho com as opções selecionadas
    addToCartWithOptionsButton.on('click', function () {
        if (currentItem) {
            const size = selectedPizzaSizeInput.val();
            const sizeMultiplier = parseFloat(selectedSizeMultiplierInput.val());
            const selectedAdditionals = [];
            let additionalPrice = 0;
            const observations = itemObservationsInput.val();

            additionalOptions.each(function () {
                if ($(this).is(':checked')) {
                    selectedAdditionals.push($(this).val());
                    const priceText = $(this).parent().text().match(/\(+R\$ (\d+\,\d+)\)/);
                    if (priceText && priceText[1]) {
                        additionalPrice += parseFloat(priceText[1].replace(',', '.'));
                    }
                }
            });
            const finalPrice = currentItem.basePrice * sizeMultiplier + additionalPrice;

            const cartItem = {
                name: currentItem.name,
                basePrice: currentItem.basePrice,
                finalPrice: parseFloat(finalPrice.toFixed(2)), // Preço final
                image: currentItem.image,
                size: size,
                additionals: selectedAdditionals.sort(), // Garante ordem para comparação
                observations: observations,
                quantity: 1
            };

            // Tenta encontrar um item idêntico no carrinho
            const existingItem = cart.find(item =>
                item.name === cartItem.name &&
                item.size === cartItem.size &&
                JSON.stringify(item.additionals) === JSON.stringify(cartItem.additionals) &&
                item.observations === cartItem.observations
            );

            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push(cartItem);
            }

            updateCartDisplay();
            cartModal.css('display', 'none');
            currentItem = null;
        }
    });

    // remover um item do carrinho
    function removeItemFromCart(itemName, itemSize, itemAdditionals, itemObservations) {
        cart = cart.filter(item => !(
            item.name === itemName &&
            item.size === itemSize &&
            JSON.stringify(item.additionals.sort()) === JSON.stringify(itemAdditionals.sort()) && // Compara arrays ordenados
            item.observations === itemObservations
        ));
        updateCartDisplay();
    }

    // atualizar a exibição do carrinho
    function updateCartDisplay() {
        cartItemsList.empty();
        let total = 0;

        if (cart.length === 0) {
            cartItemsList.html('<p class="empty-cart-message">Seu carrinho está vazio.</p>');
        } else {
            cart.forEach(item => {
                const listItem = $('<li>');
                let details = `<span>Tamanho: ${item.size}</span>`;
                if (item.additionals && item.additionals.length > 0) {
                    details += `<br><span>Adicionais: ${item.additionals.join(', ')}</span>`;
                }
                if (item.observations) {
                    details += `<br><span>Obs: ${item.observations}</span>`;
                }

                listItem.html(`
                    <img src="${item.image}" alt="${item.name}">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        ${details}
                        <span>R$ ${item.finalPrice.toFixed(2)} x ${item.quantity}</span>
                    </div>
                    <button class="remove-item"
                            data-item-name="${item.name}"
                            data-item-size="${item.size}"
                            data-item-additionals='${JSON.stringify(item.additionals)}'
                            data-item-observations="${item.observations}">
                        Remover
                    </button>
                `);
                cartItemsList.append(listItem);
                total += item.finalPrice * item.quantity;
            });
        }

        cartTotalValue.text(total.toFixed(2));

        // Adiciona event listener para os botões de remover APÓS serem adicionados ao DOM
        $('.remove-item').on('click', function () {
            const itemNameToRemove = $(this).data('item-name');
            const itemSizeToRemove = $(this).data('item-size');
            const itemAdditionalsToRemove = JSON.parse($(this).data('item-additionals'));
            const itemObservationsToRemove = $(this).data('item-observations');
            removeItemFromCart(itemNameToRemove, itemSizeToRemove, itemAdditionalsToRemove, itemObservationsToRemove);
        });
    }

    //exibição inicial do carrinho
    updateCartDisplay();


    // metodo de pagamento
    // Abrir o modal de pagamento ao clicar em "Finalizar Compra"
    checkoutButton.on('click', function () {
        if (cart.length > 0) {
            paymentModal.css('display', 'block');
        } else {
            alert("Seu carrinho está vazio. Adicione itens para finalizar a compra.");
        }
    });

    // Fechar o modal de pagamento ao clicar no botão de fechar
    paymentCloseButton.on('click', function () {
        paymentModal.css('display', 'none');
    });

    // Fechar o modal de pagamento ao clicar fora dele
    $(window).on('click', function (event) {
        if (event.target == paymentModal[0]) {
            paymentModal.css('display', 'none');
        }
    });

    //exibição
    updateCartDisplay();
});


// pagamento via pix
document.addEventListener('DOMContentLoaded', function () {
    const paymentModal = document.getElementById('paymentModal');
    const pixModal = document.getElementById('pixModal');

    const closePaymentBtn = document.querySelector('.payment-close-button');
    const closePixBtn = document.querySelector('.pix-close-button');
    const pixBtn = document.querySelector('.pix');
    const finalizarPedidoBtn = document.getElementById('checkout-button');

    // Abre o modal de formas de pagamento ao clicar no botão "Finalizar Pedido"
    finalizarPedidoBtn.onclick = function () {
        paymentModal.style.display = 'block';
    };

    // Abre o modal de PIX
    pixBtn.onclick = function () {
        paymentModal.style.display = 'none';
        pixModal.style.display = 'block';
    };

    // Fechar modais
    closePaymentBtn.onclick = function () {
        paymentModal.style.display = 'none';
    };

    closePixBtn.onclick = function () {
        pixModal.style.display = 'none';
    };

    // Fechar modal ao clicar fora
    window.onclick = function (event) {
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        } else if (event.target === pixModal) {
            pixModal.style.display = 'none';
        }
    };
});


// ------------------------------------------------------------------------------------


// Modificações header:

// modificações home:

const homeSwiper = new Swiper('.home-background-carousel', {
    loop: true, // Para repetição contínua
    autoplay: {
        delay: 5000, // Troca de imagem a cada 5 segundos
        disableOnInteraction: false, // Não para o autoplay se o usuário interagir
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});

// Modificações catalogo:

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('#menu_filters .filter-btn');
    const productContainer = document.getElementById('allbox');
    const productCards = Array.from(productContainer.querySelectorAll('.boxs'));

    // Novo elemento: Campo de pesquisa
    const searchInput = document.getElementById('search_input'); // ID que vamos adicionar ao HTML

    let currentFilter = 'all';
    let currentSort = 'default';
    let searchTerm = ''; // Nova variável para armazenar o termo de pesquisa

    // --- Função para aplicar filtros, ordenação e pesquisa ---
    function applyFiltersAndSort() {
        let processedProducts = productCards;

        // 1. Pesquisar (aplicado primeiro para reduzir o conjunto de dados)
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            processedProducts = processedProducts.filter(card => {
                const description = card.querySelector('.boxs_description').textContent.toLowerCase();
                // Adicione a verificação do título também
                const title = card.querySelector('.boxs_title').textContent.toLowerCase();
                return description.includes(lowerCaseSearchTerm) || title.includes(lowerCaseSearchTerm);
            });
        }

        // 2. Filtrar
        if (currentFilter !== 'all') {
            processedProducts = processedProducts.filter(card => {
                return card.dataset.category === currentFilter;
            });
        }

        // 3. Ordenar
        processedProducts.sort((a, b) => {
            if (currentSort === 'default') {
                return 0;
            } else if (currentSort === 'price-asc') {
                const priceA = parseFloat(a.dataset.price);
                const priceB = parseFloat(b.dataset.price);
                return priceA - priceB;
            } else if (currentSort === 'price-desc') {
                const priceA = parseFloat(a.dataset.price);
                const priceB = parseFloat(b.dataset.price);
                return priceB - priceA;
            } else if (currentSort === 'popularity') {
                const popA = parseInt(a.dataset.popularity);
                const popB = parseInt(b.dataset.popularity);
                return popB - popA;
            } else if (currentSort === 'newest') {
                const newestA = a.dataset.newest === 'true';
                const newestB = b.dataset.newest === 'true';
                if (newestA === newestB) return 0;
                if (newestA && !newestB) return -1;
                if (!newestA && newestB) return 1;
                return 0;
            } else if (currentSort === 'alpha-asc') { // Nova ordenação: alfabética crescente
                const descriptionA = a.querySelector('.boxs_description').textContent.toLowerCase();
                const descriptionB = b.querySelector('.boxs_description').textContent.toLowerCase();
                return descriptionA.localeCompare(descriptionB);
            } else if (currentSort === 'alpha-desc') { // Nova ordenação: alfabética decrescente
                const descriptionA = a.querySelector('.boxs_description').textContent.toLowerCase();
                const descriptionB = b.querySelector('.boxs_description').textContent.toLowerCase();
                return descriptionB.localeCompare(descriptionA);
            }
            return 0;
        });

        // Limpa o contêiner e adiciona os produtos processados
        productContainer.innerHTML = '';
        if (processedProducts.length === 0) {
            // Mensagem quando nenhum produto é encontrado
            const noResultsMessage = document.createElement('p');
            noResultsMessage.textContent = "Nenhum produto encontrado com os critérios de busca ou filtro.";
            noResultsMessage.style.textAlign = 'center';
            noResultsMessage.style.fontSize = '1.2rem';
            noResultsMessage.style.marginTop = '30px';
            noResultsMessage.style.color = 'var(--text-secondary)'; // Usando variável CSS
            productContainer.appendChild(noResultsMessage);
        } else {
            processedProducts.forEach(card => {
                productContainer.appendChild(card);
            });
        }
    }

    // --- Adicionar event listeners para os botões de filtro e ordenação ---
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const parentGroup = this.closest('.filter-group');
            parentGroup.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });

            this.classList.add('active');

            if (this.dataset.filter) {
                currentFilter = this.dataset.filter;
            } else if (this.dataset.sort) {
                currentSort = this.dataset.sort;
            }
            applyFiltersAndSort();
        });
    });

    // --- Event listener para o campo de pesquisa ---
    if (searchInput) { // Verifica se o input de pesquisa existe
        searchInput.addEventListener('input', function() {
            searchTerm = this.value; // Pega o valor digitado
            applyFiltersAndSort(); // Aplica a pesquisa
        });
    }

    // Chama a função pela primeira vez para exibir os produtos iniciais
    applyFiltersAndSort();
});

// modificações feedbacks:

document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.getElementById('testimonials_carousel');
    const feedbacksContainer = document.getElementById('feedbacks');
    let feedbackCards = document.querySelectorAll('#feedbacks .feedback'); // Usar 'let' para poder reatribuir
    let cardWidth = 0; // Inicializar com 0

    function updateCardWidth() {
        if (feedbackCards.length > 0) {
            const card = feedbackCards.item(0);
            const style = window.getComputedStyle(card);
            const marginRight = parseFloat(style.marginRight);
            cardWidth = card.offsetWidth + marginRight;
        } else {
            cardWidth = 0;
        }
    }

    // Chamar na inicialização
    updateCardWidth();

    // Chamar novamente ao redimensionar a janela
    window.addEventListener('resize', updateCardWidth);

    let currentIndex = 0;

    function scrollToCard(index) {
        // Garanta que o índice não vá além dos limites
        if (index < 0) index = 0;
        if (index >= feedbackCards.length) index = feedbackCards.length -1;

        const newPosition = -index * cardWidth;
        feedbacksContainer.style.transform = `translateX(${newPosition}px)`;
        currentIndex = index;
    }

    function nextSlide() {
        if (currentIndex < feedbackCards.length - 1) {
            scrollToCard(currentIndex + 1);
        } else {
            scrollToCard(0); // Volta para o primeiro
        }
    }

    function prevSlide() { // Adicione esta função para o botão 'anterior'
        if (currentIndex > 0) {
            scrollToCard(currentIndex - 1);
        } else {
            scrollToCard(feedbackCards.length - 1); // Volta para o último
        }
    }

    // Rolagem automática
    let autoScrollInterval = setInterval(nextSlide, 8000); // Guarde o intervalo em uma variável

    // Opcional: Pausar/Retomar no hover para melhor UX
    carousel.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
    carousel.addEventListener('mouseleave', () => {
        autoScrollInterval = setInterval(nextSlide, 5000);
    });

    // Controles de navegação (botões) - Certifique-se de que o CSS para .carousel-control está presente
    const prevButton = document.createElement('button');
    prevButton.classList.add('carousel-control', 'prev');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.addEventListener('click', prevSlide); // Usa a nova função prevSlide

    const nextButton = document.createElement('button');
    nextButton.classList.add('carousel-control', 'next');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.addEventListener('click', nextSlide);

    carousel.appendChild(prevButton);
    carousel.appendChild(nextButton);

    // ... (Seu código para adicionar estilos inline para .carousel-control, ou mova para um arquivo CSS)
    // Recomendo fortemente mover esses estilos para testimonials.css para melhor organização.
    const style = document.createElement('style');
    style.textContent = `
        .carousel-control {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(0, 0, 0, 0.5); /* Fundo sutil */
            border: none;
            border-radius: 50%; /* Botões redondos */
            width: 40px; /* Tamanho do botão */
            height: 40px;
            display: flex; /* Para centralizar o ícone */
            align-items: center;
            justify-content: center;
            font-size: 1.2rem; /* Tamanho do ícone */
            color: var(--highlight-color); /* Usando variável de destaque */
            cursor: pointer;
            z-index: 10;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        .carousel-control:hover {
            background-color: var(--highlight-color); /* Usando variável de destaque */
            color: var(--text-dark-contrast); /* Texto escuro no hover */
        }
        .carousel-control.prev {
            left: 10px;
        }
        .carousel-control.next {
            right: 10px;
        }
        .carousel-control i {
            font-size: 1.5rem; /* Ajuste o tamanho do ícone Font Awesome */
        }
        #testimonials_carousel {
            position: relative; /* Essencial para posicionar os controles */
        }
    `;
    document.head.appendChild(style);


});

// modificações maps:

document.addEventListener('DOMContentLoaded', function() {
    // --- LÓGICA DO CARROSSEL DE TESTEMUNHOS (mantenha o que já fizemos) ---
    // ... (Seu código do carrossel de testimonials aqui) ...

    // --- LÓGICA DA GALERIA DE FOTOS (LIGHTBOX) ---
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.close-btn');

    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            lightbox.style.display = 'flex'; // Exibe o lightbox como flex para centralizar
            lightboxImg.src = this.dataset.fullSrc; // Pega a URL da imagem grande
            document.body.style.overflow = 'hidden'; // Impede a rolagem do corpo
        });
    });

    closeBtn.addEventListener('click', function() {
        lightbox.style.display = 'none'; // Oculta o lightbox
        document.body.style.overflow = 'auto'; // Restaura a rolagem do corpo
    });

    // Fechar lightbox clicando fora da imagem
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'flex') {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // --- LÓGICA DO CALCULADOR DE FRETE (Exemplo Simples) ---
    const cepInput = document.getElementById('cep-input');
    const calculateFreightBtn = document.getElementById('calculate-freight-btn');
    const freightResult = document.getElementById('freight-result');

    // Máscara para CEP (XX.XXX-XXX)
    cepInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        value = value.replace(/^(\d{5})(\d)/, '$1-$2'); // Adiciona o hífen
        e.target.value = value;
    });

    calculateFreightBtn.addEventListener('click', function() {
        const cep = cepInput.value.replace(/\D/g, ''); // Limpa o CEP
        if (cep.length === 8) {
            // Simulação de cálculo de frete
            // Em um ambiente real, você faria uma requisição AJAX para uma API de CEP/Frete
            let freightCost = 0;
            if (cep.startsWith('01') || cep.startsWith('02')) { // Região de SP
                freightCost = 15.50;
            } else if (cep.startsWith('2') || cep.startsWith('3')) { // Região Sudeste
                freightCost = 25.00;
            } else {
                freightCost = 40.00;
            }
            freightResult.textContent = `Frete: R$ ${freightCost.toFixed(2)}`;
            freightResult.style.color = 'var(--highlight-color)'; // Usando variável CSS
        } else {
            freightResult.textContent = 'CEP inválido. Digite 8 dígitos.';
            freightResult.style.color = 'var(--error-color)'; // Usando variável CSS
        }
    });

    // Opcional: Adicionar um efeito de "loading" no botão
    calculateFreightBtn.addEventListener('click', function() {
        const originalText = calculateFreightBtn.innerHTML;
        calculateFreightBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculando...';
        calculateFreightBtn.disabled = true;

        setTimeout(() => { // Simula um tempo de resposta da API
            // ... (sua lógica de cálculo de frete) ...
            calculateFreightBtn.innerHTML = originalText;
            calculateFreightBtn.disabled = false;
        }, 1500); // 1.5 segundos de "loading"
    });
});


// ------------------------------------------------------------------------------------
// Modificações tema:

document.addEventListener('DOMContentLoaded', () => {
    // Seleciona TODOS os botões com a classe 'theme-toggle-btn'
    const themeToggleButtons = document.querySelectorAll('.theme-toggle-btn');
    const body = document.body;

    // Função para aplicar o tema inicial
    function applyInitialTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light-mode') {
            body.classList.add('light-mode');
            updateToggleIcons(true); // true para light-mode
        } else {
            // Se não tiver nada salvo ou for 'dark-mode' (padrão)
            body.classList.remove('light-mode');
            updateToggleIcons(false); // false para dark-mode
        }
    }

    // Função para atualizar os ícones de TODOS os botões de tema
    function updateToggleIcons(isLightMode) {
        themeToggleButtons.forEach(button => {
            const icon = button.querySelector('i');
            if (icon) { // Verifica se o ícone existe
                if (isLightMode) {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                    icon.classList.remove('fas'); // Remove fas se presente (compatibilidade)
                    icon.classList.add('fa-solid'); // Adiciona fa-solid (Font Awesome 6)
                } else {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                    icon.classList.remove('fas'); // Remove fas se presente (compatibilidade)
                    icon.classList.add('fa-solid'); // Adiciona fa-solid (Font Awesome 6)
                }
            }
        });
    }

    // Adiciona event listener para CADA botão de tema
    themeToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            const isLightMode = body.classList.contains('light-mode');
            localStorage.setItem('theme', isLightMode ? 'light-mode' : 'dark-mode');
            updateToggleIcons(isLightMode); // Atualiza os ícones de todos os botões
        });
    });

    applyInitialTheme();


});