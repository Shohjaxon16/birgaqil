// BirgaQil — App Core Module

// Toast System
class Toast {
    static container = null;

    static init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    static show(message, type = 'info', duration = 4000) {
        this.init();
        const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;
        this.container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    static success(msg) { this.show(msg, 'success'); }
    static error(msg) { this.show(msg, 'error'); }
    static warning(msg) { this.show(msg, 'warning'); }
    static info(msg) { this.show(msg, 'info'); }
}

// Navbar
function initNavbar() {
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.navbar-links');
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            links.classList.toggle('active');
        });
    }

    // Update navbar based on auth state
    updateNavbar();

    // Scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }
    });
}

function updateNavbar() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const navLinks = document.querySelector('.navbar-links');

    if (API.isLoggedIn()) {
        const user = API.getUser();
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) {
            userMenu.style.display = 'flex';
            const avatar = userMenu.querySelector('.navbar-avatar');
            if (avatar && user) {
                avatar.textContent = user.username ? user.username[0].toUpperCase() : 'U';
            }
        }
        // Show logged-in links
        document.querySelectorAll('.auth-only').forEach(el => el.style.display = '');
        document.querySelectorAll('.guest-only').forEach(el => el.style.display = 'none');
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
        document.querySelectorAll('.auth-only').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.guest-only').forEach(el => el.style.display = '');
    }
}

// Utility to format dates
function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
        { label: 'yil', seconds: 31536000 },
        { label: 'oy', seconds: 2592000 },
        { label: 'kun', seconds: 86400 },
        { label: 'soat', seconds: 3600 },
        { label: 'daqiqa', seconds: 60 },
    ];
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `${count} ${interval.label} oldin`;
    }
    return 'Hozirgina';
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('uz-UZ', {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

// HTML escape
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get URL params
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Render pagination
function renderPagination(container, currentPage, totalPages, onPageChange) {
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let html = '';
    html += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage - 1})">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="(${onPageChange})(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += `<span style="color: var(--text-muted)">...</span>`;
        }
    }
    html += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="(${onPageChange})(${currentPage + 1})">›</button>`;
    container.innerHTML = html;
}

// Loading state
function showLoading(container) {
    container.innerHTML = `<div class="loading-page"><div class="loader"></div><p style="color: var(--text-muted)">Yuklanmoqda...</p></div>`;
}

// Logout
function logout() {
    API.clearAuth();
    Toast.success('Tizimdan chiqdingiz');
    setTimeout(() => window.location.href = '/', 500);
}

// Protect page
function requireAuth() {
    if (!API.isLoggedIn()) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
});

// Make functions global
window.Toast = Toast;
window.timeAgo = timeAgo;
window.formatDate = formatDate;
window.escapeHtml = escapeHtml;
window.getUrlParam = getUrlParam;
window.renderPagination = renderPagination;
window.showLoading = showLoading;
window.logout = logout;
window.requireAuth = requireAuth;
window.updateNavbar = updateNavbar;
