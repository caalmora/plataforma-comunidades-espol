const API_URL = '/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUser() {
    const user = localStorage.getItem('usuario');

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}

function saveSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
}

function clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    };
}

async function logout() {

    try {

        await fetch(API_URL + '/logout', {
            method: 'POST',
            headers: authHeaders()
        });

    } catch (error) {
        console.log(error);
    }

    clearSession();

    window.location.href = '/login';
}

function requireAuth() {

    if (!getToken()) {
        window.location.href = '/login';
    }
}