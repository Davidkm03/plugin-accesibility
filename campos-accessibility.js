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
            buttonStyle: config.buttonStyle || 'icon-text',
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

        // Crear elementos según el estilo seleccionado
        if (this.config.buttonStyle === 'icon-only' || this.config.buttonStyle === 'icon-text') {
            const icon = jQuery('<span>', {
                class: 'dashicons ' + this.config.buttonIcon,
                'aria-hidden': 'true'
            }).css({
                fontSize: this.sizes[this.config.buttonSize].iconSize
            });
            button.append(icon);
        }

        if (this.config.buttonStyle === 'text-only' || this.config.buttonStyle === 'icon-text') {
            const text = jQuery('<span>', {
                class: 'text',
                text: this.config.buttonText
            }).css({
                fontSize: this.sizes[this.config.buttonSize].fontSize
            });
            button.append(text);
        }

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

    toggleMenu() {
        let menu = jQuery('#campos-accessibility-menu');
        
        if (menu.length === 0) {
            menu = this.createMenu();
            jQuery('body').append(menu);
        }

        if (menu.is(':visible')) {
            menu.fadeOut(200);
        } else {
            const button = jQuery('#campos-accessibility-button');
            const buttonPos = button.offset();
            const menuWidth = parseInt(this.config.menuWidth);
            
            let left = this.config.menuPosition === 'right' ? 
                buttonPos.left - menuWidth + button.outerWidth() : 
                buttonPos.left;

            menu.css({
                top: buttonPos.top + button.outerHeight() + 10,
                left: left
            }).fadeIn(200);
        }
    }

    createMenu() {
        const menu = jQuery('<div>', {
            id: 'campos-accessibility-menu',
            class: 'campos-accessibility-menu',
            'aria-label': 'Menú de accesibilidad'
        }).css({
            position: 'fixed',
            width: this.config.menuWidth,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: this.config.zIndex + 1,
            display: 'none',
            padding: '16px'
        });

        const features = [
            { id: 'motorDisability', title: 'Navegación por teclado', icon: 'dashicons-admin-generic' },
            { id: 'blindness', title: 'Lector de pantalla', icon: 'dashicons-visibility' },
            { id: 'colorBlindness', title: 'Filtros de color', icon: 'dashicons-art' },
            { id: 'dyslexia', title: 'Ayuda para dislexia', icon: 'dashicons-editor-spellcheck' },
            { id: 'lowVision', title: 'Aumentar texto', icon: 'dashicons-visibility' },
            { id: 'cognitive', title: 'Vista simplificada', icon: 'dashicons-welcome-learn-more' },
            { id: 'seizure', title: 'Reducir animaciones', icon: 'dashicons-warning' },
            { id: 'adhd', title: 'Modo enfoque', icon: 'dashicons-admin-users' }
        ];

        features.forEach(feature => {
            const button = jQuery('<button>', {
                class: 'campos-feature-button',
                'data-feature': feature.id,
                'aria-pressed': 'false'
            }).css({
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px',
                margin: '4px 0',
                border: 'none',
                borderRadius: '4px',
                background: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s'
            });

            const icon = jQuery('<span>', {
                class: `dashicons ${feature.icon}`,
                'aria-hidden': 'true'
            });

            const text = jQuery('<span>', {
                text: feature.title
            });

            button.append(icon, text);

            button.hover(() => {
                button.css('background', '#f0f0f0');
            }, () => {
                button.css('background', 'none');
            });

            button.on('click', () => this.toggleFeature(feature.id, button));

            menu.append(button);
        });

        return menu;
    }

    toggleFeature(featureId, button) {
        const isActive = button.attr('aria-pressed') === 'true';
        button.attr('aria-pressed', (!isActive).toString());
        
        switch (featureId) {
            case 'motorDisability':
                this.toggleKeyboardNavigation();
                break;
            case 'lowVision':
                this.adjustFontSize(!isActive ? 1.1 : 0.9);
                break;
            case 'seizure':
                jQuery('*').css('animation', !isActive ? 'none' : '');
                break;
            case 'cognitive':
                this.toggleSimplifiedView();
                break;
            case 'dyslexia':
                this.toggleDyslexiaSupport();
                break;
            case 'colorBlindness':
                this.toggleColorFilters();
                break;
            case 'blindness':
                this.toggleScreenReader();
                break;
            case 'adhd':
                this.toggleFocusMode();
                break;
        }

        button.css('background', !isActive ? this.config.secondaryColor : 'none')
              .css('color', !isActive ? 'white' : 'initial');
    }

    toggleKeyboardNavigation() {
        const body = jQuery('body');
        const isEnabled = body.hasClass('keyboard-navigation');
        
        if (!isEnabled) {
            body.addClass('keyboard-navigation');
            
            jQuery('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').css({
                'outline': '2px solid ' + this.config.primaryColor,
                'outline-offset': '2px'
            });
            
            const focusIndicator = jQuery('<div>', {
                id: 'keyboard-focus-indicator',
                'aria-hidden': 'true'
            }).css({
                position: 'absolute',
                border: '2px solid ' + this.config.primaryColor,
                borderRadius: '3px',
                pointerEvents: 'none',
                zIndex: 999999,
                display: 'none'
            });
            
            jQuery('body').append(focusIndicator);
            
            jQuery(document).on('focusin.keyboard-nav', function(e) {
                const target = jQuery(e.target);
                const offset = target.offset();
                
                focusIndicator.css({
                    top: offset.top - 4,
                    left: offset.left - 4,
                    width: target.outerWidth() + 4,
                    height: target.outerHeight() + 4,
                    display: 'block'
                });
            });
            
            jQuery(document).on('focusout.keyboard-nav', function() {
                focusIndicator.css('display', 'none');
            });
        } else {
            body.removeClass('keyboard-navigation');
            
            jQuery('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').css({
                'outline': '',
                'outline-offset': ''
            });
            
            jQuery('#keyboard-focus-indicator').remove();
            jQuery(document).off('focusin.keyboard-nav focusout.keyboard-nav');
        }
    }

    adjustFontSize(factor) {
        jQuery('body').find('*').each(function() {
            const el = jQuery(this);
            const currentSize = parseFloat(el.css('font-size'));
            el.css('font-size', (currentSize * factor) + 'px');
        });
    }

    toggleSimplifiedView() {
        const body = jQuery('body');
        const isSimplified = body.hasClass('simplified-view');
        
        if (!isSimplified) {
            jQuery('*').each(function() {
                const el = jQuery(this);
                el.data('original-styles', {
                    background: el.css('background'),
                    backgroundImage: el.css('background-image'),
                    float: el.css('float'),
                    position: el.css('position'),
                    fontSize: el.css('font-size'),
                    lineHeight: el.css('line-height')
                });
            });

            body.addClass('simplified-view');
            
            const simplifiedStyles = {
                '*': {
                    background: 'white !important',
                    backgroundImage: 'none !important',
                    color: '#333 !important',
                    float: 'none !important',
                    position: 'static !important',
                    fontSize: '18px !important',
                    lineHeight: '1.8 !important',
                    fontFamily: 'Arial, sans-serif !important',
                    margin: '0 !important',
                    padding: '0 !important',
                    border: 'none !important',
                    boxShadow: 'none !important',
                    textShadow: 'none !important'
                },
                'body': {
                    maxWidth: '800px !important',
                    margin: '0 auto !important',
                    padding: '20px !important'
                },
                'h1, h2, h3, h4, h5, h6': {
                    color: '#000 !important',
                    margin: '1em 0 0.5em 0 !important',
                    padding: '0 !important',
                    borderBottom: '1px solid #333 !important'
                },
                'p, li': {
                    margin: '0.5em 0 !important'
                },
                'img': {
                    display: 'block !important',
                    maxWidth: '100% !important',
                    height: 'auto !important',
                    margin: '1em auto !important'
                },
                'a': {
                    color: '#0066cc !important',
                    textDecoration: 'underline !important'
                }
            };

            Object.entries(simplifiedStyles).forEach(([selector, styles]) => {
                jQuery(selector).css(styles);
            });

            jQuery('aside, .sidebar, .ad, .advertisement, .social-share, .related-posts').hide();
        } else {
            jQuery('*').each(function() {
                const el = jQuery(this);
                const originalStyles = el.data('original-styles');
                if (originalStyles) {
                    el.css(originalStyles);
                }
            });

            body.removeClass('simplified-view');
            jQuery('aside, .sidebar, .ad, .advertisement, .social-share, .related-posts').show();
        }
    }

    toggleDyslexiaSupport() {
        const body = jQuery('body');
        if (!body.hasClass('dyslexia-support')) {
            body.addClass('dyslexia-support').css({
                'font-family': 'OpenDyslexic, Arial, sans-serif',
                'letter-spacing': '0.35ch',
                'word-spacing': '0.5ch',
                'line-height': '2',
                'text-align': 'left'
            });
        } else {
            body.removeClass('dyslexia-support').css({
                'font-family': '',
                'letter-spacing': '',
                'word-spacing': '',
                'line-height': '',
                'text-align': ''
            });
        }
    }

    toggleColorFilters() {
        const body = jQuery('body');
        if (!body.hasClass('color-filters')) {
            body.addClass('color-filters');
            const filters = jQuery('<div>', {
                id: 'color-filters-overlay'
            }).css({
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 999998,
                pointerEvents: 'none',
                mixBlendMode: 'multiply',
                backgroundColor: 'rgba(255, 255, 0, 0.1)'
            });
            jQuery('body').append(filters);
        } else {
            body.removeClass('color-filters');
            jQuery('#color-filters-overlay').remove();
        }
    }

    toggleScreenReader() {
        const body = jQuery('body');
        if (!body.hasClass('screen-reader')) {
            body.addClass('screen-reader');
            jQuery('img:not([alt])').attr('alt', 'Imagen sin descripción');
            jQuery('a').each(function() {
                const link = jQuery(this);
                if (!link.attr('aria-label')) {
                    link.attr('aria-label', link.text());
                }
            });
        } else {
            body.removeClass('screen-reader');
        }
    }

    toggleFocusMode() {
        const body = jQuery('body');
        if (!body.hasClass('focus-mode')) {
            body.addClass('focus-mode');
            const overlay = jQuery('<div>', {
                id: 'focus-mode-overlay'
            }).css({
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 999997,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                pointerEvents: 'none'
            });
            jQuery('body').append(overlay);

            jQuery('p, h1, h2, h3, h4, h5, h6, img, button, input, textarea').hover(
                function() {
                    jQuery(this).css({
                        position: 'relative',
                        zIndex: 999999,
                        backgroundColor: 'white',
                        padding: '10px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                    });
                },
                function() {
                    jQuery(this).css({
                        position: '',
                        zIndex: '',
                        backgroundColor: '',
                        padding: '',
                        boxShadow: ''
                    });
                }
            );
        } else {
            body.removeClass('focus-mode');
            jQuery('#focus-mode-overlay').remove();
            jQuery('p, h1, h2, h3, h4, h5, h6, img, button, input, textarea').off('mouseenter mouseleave');
        }
    }
}

// Exportar la clase para su uso
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CamposAccessibility;
} else if (typeof window !== 'undefined') {
    window.CamposAccessibility = CamposAccessibility;
}
