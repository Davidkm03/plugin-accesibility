/**
 * CamposAccessibility - Widget de Accesibilidad Web
 * @author Juan David Valor Campos
 * @website davidcampos.com.co
 * @version 1.0.0
 */

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
    }

    async init() {
        try {
            await this.registerSite();
            await this.enableWidget();
            this.initialized = true;
            this.createWidgetButton();
            window.CamposAccessibility.instance = this;
            return true;
        } catch (error) {
            console.error('Error initializing CamposAccessibility:', error);
            return false;
        }
    }

    async registerSite() {
        try {
            const response = await fetch(`${this.baseUrl}/widget/sites`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data && data.sites && data.sites.length > 0) {
                this.siteId = data.sites[0].id;
            }
            return this.siteId;
        } catch (error) {
            console.error('Error registering site:', error);
            throw error;
        }
    }

    async enableWidget() {
        if (!this.siteId) return false;

        try {
            const response = await fetch(`${this.baseUrl}/widget/sites/${this.siteId}/visibility`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ visible: true })
            });

            return response.ok;
        } catch (error) {
            console.error('Error enabling widget:', error);
            return false;
        }
    }

    createWidgetButton() {
        if (!document.getElementById('dashicons-css')) {
            const dashiconsLink = document.createElement('link');
            dashiconsLink.id = 'dashicons-css';
            dashiconsLink.rel = 'stylesheet';
            dashiconsLink.href = 'dashicons.css';
            document.head.appendChild(dashiconsLink);
        }

        const button = document.createElement('button');
        button.id = 'campos-accessibility-btn';
        
        // Aplicar estilos basados en la configuración
        const size = this.sizes[this.config.buttonSize];
        const position = this.positions[this.config.position];
        
        button.innerHTML = `
            <span class="dashicons dashicons-universal-access" style="font-size: ${size.iconSize};"></span>
            ${this.config.showLabels ? `<span class="text">Accesibilidad</span>` : ''}
        `;

        const buttonStyle = {
            position: 'fixed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: this.config.primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: this.config.borderRadius,
            padding: size.padding,
            cursor: 'pointer',
            zIndex: this.config.zIndex,
            fontFamily: this.config.fontFamily,
            fontSize: size.fontSize,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: this.config.animations ? 'all 0.3s ease' : 'none',
            ...position
        };

        Object.assign(button.style, buttonStyle);

        button.addEventListener('click', () => this.toggleAccessibilityMenu());
        button.addEventListener('mouseover', () => {
            if (this.config.animations) {
                button.style.transform = 'scale(1.05)';
                button.style.background = this.adjustColor(this.config.primaryColor, -20);
            }
        });
        button.addEventListener('mouseout', () => {
            if (this.config.animations) {
                button.style.transform = 'scale(1)';
                button.style.background = this.config.primaryColor;
            }
        });

        document.body.appendChild(button);
    }

    // Función auxiliar para ajustar colores
    adjustColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    toggleAccessibilityMenu() {
        const existingMenu = document.getElementById('campos-accessibility-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.id = 'campos-accessibility-menu';
        menu.innerHTML = `
            <h3>Opciones de Accesibilidad</h3>
            <div class="accessibility-categories">
                <!-- Discapacidad Motora -->
                <div class="category">
                    <h4><span class="dashicons dashicons-admin-generic"></span> Discapacidad Motora</h4>
                    <div class="category-options">
                        <button onclick="window.CamposAccessibility.instance.toggleKeyboardNavigation()" class="accessibility-btn">
                            <span class="dashicons dashicons-keyboard"></span>
                            Navegación por Teclado
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleClickAssist()" class="accessibility-btn">
                            <span class="dashicons dashicons-mouse"></span>
                            Asistente de Click
                        </button>
                    </div>
                </div>

                <!-- Ceguera -->
                <div class="category">
                    <h4><span class="dashicons dashicons-visibility"></span> Ceguera</h4>
                    <div class="category-options">
                        <button onclick="window.CamposAccessibility.instance.toggleScreenReader()" class="accessibility-btn">
                            <span class="dashicons dashicons-megaphone"></span>
                            Lector de Pantalla
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleAltText()" class="accessibility-btn">
                            <span class="dashicons dashicons-format-image"></span>
                            Textos Alternativos
                        </button>
                    </div>
                </div>

                <!-- Daltonismo -->
                <div class="category">
                    <h4><span class="dashicons dashicons-art"></span> Daltonismo</h4>
                    <div class="category-options">
                        <button onclick="window.CamposAccessibility.instance.toggleColorFilters('protanopia')" class="accessibility-btn">
                            <span class="dashicons dashicons-admin-appearance"></span>
                            Modo Protanopia
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleColorFilters('deuteranopia')" class="accessibility-btn">
                            <span class="dashicons dashicons-admin-appearance"></span>
                            Modo Deuteranopia
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleColorFilters('tritanopia')" class="accessibility-btn">
                            <span class="dashicons dashicons-admin-appearance"></span>
                            Modo Tritanopia
                        </button>
                    </div>
                </div>

                <!-- Dislexia -->
                <div class="category">
                    <h4><span class="dashicons dashicons-editor-spellcheck"></span> Dislexia</h4>
                    <div class="category-options">
                        <button onclick="window.CamposAccessibility.instance.toggleDyslexicFont()" class="accessibility-btn">
                            <span class="dashicons dashicons-editor-textcolor"></span>
                            Fuente para Dislexia
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleReadingGuide()" class="accessibility-btn">
                            <span class="dashicons dashicons-book-alt"></span>
                            Guía de Lectura
                        </button>
                    </div>
                </div>

                <!-- Visión baja -->
                <div class="category">
                    <h4><span class="dashicons dashicons-visibility"></span> Visión Baja</h4>
                    <div class="category-options">
                        <button onclick="window.CamposAccessibility.instance.adjustFontSize(1.1)" class="accessibility-btn">
                            <span class="dashicons dashicons-editor-textcolor"></span>
                            Aumentar Texto
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleHighContrast()" class="accessibility-btn">
                            <span class="dashicons dashicons-admin-appearance"></span>
                            Alto Contraste
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleMagnifier()" class="accessibility-btn">
                            <span class="dashicons dashicons-search"></span>
                            Lupa
                        </button>
                    </div>
                </div>

                <!-- Cognitivo y aprendizaje -->
                <div class="category">
                    <h4><span class="dashicons dashicons-welcome-learn-more"></span> Cognitivo y Aprendizaje</h4>
                    <div class="category-options">
                        <button onclick="window.CamposAccessibility.instance.toggleSimplifiedView()" class="accessibility-btn">
                            <span class="dashicons dashicons-editor-justify"></span>
                            Vista Simplificada
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleReadingMask()" class="accessibility-btn">
                            <span class="dashicons dashicons-visibility"></span>
                            Máscara de Lectura
                        </button>
                    </div>
                </div>

                <!-- Convulsiones y epilépticos -->
                <div class="category">
                    <h4><span class="dashicons dashicons-warning"></span> Convulsiones y Epilepsia</h4>
                    <div class="category-options">
                        <button onclick="window.CamposAccessibility.instance.toggleAnimationBlock()" class="accessibility-btn">
                            <span class="dashicons dashicons-controls-pause"></span>
                            Bloquear Animaciones
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleReducedMotion()" class="accessibility-btn">
                            <span class="dashicons dashicons-image-rotate"></span>
                            Reducir Movimiento
                        </button>
                    </div>
                </div>

                <!-- TDAH -->
                <div class="category">
                    <h4><span class="dashicons dashicons-admin-users"></span> TDAH</h4>
                    <div class="category-options">
                        <button onclick="window.CamposAccessibility.instance.toggleFocusMode()" class="accessibility-btn">
                            <span class="dashicons dashicons-visibility"></span>
                            Modo Enfoque
                        </button>
                        <button onclick="window.CamposAccessibility.instance.toggleAudioFeedback()" class="accessibility-btn">
                            <span class="dashicons dashicons-microphone"></span>
                            Retroalimentación de Audio
                        </button>
                    </div>
                </div>
            </div>
            <footer style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center;">
                Desarrollado por <a href="https://davidcampos.com.co" target="_blank" style="color: #3498db;">Juan David Valor Campos</a>
            </footer>
        `;

        document.body.appendChild(menu);
    }

    // Funciones existentes
    adjustFontSize(factor) {
        const elements = document.getElementsByTagName('*');
        for (let element of elements) {
            const currentSize = window.getComputedStyle(element).fontSize;
            const newSize = parseFloat(currentSize) * factor;
            element.style.fontSize = `${newSize}px`;
        }
    }

    toggleDyslexicFont() {
        const html = document.documentElement;
        if (html.classList.contains('dyslexic-font')) {
            html.classList.remove('dyslexic-font');
            document.body.style.fontFamily = '';
        } else {
            html.classList.add('dyslexic-font');
            document.body.style.fontFamily = 'Arial, sans-serif';
            document.body.style.letterSpacing = '0.1em';
            document.body.style.wordSpacing = '0.2em';
            document.body.style.lineHeight = '1.6';
        }
    }

    toggleHighContrast() {
        const html = document.documentElement;
        if (html.classList.contains('high-contrast')) {
            html.classList.remove('high-contrast');
            if (this.contrastStyle) {
                this.contrastStyle.remove();
                this.contrastStyle = null;
            }
        } else {
            html.classList.add('high-contrast');
            this.contrastStyle = document.createElement('style');
            this.contrastStyle.innerHTML = `
                .high-contrast * {
                    background-color: black !important;
                    color: white !important;
                    border-color: white !important;
                }
                .high-contrast a {
                    color: yellow !important;
                    text-decoration: underline !important;
                }
                .high-contrast button {
                    background-color: white !important;
                    color: black !important;
                    border: 2px solid white !important;
                }
                .high-contrast img {
                    filter: invert(1) !important;
                }
                .high-contrast input,
                .high-contrast textarea {
                    background-color: #333 !important;
                    color: white !important;
                    border: 2px solid white !important;
                }
            `;
            document.head.appendChild(this.contrastStyle);
        }
    }

    // Nuevas funciones para las categorías adicionales
    toggleKeyboardNavigation() {
        const html = document.documentElement;
        html.classList.toggle('keyboard-navigation');
        if (html.classList.contains('keyboard-navigation')) {
            document.addEventListener('keydown', this.handleKeyboardNavigation);
        } else {
            document.removeEventListener('keydown', this.handleKeyboardNavigation);
        }
    }

    toggleClickAssist() {
        const html = document.documentElement;
        html.classList.toggle('click-assist');
        if (html.classList.contains('click-assist')) {
            document.addEventListener('mouseover', this.handleClickAssist);
        } else {
            document.removeEventListener('mouseover', this.handleClickAssist);
        }
    }

    toggleScreenReader() {
        alert('Esta función requiere un lector de pantalla instalado en el sistema.');
    }

    toggleAltText() {
        const images = document.getElementsByTagName('img');
        for (let img of images) {
            if (!img.getAttribute('alt')) {
                img.setAttribute('alt', 'Imagen sin descripción');
            }
            if (!img.getAttribute('title')) {
                img.setAttribute('title', img.getAttribute('alt'));
            }
        }
    }

    toggleColorFilters(type) {
        const html = document.documentElement;
        const filters = {
            protanopia: `
                brightness(100%) contrast(100%)
                sepia(20%) saturate(85%) hue-rotate(320deg)
            `,
            deuteranopia: `
                brightness(100%) contrast(100%)
                sepia(20%) saturate(90%) hue-rotate(350deg)
            `,
            tritanopia: `
                brightness(100%) contrast(100%)
                sepia(20%) saturate(82%) hue-rotate(180deg)
            `
        };

        // Crear estilos específicos para cada tipo de daltonismo si no existen
        if (!document.getElementById('color-blindness-styles')) {
            const style = document.createElement('style');
            style.id = 'color-blindness-styles';
            style.innerHTML = `
                .protanopia-active {
                    --primary-color: #0066CC;
                    --secondary-color: #FFB800;
                    --warning-color: #FF6B00;
                    --success-color: #00CC66;
                }
                .deuteranopia-active {
                    --primary-color: #0055CC;
                    --secondary-color: #FFAA00;
                    --warning-color: #FF5500;
                    --success-color: #00BB55;
                }
                .tritanopia-active {
                    --primary-color: #0044CC;
                    --secondary-color: #FF9900;
                    --warning-color: #FF4400;
                    --success-color: #00AA44;
                }
                [class*="-active"] img {
                    filter: contrast(110%) brightness(110%);
                }
                [class*="-active"] a {
                    text-decoration: underline !important;
                    font-weight: bold !important;
                }
                [class*="-active"] button {
                    border: 2px solid currentColor !important;
                }
            `;
            document.head.appendChild(style);
        }

        // Remover clases anteriores
        html.classList.remove('protanopia-active', 'deuteranopia-active', 'tritanopia-active');
        
        // Aplicar o remover filtros
        if (html.style.filter === filters[type].trim()) {
            html.style.filter = '';
            html.style.webkitFilter = '';
        } else {
            html.style.filter = filters[type];
            html.style.webkitFilter = filters[type];
            html.classList.add(`${type}-active`);
        }

        // Actualizar elementos específicos
        this.updateColorElements(type);
    }

    updateColorElements(type) {
        const elements = {
            links: document.getElementsByTagName('a'),
            buttons: document.getElementsByTagName('button'),
            inputs: document.getElementsByTagName('input'),
            headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        };

        if (type) {
            // Mejorar contraste y legibilidad
            for (let link of elements.links) {
                link.style.textDecoration = 'underline';
                link.style.fontWeight = 'bold';
            }

            for (let button of elements.buttons) {
                button.style.border = '2px solid currentColor';
            }

            for (let input of elements.inputs) {
                input.style.border = '2px solid currentColor';
                input.style.padding = '8px';
            }

            for (let heading of elements.headings) {
                heading.style.marginBottom = '1em';
                heading.style.borderBottom = '2px solid currentColor';
            }
        } else {
            // Restaurar estilos originales
            for (let element of [...elements.links, ...elements.buttons, ...elements.inputs, ...elements.headings]) {
                element.style.removeProperty('text-decoration');
                element.style.removeProperty('font-weight');
                element.style.removeProperty('border');
                element.style.removeProperty('padding');
                element.style.removeProperty('margin-bottom');
                element.style.removeProperty('border-bottom');
            }
        }
    }

    toggleMagnifier() {
        if (this.magnifier) {
            this.magnifier.remove();
            document.removeEventListener('mousemove', this.handleMagnifier);
            this.magnifier = null;
        } else {
            this.magnifier = document.createElement('div');
            this.magnifier.className = 'accessibility-magnifier';
            this.magnifier.style.cssText = `
                position: fixed;
                width: 150px;
                height: 150px;
                border: 2px solid #333;
                border-radius: 50%;
                pointer-events: none;
                z-index: 99999;
                background: white;
                display: none;
            `;
            document.body.appendChild(this.magnifier);
            
            this.handleMagnifier = (e) => {
                const x = e.clientX;
                const y = e.clientY;
                this.magnifier.style.display = 'block';
                this.magnifier.style.left = `${x - 75}px`;
                this.magnifier.style.top = `${y - 75}px`;
                this.magnifier.style.transform = 'scale(2)';
            };
            
            document.addEventListener('mousemove', this.handleMagnifier);
        }
    }

    toggleSimplifiedView() {
        const html = document.documentElement;
        if (html.classList.contains('simplified-view')) {
            html.classList.remove('simplified-view');
        } else {
            html.classList.add('simplified-view');
            const style = document.createElement('style');
            style.innerHTML = `
                .simplified-view {
                    background: white !important;
                }
                .simplified-view * {
                    background: white !important;
                    color: black !important;
                    font-family: Arial, sans-serif !important;
                    line-height: 1.5 !important;
                    text-align: left !important;
                }
                .simplified-view img:not([alt]) {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    toggleAnimationBlock() {
        const html = document.documentElement;
        if (html.classList.contains('animation-block')) {
            html.classList.remove('animation-block');
        } else {
            html.classList.add('animation-block');
            const style = document.createElement('style');
            style.innerHTML = `
                .animation-block * {
                    animation: none !important;
                    transition: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    toggleReducedMotion() {
        const html = document.documentElement;
        if (html.classList.contains('reduced-motion')) {
            html.classList.remove('reduced-motion');
        } else {
            html.classList.add('reduced-motion');
            const style = document.createElement('style');
            style.innerHTML = `
                .reduced-motion * {
                    animation-duration: 0.001ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.001ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    toggleFocusMode() {
        const html = document.documentElement;
        if (html.classList.contains('focus-mode')) {
            html.classList.remove('focus-mode');
        } else {
            html.classList.add('focus-mode');
            const style = document.createElement('style');
            style.innerHTML = `
                .focus-mode * {
                    opacity: 0.5;
                }
                .focus-mode *:hover,
                .focus-mode *:focus {
                    opacity: 1 !important;
                    outline: 2px solid #3498db !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    toggleAudioFeedback() {
        const html = document.documentElement;
        if (html.classList.contains('audio-feedback')) {
            html.classList.remove('audio-feedback');
            document.removeEventListener('click', this.handleAudioFeedback);
        } else {
            html.classList.add('audio-feedback');
            this.handleAudioFeedback = () => {
                const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA');
                audio.play();
            };
            document.addEventListener('click', this.handleAudioFeedback);
        }
    }
}

// Initialize CamposAccessibility
document.addEventListener('DOMContentLoaded', function() {
    window.CamposAccessibility = CamposAccessibility;
    const accessibility = new CamposAccessibility();
    accessibility.init();
});
