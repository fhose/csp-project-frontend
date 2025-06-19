import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
    }
});

export const showSwal = (title, message, icon) => {
    Swal.fire({
        title,
        text: message,
        icon,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
    });
};

export const showValidationErrors = (error) => {
    const errorList = error.response?.data?.error;

    if (errorList) {
        const errorMessages = Object.values(errorList).flat();
        const formattedErrors = errorMessages.join('<br>');
        Swal.fire({
            title: 'Oops!',
            html: formattedErrors,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
        });
    } else {
        Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6',
        });
    }
};

export default apiClient;
