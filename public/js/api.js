// API Configuration
const API_BASE = '/api';

// API Helper Functions
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Network error' };
        }
    }

    // Auth API
    static async login(email, password) {
        return this.request('/auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    static async register(userData) {
        return this.request('/auth.php?action=register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async logout() {
        return this.request('/auth.php?action=logout');
    }

    static async checkAuth() {
        return this.request('/auth.php?action=check');
    }

    // Products API
    static async getAllProducts(limit = 20, offset = 0) {
        return this.request(`/products.php?action=all&limit=${limit}&offset=${offset}`);
    }

    static async getFeaturedProducts(limit = 8) {
        return this.request(`/products.php?action=featured&limit=${limit}`);
    }

    static async getProduct(id) {
        return this.request(`/products.php?action=single&id=${id}`);
    }

    static async searchProducts(keyword, categoryId = null, limit = 20) {
        let url = `/products.php?action=search&keyword=${encodeURIComponent(keyword)}&limit=${limit}`;
        if (categoryId) url += `&category_id=${categoryId}`;
        return this.request(url);
    }

    // Cart API
    static async addToCart(productId, quantity = 1, size = '', color = '') {
        return this.request('/cart.php?action=add', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity, size, color })
        });
    }

    static async getCart() {
        return this.request('/cart.php?action=get');
    }

    static async updateCartItem(cartId, quantity) {
        return this.request('/cart.php?action=update', {
            method: 'PUT',
            body: JSON.stringify({ cart_id: cartId, quantity })
        });
    }

    static async removeFromCart(cartId) {
        return this.request(`/cart.php?action=remove&cart_id=${cartId}`, {
            method: 'DELETE'
        });
    }

    static async clearCart() {
        return this.request('/cart.php?action=clear');
    }

    static async getCartCount() {
        return this.request('/cart.php?action=count');
    }
}

// User Management
class UserManager {
    constructor() {
        this.currentUser = null;
        this.checkAuthStatus();
    }

    async checkAuthStatus() {
        const response = await API.checkAuth();
        if (response.success && response.logged_in) {
            this.currentUser = response.user;
            this.updateUI();
        }
    }

    async login(email, password) {
        const response = await API.login(email, password);
        if (response.success) {
            this.currentUser = response.user;
            this.updateUI();
            this.showMessage('Login successful!', 'success');
        } else {
            this.showMessage(response.message, 'error');
        }
        return response;
    }

    async register(userData) {
        const response = await API.register(userData);
        if (response.success) {
            this.showMessage('Registration successful! Please login.', 'success');
        } else {
            this.showMessage(response.message, 'error');
        }
        return response;
    }

    async logout() {
        const response = await API.logout();
        if (response.success) {
            this.currentUser = null;
            this.updateUI();
            this.showMessage('Logged out successfully!', 'success');
        }
        return response;
    }

    updateUI() {
        const userIcon = document.querySelector('#user-icon');
        const userBox = document.querySelector('.user');
        
        if (this.currentUser) {
            // Update user box to show profile instead of login
            userBox.innerHTML = `
                <h2>Welcome, ${this.currentUser.first_name}!</h2>
                <div class="user-menu">
                    <a href="#" onclick="userManager.showProfile()">My Profile</a>
                    <a href="#" onclick="userManager.showOrders()">My Orders</a>
                    <a href="#" onclick="userManager.logout()">Logout</a>
                </div>
            `;
        } else {
            // Show login form
            userBox.innerHTML = `
                <h2>Login Now</h2>
                <form onsubmit="userManager.handleLogin(event)">
                    <input type="email" name="email" placeholder="Your Email..." required>
                    <input type="password" name="password" placeholder="Password" required>
                    <input type="submit" value="Login" class="Login-btn">
                </form>
                <p>Forget Password <a href="#">Reset Now</a></p>
                <p>Don't have an account <a href="#" onclick="userManager.showRegister()">Create one</a></p>
            `;
        }
    }

    handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        this.login(email, password);
    }

    showRegister() {
        const userBox = document.querySelector('.user');
        userBox.innerHTML = `
            <h2>Register</h2>
            <form onsubmit="userManager.handleRegister(event)">
                <input type="text" name="first_name" placeholder="First Name" required>
                <input type="text" name="last_name" placeholder="Last Name" required>
                <input type="text" name="username" placeholder="Username" required>
                <input type="email" name="email" placeholder="Email" required>
                <input type="password" name="password" placeholder="Password" required>
                <input type="tel" name="phone" placeholder="Phone (optional)">
                <input type="submit" value="Register" class="Login-btn">
            </form>
            <p><a href="#" onclick="userManager.updateUI()">Back to Login</a></p>
        `;
    }

    handleRegister(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const userData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone')
        };
        this.register(userData);
    }

    showMessage(message, type) {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Cart Management
class CartManager {
    constructor() {
        this.cartItems = [];
        this.cartCount = 0;
        this.cartTotal = 0;
        this.loadCart();
    }

    async loadCart() {
        const response = await API.getCart();
        if (response.success) {
            this.cartItems = response.items;
            this.cartCount = response.count;
            this.cartTotal = response.total;
            this.updateCartUI();
        }
    }

    async addToCart(productId, quantity = 1, size = '', color = '') {
        const response = await API.addToCart(productId, quantity, size, color);
        if (response.success) {
            this.loadCart();
            userManager.showMessage('Item added to cart!', 'success');
        } else {
            userManager.showMessage(response.message, 'error');
        }
        return response;
    }

    async updateQuantity(cartId, quantity) {
        const response = await API.updateCartItem(cartId, quantity);
        if (response.success) {
            this.loadCart();
        }
        return response;
    }

    async removeItem(cartId) {
        const response = await API.removeFromCart(cartId);
        if (response.success) {
            this.loadCart();
            userManager.showMessage('Item removed from cart!', 'success');
        }
        return response;
    }

    updateCartUI() {
        const cartBox = document.querySelector('.cart');
        const cartIcon = document.querySelector('#cart-icon');

        // Update cart count badge
        let badge = document.querySelector('.cart-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            cartIcon.parentNode.appendChild(badge);
        }
        badge.textContent = this.cartCount;
        badge.style.display = this.cartCount > 0 ? 'block' : 'none';

        // Update cart content
        if (this.cartItems.length === 0) {
            cartBox.innerHTML = '<p>Your cart is empty</p>';
            return;
        }

        let cartHTML = '';
        this.cartItems.forEach(item => {
            const price = item.sale_price || item.price;
            cartHTML += `
                <div class="box" data-cart-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="text">
                        <h3>${item.name}</h3>
                        <span>$${price}</span>
                        <div class="quantity-controls">
                            <button onclick="cartManager.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>x${item.quantity}</span>
                            <button onclick="cartManager.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <i class="bx bxs-trash-alt" onclick="cartManager.removeItem(${item.id})"></i>
                </div>
            `;
        });

        cartHTML += `
            <h2>Total: $${this.cartTotal.toFixed(2)}</h2>
            <a href="#" class="btn" onclick="cartManager.checkout()">Checkout</a>
        `;

        cartBox.innerHTML = cartHTML;
    }

    checkout() {
        if (this.cartItems.length === 0) {
            userManager.showMessage('Your cart is empty!', 'error');
            return;
        }

        if (!userManager.currentUser) {
            userManager.showMessage('Please login to checkout!', 'error');
            return;
        }

        // Redirect to checkout page or show checkout modal
        window.location.href = '/checkout.php';
    }
}

// Product Management
class ProductManager {
    async loadFeaturedProducts() {
        const response = await API.getFeaturedProducts();
        if (response.success) {
            this.displayProducts(response.products, '.product-container');
        }
    }

    async loadNewArrivals() {
        const response = await API.getFeaturedProducts(6);
        if (response.success) {
            this.displayNewArrivals(response.products);
        }
    }

    displayProducts(products, container) {
        const productContainer = document.querySelector(container);
        if (!productContainer) return;

        let productsHTML = '';
        products.forEach(product => {
            const price = product.sale_price || product.price;
            productsHTML += `
                <div class="box" data-product-id="${product.id}">
                    <a href="product-details.php?id=${product.id}">
                        <img src="${product.image}" alt="${product.name}">
                    </a>
                    <div class="content">
                        <h2><a href="product-details.php?id=${product.id}" style="color: inherit; text-decoration: none;">${product.name}</a></h2>
                        <div class="stars">
                            ${this.generateStars(product.avg_rating || 4)}
                        </div>
                        <span>$${price}</span>
                        <i class="bx bx-cart-alt" onclick="cartManager.addToCart(${product.id})"></i>
                    </div>
                </div>
            `;
        });

        productContainer.innerHTML = productsHTML;
    }

    displayNewArrivals(products) {
        const swiperWrapper = document.querySelector('.swiper-wrapper');
        if (!swiperWrapper) return;

        let productsHTML = '';
        products.forEach(product => {
            productsHTML += `
                <div class="swiper-slide box">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="content">
                        <a href="#" class="btn" onclick="cartManager.addToCart(${product.id})">Buy Now</a>
                    </div>
                </div>
            `;
        });

        swiperWrapper.innerHTML = productsHTML;
    }

    generateStars(rating) {
        let starsHTML = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="bx bxs-star"></i>';
        }

        if (hasHalfStar) {
            starsHTML += '<i class="bx bxs-star-half"></i>';
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="bx bx-star"></i>';
        }

        return starsHTML;
    }

    async searchProducts(keyword) {
        const response = await API.searchProducts(keyword);
        if (response.success) {
            this.displayProducts(response.products, '.product-container');
        }
    }
}

// Initialize managers
const userManager = new UserManager();
const cartManager = new CartManager();
const productManager = new ProductManager();

// Load initial data
document.addEventListener('DOMContentLoaded', function() {
    productManager.loadFeaturedProducts();
    productManager.loadNewArrivals();
});

// Search functionality
document.querySelector('.search-box input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const keyword = this.value.trim();
        if (keyword) {
            productManager.searchProducts(keyword);
        }
    }
});