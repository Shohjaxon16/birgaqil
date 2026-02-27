// BirgaQil — API Module
const API_BASE = '/api';

class API {
    static getToken() {
        return localStorage.getItem('birgaqil_token');
    }

    static setToken(token) {
        localStorage.setItem('birgaqil_token', token);
    }

    static setRefreshToken(token) {
        localStorage.setItem('birgaqil_refresh_token', token);
    }

    static getRefreshToken() {
        return localStorage.getItem('birgaqil_refresh_token');
    }

    static setUser(user) {
        localStorage.setItem('birgaqil_user', JSON.stringify(user));
    }

    static getUser() {
        const user = localStorage.getItem('birgaqil_user');
        return user ? JSON.parse(user) : null;
    }

    static clearAuth() {
        localStorage.removeItem('birgaqil_token');
        localStorage.removeItem('birgaqil_refresh_token');
        localStorage.removeItem('birgaqil_user');
    }

    static isLoggedIn() {
        return !!this.getToken();
    }

    static async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const token = this.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (response.status === 401 && data.expired) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    config.headers['Authorization'] = `Bearer ${this.getToken()}`;
                    const retryResponse = await fetch(url, config);
                    return await retryResponse.json();
                } else {
                    this.clearAuth();
                    window.location.href = '/login';
                    return data;
                }
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Tarmoq xatosi' };
        }
    }

    static async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) return false;

            const response = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await response.json();
            if (data.success) {
                this.setToken(data.data.accessToken);
                this.setRefreshToken(data.data.refreshToken);
                return true;
            }
            return false;
        } catch {
            return false;
        }
    }

    // Auth
    static register(body) { return this.request('/auth/register', { method: 'POST', body }); }
    static login(body) { return this.request('/auth/login', { method: 'POST', body }); }
    static getMe() { return this.request('/auth/me'); }

    // Users
    static getUsers(params = '') { return this.request(`/users?${params}`); }
    static getUserById(id) { return this.request(`/users/${id}`); }
    static updateUser(id, body) { return this.request(`/users/${id}`, { method: 'PUT', body }); }

    // Startups
    static getStartups(params = '') { return this.request(`/startups?${params}`); }
    static getStartupById(id) { return this.request(`/startups/${id}`); }
    static createStartup(body) { return this.request('/startups', { method: 'POST', body }); }
    static joinStartup(id) { return this.request(`/startups/${id}/join`, { method: 'POST', body: {} }); }
    static getMyStartups() { return this.request('/startups/my'); }

    // Posts
    static getPosts(params = '') { return this.request(`/posts?${params}`); }
    static createPost(body) { return this.request('/posts', { method: 'POST', body }); }
    static deletePost(id) { return this.request(`/posts/${id}`, { method: 'DELETE' }); }

    // Notifications
    static getNotifications(params = '') { return this.request(`/notifications?${params}`); }
    static markNotificationRead(id) { return this.request(`/notifications/${id}/read`, { method: 'PUT' }); }
    static markAllNotificationsRead() { return this.request('/notifications/read-all', { method: 'PUT' }); }

    // Messages
    static getConversations() { return this.request('/messages'); }
    static getMessages(userId) { return this.request(`/messages/${userId}`); }
}

window.API = API;
