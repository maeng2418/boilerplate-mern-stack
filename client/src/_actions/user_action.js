import axios from 'axios';
import {
    LOGIN_USER,
    REGISTER_USER,
    AUTH_USER,
    LOGOUT_USER
} from './types';

export function loginUser(dataTosubmit) {
    
    const request = axios.post('/api/users/login', dataTosubmit)
    .then(response => response.data)

    return {
        type: LOGIN_USER,
        payload: request
    }
}

export function registerUser(dataTosubmit) {
    
    const request = axios.post('/api/users/register', dataTosubmit)
    .then(response => response.data)

    return {
        type: REGISTER_USER,
        payload: request
    }
}

export function auth() {

    const jwt = localStorage.getItem('jwt') ? localStorage.getItem('jwt') : null;
    const request = axios.get('/api/users/auth',{headers: {'Authorization': `JWT ${jwt}`}})
        .then(response => response.data)

    return {
        type: AUTH_USER,
        payload: request
    }
}

export function logout() {

    const jwt = localStorage.getItem('jwt') ? localStorage.getItem('jwt') : null;
    const request = axios.get('/api/users/logout',{headers: {'Authorization': `JWT ${jwt}`}})
        .then(response => response.data)

    return {
        type: LOGOUT_USER,
        payload: request
    }
}