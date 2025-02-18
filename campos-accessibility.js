class CamposAccessibility {
    constructor(config = {}) {
        this.apiKey = config.apiKey || '13a938ab-a133-438d-813a-504920d3cfc8';
        this.baseUrl = 'https://api.userway.org/api/open/v0/consumer';
        this.siteId = null;
        this.initialized = false;
        
        // Configuración por defecto
        this.config = {
            position: config.position || 'bottom-right',
            primaryColor: config.primaryColor || '#2c3e50',
            secondaryColor: config.secondaryColor || '#3498db',
            buttonSize: config.buttonSize || 'medium',
            iconSize: config.iconSize || '20px',
            buttonPadding: config.buttonPadding || '12px 20px',
            menuWidth: config.menuWidth || '350px',
            menuPosition: config.menuPosition || 'right',
            borderRadius: config.borderRadius || '50px',
            fontFamily: config.fontFamily || 'Arial, sans-serif',
            zIndex: config.zIndex || 99999,
            animations: config.animations !== undefined ? config.animations : true,
            showLabels: config.showLabels !== undefined ? config.showLabels : true,
            author: 'Juan David Valor Campos',
            website: 'davidcampos.com.co'
        };

        // Posiciones disponibles
        this.positions = {
            'top-left': { top: '20px', left: '20px' },
            'top-right': { top: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' }
        };

        // Tamaños de botón
        this.sizes = {
            small: { padding: '8px 16px', iconSize: '16px', fontSize: '12px' },
            medium: { padding: '12px 20px', iconSize: '20px', fontSize: '14px' },
            large: { padding: '16px 24px', iconSize: '24px', fontSize: '16px' }
        };

        // Inicializar mejoras de accesibilidad
        this.initializeAccessibilityEnhancements();
    }

    async init() {
        try {
            await this.registerSite();
            await this.enableWidget();
            this.initialized = true;
            this.createWidgetButton();
        } catch (error) {
            console.error('Error initializing accessibility widget:', error);
        }
    }

    initializeAccessibilityEnhancements() {
        document.addEventListener('DOMContentLoaded', () => {
            this.addSkipLink();
            this.addAriaLandmarks();
            this.enhanceInteractiveElements();
            this.enhanceLinkTexts();
            this.addExternalLinkWarnings();
            this.enhanceFocusManagement();
            this.enhancePhoneNumbers();
            this.enhanceFormLabels();
        });
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Saltar al contenido principal';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: ${this.config.primaryColor};
            color: white;
            padding: 8px;
            z-index: 100000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => skipLink.style.top = '0');
        skipLink.addEventListener('blur', () => skipLink.style.top = '-40px');
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        let mainContent = document.querySelector('main, [role="main"]');
        if (!mainContent) {
            mainContent = document.querySelector('.content, #content, article');
        }
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }

    addAriaLandmarks() {
        const landmarks = {
            header: 'banner',
            nav: 'navigation',
            main: 'main',
            footer: 'contentinfo',
            aside: 'complementary',
            search: 'search'
        };
        
        Object.entries(landmarks).forEach(([selector, role]) => {
            const elements = document.getElementsByTagName(selector);
            Array.from(elements).forEach(element => {
                if (!element.getAttribute('role')) {
                    element.setAttribute('role', role);
                }
            });
        });
    }

    enhanceInteractiveElements() {
        document.querySelectorAll('button, [role="button"]').forEach(button => {
            if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
                const context = this.getButtonContext(button);
                button.setAttribute('aria-label', context);
            }
        });
    }

    getButtonContext(button) {
        const nearestHeading = button.closest('section, article, div')?.querySelector('h1, h2, h3, h4, h5, h6');
        const nearestText = button.closest('section, article, div')?.textContent.trim().slice(0, 50);
        const imgAlt = button.querySelector('img')?.alt;
        
        return imgAlt || 
               (nearestHeading ? `${nearestHeading.textContent} - botón` : '') ||
               (nearestText ? `${nearestText}... - botón` : 'Botón de acción');
    }

    enhanceLinkTexts() {
        const ambiguousTexts = ['click aquí', 'más', 'más información', 'leer más', 'continuar'];
        document.querySelectorAll('a').forEach(link => {
            const linkText = link.textContent.trim().toLowerCase();
            if (ambiguousTexts.includes(linkText)) {
                const context = this.getLinkContext(link);
                link.setAttribute('aria-label', context);
            }
        });
    }

    getLinkContext(link) {
        const nearestHeading = link.closest('section, article, div')?.querySelector('h1, h2, h3, h4, h5, h6');
        const imgAlt = link.querySelector('img')?.alt;
        return `${link.textContent} - ${imgAlt || nearestHeading?.textContent || 'enlace'}`;
    }

    addExternalLinkWarnings() {
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            const domain = window.location.hostname;
            if (!link.hostname.includes(domain)) {
                link.setAttribute('rel', 'noopener noreferrer');
                link.setAttribute('aria-label', `${link.textContent} (abre en nueva ventana)`);
                if (!link.querySelector('.external-link-icon')) {
                    const icon = document.createElement('span');
                    icon.className = 'external-link-icon';
                    icon.setAttribute('aria-hidden', 'true');
                    icon.innerHTML = '↗️';
                    link.appendChild(icon);
                }
            }
        });
    }

    enhanceFocusManagement() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal-trigger]');
            if (trigger) {
                const modalId = trigger.getAttribute('data-modal-trigger');
                const modal = document.getElementById(modalId);
                if (modal) {
                    this.handleModalFocus(modal);
                }
            }
        });
    }

    handleModalFocus(modal) {
        const previousFocus = document.activeElement;
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const lastFocusable = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
            
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                previousFocus.focus();
            }
        });
    }

    enhancePhoneNumbers() {
        const phoneRegex = /(\+?\d{1,4}[-.\s]?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})/g;
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const text = node.textContent;
            const matches = text.match(phoneRegex);
            
            if (matches) {
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                
                matches.forEach(match => {
                    const index = text.indexOf(match, lastIndex);
                    
                    if (index > lastIndex) {
                        fragment.appendChild(
                            document.createTextNode(text.substring(lastIndex, index))
                        );
                    }
                    
                    const link = document.createElement('a');
                    link.href = `tel:${match.replace(/[-\s()]/g, '')}`;
                    link.textContent = match;
                    link.setAttribute('aria-label', `Llamar al ${match}`);
                    fragment.appendChild(link);
                    
                    lastIndex = index + match.length;
                });
                
                if (lastIndex < text.length) {
                    fragment.appendChild(
                        document.createTextNode(text.substring(lastIndex))
                    );
                }
                
                node.parentNode.replaceChild(fragment, node);
            }
        }
    }

    enhanceFormLabels() {
        document.querySelectorAll('input, select, textarea').forEach(field => {
            if (!field.id) {
                field.id = `field-${Math.random().toString(36).substr(2, 9)}`;
            }
            
            let label = field.labels[0];
            if (!label) {
                const placeholder = field.getAttribute('placeholder');
                const name = field.getAttribute('name');
                
                label = document.createElement('label');
                label.htmlFor = field.id;
                label.textContent = this.getFieldLabel(field, placeholder, name);
                
                field.parentNode.insertBefore(label, field);
            }
            
            if (field.required) {
                label.textContent += ' (obligatorio)';
            }
            
            const description = this.getFieldDescription(field);
            if (description) {
                const descId = `desc-${field.id}`;
                const descElement = document.createElement('div');
                descElement.id = descId;
                descElement.className = 'field-description';
                descElement.textContent = description;
                field.setAttribute('aria-describedby', descId);
                field.parentNode.insertBefore(descElement, field.nextSibling);
            }
        });
    }

    getFieldLabel(field, placeholder, name) {
        if (field.type === 'submit' || field.type === 'button') {
            return field.value || 'Enviar';
        }
        
        const cleanName = name?.replace(/[-_]/g, ' ').toLowerCase();
        const fieldType = field.type || field.tagName.toLowerCase();
        
        const labels = {
            text: 'Texto',
            email: 'Correo electrónico',
            tel: 'Teléfono',
            password: 'Contraseña',
            search: 'Buscar',
            number: 'Número',
            date: 'Fecha',
            time: 'Hora',
            file: 'Seleccionar archivo',
            select: 'Seleccionar opción',
            textarea: 'Mensaje'
        };
        
        return placeholder || cleanName || labels[fieldType] || 'Campo';
    }

    getFieldDescription(field) {
        const descriptions = {
            email: 'Ingrese una dirección de correo electrónico válida',
            password: 'La contraseña debe tener al menos 8 caracteres',
            tel: 'Ingrese un número de teléfono válido',
            date: 'Formato: DD/MM/AAAA',
            time: 'Formato: HH:MM',
            file: 'Formatos permitidos: JPG, PNG, PDF'
        };
        
        return descriptions[field.type] || '';
    }
}

// Exportar la clase para su uso
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CamposAccessibility;
} else if (typeof window !== 'undefined') {
    window.CamposAccessibility = CamposAccessibility;
}
