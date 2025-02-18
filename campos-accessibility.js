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
            buttonStyle: config.buttonStyle || 'icon-text', // Nuevas opciones: 'icon-only', 'icon-text', 'text-only'
            buttonText: config.buttonText || 'Accesibilidad',
            buttonIcon: config.buttonIcon || 'dashicons-universal-access',
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
            this.initialized = true;
            this.createWidgetButton();
            this.initializeAccessibilityEnhancements();
        } catch (error) {
            console.error('Error initializing accessibility widget:', error);
        }
    }

    createWidgetButton() {
        const button = jQuery('<button>', {
            id: 'campos-accessibility-button',
            'aria-label': 'Opciones de accesibilidad',
            class: 'campos-accessibility-button'
        }).css({
            position: 'fixed',
            padding: this.sizes[this.config.buttonSize].padding,
            background: this.config.primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: this.config.borderRadius,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: this.config.zIndex,
            ...this.positions[this.config.position]
        });

        const icon = jQuery('<span>', {
            class: 'dashicons ' + this.config.buttonIcon,
            'aria-hidden': 'true'
        }).css({
            fontSize: this.sizes[this.config.buttonSize].iconSize
        });

        const text = jQuery('<span>', {
            class: 'text',
            text: this.config.buttonText
        }).css({
            fontSize: this.sizes[this.config.buttonSize].fontSize
        });

        if (!this.config.showLabels) {
            text.hide();
        }

        button.append(icon, text);

        if (this.config.animations) {
            button.css('transition', 'all 0.3s ease');
            button.hover(() => {
                button.css('transform', 'scale(1.05)');
            }, () => {
                button.css('transform', 'scale(1)');
            });
        }

        button.on('click', () => this.toggleMenu());

        jQuery('body').append(button);
    }

    // ... (resto del código permanece igual)
}
