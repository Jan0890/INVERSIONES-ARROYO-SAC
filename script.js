document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const productsContainer = document.getElementById('products-container');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cartIcon = document.querySelector('.cart-icon');
    const closeCartBtn = document.querySelector('.close-cart');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartSidebar = document.querySelector('.cart-sidebar');
    const clearCartBtn = document.querySelector('.clear-cart');
    const checkoutBtn = document.querySelector('.checkout-btn');
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav ul');
    const contactForm = document.getElementById('contact-form');

    // Mostrar productos
    function displayProducts(products) {
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="no-products">No hay productos disponibles en esta categoría.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.imagen}" alt="${product.nombre}">
                </div>
                <div class="product-info">
                    <span class="product-category">${product.categoria}</span>
                    <h3 class="product-title">${product.nombre}</h3>
                    <p class="product-description">${product.descripcion}</p>
                    <div class="product-price">$${product.precio.toFixed(2)}</div>
                    <div class="product-actions">
                        <button class="add-to-cart" data-id="${product.id}">Agregar al carrito</button>
                    </div>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });

        // Event listeners para botones "Agregar al carrito"
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    }

    // Filtrar productos por categoría
    function filterProducts(category) {
        if (category === 'todos') {
            displayProducts(productos);
            return;
        }

        const filteredProducts = productos.filter(product => product.categoria === category);
        displayProducts(filteredProducts);
    }

    // Event listeners para botones de filtro
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            button.classList.add('active');
            // Filtrar productos
            filterProducts(button.dataset.category);
        });
    });

    // Agregar producto al carrito
    function addToCart(e) {
        const productId = parseInt(e.target.dataset.id);
        const product = productos.find(p => p.id === productId);

        if (!product) return;

        // Verificar si el producto ya está en el carrito
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1
            });
        }

        updateCart();
        showCartNotification(product.nombre);
    }

    // Mostrar notificación de producto agregado
    function showCartNotification(productName) {
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${productName} agregado al carrito</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Actualizar carrito
    function updateCart() {
        // Guardar en localStorage
        localStorage.setItem('cart', JSON.stringify(cart));

        // Actualizar contador
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Actualizar sidebar del carrito
        renderCartItems();
    }

    // Renderizar items del carrito
    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Tu carrito está vacío</p>
                    <button class="btn continue-shopping">Seguir comprando</button>
                </div>
            `;

            document.querySelector('.continue-shopping').addEventListener('click', () => {
                closeCart();
            });

            cartTotal.textContent = '$0.00';
            return;
        }

        cartItemsContainer.innerHTML = '';

        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-img">
                    <img src="${item.imagen}" alt="${item.nombre}">
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.nombre}</h4>
                    <div class="cart-item-price">$${(item.precio * item.quantity).toFixed(2)}</div>
                    <button class="cart-item-remove" data-id="${item.id}">Eliminar</button>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        // Calcular total
        const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
        cartTotal.textContent = `$${total.toFixed(2)}`;

        // Event listeners para botones del carrito
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', removeFromCart);
        });

        document.querySelectorAll('.decrease').forEach(button => {
            button.addEventListener('click', decreaseQuantity);
        });

        document.querySelectorAll('.increase').forEach(button => {
            button.addEventListener('click', increaseQuantity);
        });
    }

    // Eliminar producto del carrito
    function removeFromCart(e) {
        const productId = parseInt(e.target.dataset.id);
        const itemIndex = cart.findIndex(item => item.id === productId);

        if (itemIndex !== -1) {
            cart.splice(itemIndex, 1);
            updateCart();
        }
    }

    // Disminuir cantidad
    function decreaseQuantity(e) {
        const productId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === productId);

        if (item && item.quantity > 1) {
            item.quantity -= 1;
            updateCart();
        } else if (item && item.quantity === 1) {
            removeFromCart(e);
        }
    }

    // Aumentar cantidad
    function increaseQuantity(e) {
        const productId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === productId);

        if (item) {
            item.quantity += 1;
            updateCart();
        }
    }

    // Vaciar carrito
    function clearCart() {
        cart.length = 0;
        updateCart();
    }

    // Abrir carrito
    function openCart() {
        cartOverlay.classList.add('active');
        cartSidebar.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Cerrar carrito
    function closeCart() {
        cartOverlay.classList.remove('active');
        cartSidebar.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Toggle menú móvil
    function toggleMenu() {
        navMenu.classList.toggle('active');
    }

    // Validar formulario de contacto
    function validateForm(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            alert('Por favor completa todos los campos requeridos.');
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert('Por favor ingresa un correo electrónico válido.');
            return;
        }

        // Aquí normalmente enviarías el formulario
        alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
        contactForm.reset();
    }

    // Scroll suave para enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Cerrar menú móvil si está abierto
                if (navMenu.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });
    });

    // Cambiar header al hacer scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Event listeners
    cartIcon.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    clearCartBtn.addEventListener('click', clearCart);
    checkoutBtn.addEventListener('click', () => {
        alert('Procediendo al pago. Esta es una demostración.');
    });
    menuToggle.addEventListener('click', toggleMenu);
    contactForm.addEventListener('submit', validateForm);

    // Inicializar
    displayProducts(productos);
    updateCart();

    // Categorías en el footer
    document.querySelectorAll('.footer-col ul li a[data-category]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;

            // Filtrar productos
            filterProducts(category);

            // Actualizar botones activos
            filterButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.filter-btn[data-category="${category}"]`).classList.add('active');

            // Scroll a la sección de productos
            window.scrollTo({
                top: document.getElementById('productos').offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });
});