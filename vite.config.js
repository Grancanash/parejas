// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
    // Aquí puedes añadir tus configuraciones de Vite
    // Por ejemplo, para el problema de la detección de cambios:
    server: {
        watch: {
            usePolling: true // Habilita el "polling"
        }
    },
    // O por ejemplo, para usar rutas relativas en los enlaces generados en el HTML (Te evitas problemas de rutas al desplegar en un servidor)
    base: './',
});