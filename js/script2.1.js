// Script para interactividad básica
document.addEventListener('DOMContentLoaded', function() {
    console.log('HPE Dashboard cargado correctamente');
    
    // ===== NAVEGACIÓN ACTIVA =====
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Quitar active de todos
            navLinks.forEach(l => l.classList.remove('active'));
            // Añadir active al clickeado
            this.classList.add('active');
            
            // Aquí podrías cargar diferente contenido según la opción
            console.log('Navegando a:', this.textContent);
        });
    });

    
    // ===== SERVICE ITEMS (Servicios HPE) =====
    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(service => {
        service.addEventListener('click', function() {
            const serviceName = this.querySelector('.service-name').textContent;
            console.log('Servicio seleccionado:', serviceName);
            
            // Resaltar el servicio seleccionado
            serviceItems.forEach(s => s.style.background = 'rgba(24, 24, 27, 0.3)');
            this.style.background = 'rgba(1, 169, 130, 0.1)';
            
            // Aquí podrías mostrar detalles del servicio
            alert(`Abriendo documentación de: ${serviceName}`);
        });
    });
    
    // ===== PRODUCT ITEMS =====
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(product => {
        product.addEventListener('click', function() {
            const productName = this.querySelector('.product-name').textContent;
            console.log('Producto seleccionado:', productName);
            
            // Efecto de selección
            productItems.forEach(p => p.style.borderColor = 'transparent');
            this.style.borderColor = 'var(--hpe-green)';
            
            // Aquí podrías mostrar especificaciones del producto
            alert(`Mostrando detalles de: ${productName}`);
        });
    });
    
    // ===== AI COPILOT INPUT =====
    // --- Copilot Chat ---
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatInterface = document.getElementById('chat-interface');

    function addCopilotMessage(text, type) { // type: 'ai' or 'user'
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type}`;
        
        // Get current time
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let contentHtml = '';
        
        if (type === 'ai') {
            contentHtml = `
                <div class="msg-icon"><i class="fa-solid fa-robot"></i></div>
                <div class="msg-content">
                    ${text}
                    <span class="time">${timeString}</span>
                </div>
            `;
        } else {
             contentHtml = `
                <div class="msg-content">
                    ${text}
                    <div class="user-avatar-small">JD</div>
                    <span class="time">${timeString}</span>
                </div>
            `;
        }
        
        msgDiv.innerHTML = contentHtml;
        chatInterface.appendChild(msgDiv);
        
        // Scroll to bottom
        chatInterface.scrollTop = chatInterface.scrollHeight;
    }

    function handleSend() {
        const text = chatInput.value.trim();
        if(!text) return;

        // Add user message
        addCopilotMessage(text, 'user');
        chatInput.value = '';

        // Simulate AI thinking and response
        setTimeout(() => {
            // Simple keyword matching for demo purposes
            let response = "I'm processing that request. Please stand by.";
            
            const lowerText = text.toLowerCase();
            if(lowerText.includes('temperature') || lowerText.includes('heat')) {
                response = "Thermal sensors indicate Rack 4 is operating 2°C above nominal. I recommend increasing fan speed.";
            } else if(lowerText.includes('storage') || lowerText.includes('disk')) {
                response = "Storage usage is at 65%. You have 1.4TB remaining. No immediate action required.";
            } else if(lowerText.includes('power') || lowerText.includes('energy')) {
               response = "Current power consumption is stable at 4.2kW. Efficiency mode is active.";
            }

            addCopilotMessage(response, 'ai');

        }, 1000 + Math.random() * 1000);
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    
    
    // ===== BOTÓN EXPLORAR BASE DE DATOS =====
    const exploreBtn = document.querySelector('.btn-outline');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Explorar base de datos');
            alert('Cargando directorio completo de empresas...');
        });
    }
    
    // ===== BOTÓN CATÁLOGO COMPLETO =====
    const catalogBtn = document.querySelector('.btn-gradient');
    if (catalogBtn) {
        catalogBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Ver catálogo completo');
            alert('Abriendo catálogo de productos HPE...');
        });
    }
    
    // ===== ANIMACIÓN DEL PROGRESS RING =====
    function updateProgressRing(percent) {
        const circle = document.querySelector('.progress-ring');
        if (circle) {
            const radius = 100;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        }
    }
    
    // Ejemplo: actualizar el progreso cada 3 segundos (solo para demostración)
    let currentProgress = 75;
    setInterval(() => {
        // Cambiar el progreso aleatoriamente entre 70 y 85
        currentProgress = 70 + Math.floor(Math.random() * 15);
        updateProgressRing(currentProgress);
        
        // Actualizar el número
        const scoreNumber = document.querySelector('.score-number');
        if (scoreNumber) {
            scoreNumber.textContent = currentProgress;
        }
        
        // Actualizar la barra de progreso
        const progressFill = document.querySelector('.maturity-footer .progress-fill');
        if (progressFill) {
            progressFill.style.width = currentProgress + '%';
        }
        
        console.log('Métricas actualizadas:', currentProgress + '%');
    }, 5000); // Cada 5 segundos
    
    // ===== NOTIFICACIONES =====
    const notificationIcon = document.querySelector('.icon');
    if (notificationIcon && notificationIcon.closest('.user-menu')) {
        notificationIcon.addEventListener('click', function() {
            console.log('Abrir notificaciones');
            alert('Tienes 3 notificaciones nuevas:\n- Actualización de sistema completada\n- Nuevo reporte disponible\n- Alerta de rendimiento');
        });
    }
    
    
    // ===== STATUS BADGE =====
    const statusBadge = document.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.addEventListener('click', function() {
            console.log('Ver estado del sistema');
            
            // Cambiar el estado para demostración
            const statusDot = this.querySelector('.status-dot');
            const statusText = this.querySelector('.status-text');
            
            if (statusText.textContent === 'Systems Nominal') {
                statusText.textContent = 'Mantenimiento';
                statusDot.style.background = '#f59e0b';
                statusDot.style.boxShadow = '0 0 8px #f59e0b';
            } else {
                statusText.textContent = 'Systems Nominal';
                statusDot.style.background = 'var(--hpe-green)';
                statusDot.style.boxShadow = '0 0 8px var(--hpe-green)';
            }
        });
    }
    
    // ===== FUNCIÓN PARA CARGAR DATOS (SIMULACIÓN) =====
    function loadDashboardData() {
        console.log('Cargando datos del dashboard...');
        
        // Simular carga de datos de empresas
        const companyNames = document.querySelectorAll('.company-name');
        const companyPercents = document.querySelectorAll('.company-percent');
        const progressFills = document.querySelectorAll('.company-right .progress-fill');
        
        // Actualizar con datos aleatorios cada 10 segundos
        setInterval(() => {
            console.log('Actualizando datos en tiempo real...');
            
            companyPercents.forEach((percent, index) => {
                const newValue = (95 + Math.random() * 4.9).toFixed(1);
                percent.textContent = newValue + '%';
                
                if (progressFills[index]) {
                    progressFills[index].style.width = newValue + '%';
                }
            });
            
        }, 10000); // Cada 10 segundos
    }
    
    // Iniciar carga de datos
    loadDashboardData();
    
    // ===== MANEJO DE ERRORES =====
    window.addEventListener('error', function(e) {
        console.error('Error en la aplicación:', e.message);
    });
    
    console.log('✅ Dashboard inicializado correctamente');
});

// ===== FUNCIONES UTILITARIAS GLOBALES =====

// Función para formatear números
function formatNumber(num) {
    return new Intl.NumberFormat('es-ES').format(num);
}

// Función para mostrar notificaciones toast
function showToast(message, type = 'info') {
    console.log(`Toast [${type}]: ${message}`);
    
    // Aquí podrías implementar un sistema de notificaciones visual
    const colors = {
        info: 'var(--hpe-green)',
        warning: '#f59e0b',
        error: '#ef4444',
        success: '#10b981'
    };
    
    // Crear elemento toast
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Añadir estilos de animación para toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);