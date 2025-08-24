import toast from 'react-hot-toast';

// Make toast available globally for error handlers
if (typeof window !== 'undefined') {
    window.toast = toast;
}

export default toast;
