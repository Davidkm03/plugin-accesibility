class CamposAccessibility {
    constructor(config = {}) {
        if (!config.apiKey) {
            throw new Error('CamposAccessibility: API key is required');
        }
        
        // Validate API key format (UUID v4)
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(config.apiKey)) {
            throw new Error('CamposAccessibility: Invalid API key format');
        }
        
        this.apiKey = config.apiKey;
        this.baseUrl = 'https://api.userway.org/api/open/v0/consumer';
        this.siteId = null;
        this.initialized = false;
        this.eventHandlers = new Map();
        this.cache = {
            body: null,
            focusableElements: null
        };
        
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
            buttonIcon: config.buttonIcon || 'dashicons-universal-access'
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
        if (this.initialized) {
            console.warn('CamposAccessibility: Widget already initialized');
            return;
        }

        try {
            // Initialize cache
            this.cache.body = jQuery('body');
            this.cache.focusableElements = jQuery('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');

            // Security token for CSRF protection
            this.nonce = Math.random().toString(36).substring(2);

            // Initialize components
            await this.createWidgetButton();
            await this.initializeAccessibilityEnhancements();
            
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing accessibility widget:', error);
            await this.cleanup();
            throw error;
        }
    }

    async cleanup() {
        try {
            // Remove event handlers
            this.eventHandlers.forEach((handler, element) => {
                jQuery(element).off(handler.event, handler.fn);
            });
            this.eventHandlers.clear();

            // Remove dynamic elements
            const elementsToRemove = [
                '#campos-accessibility-button',
                '#campos-accessibility-menu',
                '#keyboard-focus-indicator',
                '#color-filters-overlay',
                '#focus-mode-overlay'
            ];
            
            elementsToRemove.forEach(selector => {
                const element = jQuery(selector);
                if (element.length) {
                    element.remove();
                }
            });

            // Reset body classes
            if (this.cache.body) {
                const classesToRemove = [
                    'keyboard-navigation',
                    'simplified-view',
                    'dyslexia-support',
                    'color-filters',
                    'screen-reader',
                    'focus-mode'
                ];
                this.cache.body.removeClass(classesToRemove.join(' '));
            }

            // Clear cache
            this.cache.body = null;
            this.cache.focusableElements = null;
            
            this.initialized = false;
        } catch (error) {
            console.error('Error during cleanup:', error);
            throw error;
        }
    }

    // Add event handler with tracking
    addEventHandler(element, event, fn) {
        jQuery(element).on(event, fn);
        this.eventHandlers.set(element, { event, fn });
    }

    // Remove event handler with tracking
    removeEventHandler(element, event) {
        const handler = this.eventHandlers.get(element);
        if (handler && handler.event === event) {
            jQuery(element).off(event, handler.fn);
            this.eventHandlers.delete(element);
        }
    }

    async initializeAccessibilityEnhancements() {
        return new Promise((resolve, reject) => {
            try {
                jQuery(document).ready(() => {
                    // Cache commonly used selectors
                    const selectors = {
                        images: 'img:not([alt])',
                        links: 'a:not([aria-label])',
                        forms: 'input, select, textarea',
                        headings: 'h1, h2, h3, h4, h5, h6'
                    };

                    // Add ARIA roles to main elements
                    const ariaRoles = {
                        'header': 'banner',
                        'nav': 'navigation',
                        'main, [role="main"]': 'main',
                        'footer': 'contentinfo',
                        'aside': 'complementary',
                        'form[role="search"]': 'search'
                    };

                    Object.entries(ariaRoles).forEach(([selector, role]) => {
                        const elements = jQuery(selector);
                        if (elements.length) {
                            elements.attr('role', role);
                            elements.attr('aria-label', role.charAt(0).toUpperCase() + role.slice(1));
                        }
                    });

                    // Enhance images accessibility
                    const images = jQuery(selectors.images);
                    if (images.length) {
                        images.each((_, img) => {
                            const $img = jQuery(img);
                            const altText = this.generateAltText($img);
                            $img.attr('alt', altText);
                        });
                    }

                    // Enhance links accessibility
                    const links = jQuery(selectors.links);
                    if (links.length) {
                        links.each((_, link) => {
                            const $link = jQuery(link);
                            const ariaLabel = $link.text().trim() || 
                                            $link.attr('title') || 
                                            'Enlace' + ($link.attr('href') ? ' a ' + $link.attr('href') : '');
                            $link.attr('aria-label', ariaLabel);
                        });
                    }

                    // Enhance form accessibility
                    const forms = jQuery(selectors.forms);
                    if (forms.length) {
                        forms.each((_, input) => {
                            const $input = jQuery(input);
                            if (!$input.attr('id')) {
                                const randomId = 'input-' + this.generateUniqueId();
                                $input.attr('id', randomId);
                            }

                            if (!$input.attr('aria-label') && !$input.attr('aria-labelledby')) {
                                const $label = jQuery(`label[for="${$input.attr('id')}"]`);
                                if ($label.length) {
                                    const labelId = $label.attr('id') || `label-${$input.attr('id')}`;
                                    $label.attr('id', labelId);
                                    $input.attr('aria-labelledby', labelId);
                                } else {
                                    const ariaLabel = $input.attr('placeholder') || 
                                                    $input.attr('name') || 
                                                    'Campo de entrada';
                                    $input.attr('aria-label', ariaLabel);
                                }
                            }
                        });
                    }

                    // Add skip link if not present
                    if (!jQuery('#skip-to-main-content').length) {
                        this.createSkipLink();
                    }

                    // Add landmark roles to improve navigation
                    this.addLandmarkRoles();

                    resolve();
                });
            } catch (error) {
                console.error('Error in initializeAccessibilityEnhancements:', error);
                reject(error);
            }
        });
    }

    generateAltText($img) {
        // Try to generate meaningful alt text
        const fileName = $img.attr('src')?.split('/')?.pop()?.split('.')[0] || '';
        const nearestText = $img.closest('figure').find('figcaption').text() || 
                          $img.closest('div').find('p').first().text() || 
                          '';
        
        return nearestText || 
               this.toReadableText(fileName) || 
               'Imagen sin descripción';
    }

    toReadableText(text) {
        if (!text) return '';
        return text
            .replace(/[_-]/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase()
            .trim();
    }

    generateUniqueId() {
        return Math.random().toString(36).substr(2, 9) + 
               '-' + 
               Date.now().toString(36);
    }

    createSkipLink() {
        const skipLink = jQuery('<a>', {
            id: 'skip-to-main-content',
            href: '#main-content',
            text: 'Saltar al contenido principal',
            'aria-label': 'Saltar al contenido principal'
        }).css({
            position: 'absolute',
            top: '-40px',
            left: '0',
            background: this.config.primaryColor,
            color: '#ffffff',
            padding: '8px 16px',
            zIndex: this.config.zIndex + 1,
            transition: 'top 0.3s ease',
            textDecoration: 'none',
            borderRadius: '0 0 4px 4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        });

        // Add event handlers with tracking
        this.addEventHandler(skipLink, 'focus', function() {
            jQuery(this).css('top', '0');
        });

        this.addEventHandler(skipLink, 'blur', function() {
            jQuery(this).css('top', '-40px');
        });

        this.cache.body.prepend(skipLink);
    }

    addLandmarkRoles() {
        // Add missing landmark roles and labels
        const landmarks = {
            'main': {
                role: 'main',
                label: 'Contenido principal'
            },
            'nav': {
                role: 'navigation',
                label: 'Navegación principal'
            },
            'aside': {
                role: 'complementary',
                label: 'Contenido complementario'
            },
            'footer': {
                role: 'contentinfo',
                label: 'Información de pie de página'
            }
        };

        Object.entries(landmarks).forEach(([selector, config]) => {
            const elements = jQuery(selector + ':not([role])');
            if (elements.length) {
                elements.attr('role', config.role);
                elements.attr('aria-label', config.label);
            }
        });
    }

    async createWidgetButton() {
        try {
            // Remove existing button if present
            jQuery('#campos-accessibility-button').remove();

            const button = jQuery('<button>', {
                id: 'campos-accessibility-button',
                'aria-label': 'Opciones de accesibilidad',
                'aria-haspopup': 'true',
                'aria-expanded': 'false',
                'aria-controls': 'campos-accessibility-menu',
                class: 'campos-accessibility-button',
                role: 'button'
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
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                ...this.positions[this.config.position]
            });

            // Create button content
            if (this.config.buttonStyle === 'icon-only' || this.config.buttonStyle === 'icon-text') {
                const icon = jQuery('<span>', {
                    class: 'dashicons ' + this.config.buttonIcon,
                    'aria-hidden': 'true',
                    role: 'presentation'
                }).css({
                    fontSize: this.sizes[this.config.buttonSize].iconSize,
                    lineHeight: '1'
                });
                button.append(icon);
            }

            if (this.config.buttonStyle === 'text-only' || this.config.buttonStyle === 'icon-text') {
                const text = jQuery('<span>', {
                    class: 'text',
                    text: this.config.buttonText
                }).css({
                    fontSize: this.sizes[this.config.buttonSize].fontSize,
                    fontWeight: '500'
                });
                button.append(text);
            }

            // Add animations if enabled
            if (this.config.animations) {
                button.css('transition', 'all 0.3s ease');
                this.addEventHandler(button, 'mouseenter', () => {
                    button.css('transform', 'scale(1.05)');
                });
                this.addEventHandler(button, 'mouseleave', () => {
                    button.css('transform', 'scale(1)');
                });
            }

            // Add keyboard support
            this.addEventHandler(button, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleMenu();
                }
            });

            // Add click handler with tracking
            this.addEventHandler(button, 'click', () => this.toggleMenu());

            // Add high contrast mode support
            button.attr('data-high-contrast', 'true');
            
            this.cache.body.append(button);
            this.widgetButton = button;

            // Add resize handler for responsive positioning
            this.addEventHandler(window, 'resize', this.debounce(() => {
                this.updateButtonPosition();
            }, 250));

        } catch (error) {
            console.error('Error creating widget button:', error);
            throw error;
        }
    }

    updateButtonPosition() {
        if (this.widgetButton) {
            const windowWidth = window.innerWidth;
            const buttonWidth = this.widgetButton.outerWidth();
            const position = this.config.position;
            
            // Adjust position for small screens
            if (windowWidth < 768 && (position === 'top-right' || position === 'bottom-right')) {
                this.widgetButton.css({
                    right: '10px',
                    left: 'auto'
                });
            } else if (windowWidth < 768 && (position === 'top-left' || position === 'bottom-left')) {
                this.widgetButton.css({
                    left: '10px',
                    right: 'auto'
                });
            } else {
                this.widgetButton.css(this.positions[position]);
            }
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    toggleMenu() {
        try {
            let menu = jQuery('#campos-accessibility-menu');
            
            if (menu.length === 0) {
                menu = this.createMenu();
                jQuery('body').append(menu);
            }

            const isVisible = menu.is(':visible');
            const button = this.widgetButton;
            
            button.attr('aria-expanded', (!isVisible).toString());

            if (isVisible) {
                menu.fadeOut(200);
            } else {
                const buttonPos = button.offset();
                const menuWidth = parseInt(this.config.menuWidth);
                const windowHeight = jQuery(window).height();
                const windowWidth = jQuery(window).width();
                
                // Calculate menu position
                let left = this.config.menuPosition === 'right' ? 
                    buttonPos.left - menuWidth + button.outerWidth() : 
                    buttonPos.left;

                // Ensure menu stays within window bounds horizontally
                left = Math.max(10, Math.min(left, windowWidth - menuWidth - 10));

                // Get menu height (or estimate if not visible)
                menu.css('visibility', 'hidden').show();
                const menuHeight = menu.outerHeight() || 400;
                menu.hide().css('visibility', '');

                // Determine optimal vertical position
                let top;
                const buttonHeight = button.outerHeight();
                const spaceAbove = buttonPos.top - 10; // Space above button
                const spaceBelow = windowHeight - (buttonPos.top + buttonHeight + 10); // Space below button

                if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
                    // Show below if enough space or more space below than above
                    top = buttonPos.top + buttonHeight + 10;
                } else {
                    // Show above
                    top = Math.max(10, buttonPos.top - menuHeight - 10);
                }

                // Apply position with smooth animation
                menu.css({
                    position: 'fixed',
                    top: top,
                    left: left,
                    maxHeight: Math.min(menuHeight, windowHeight - 20),
                    overflowY: 'auto',
                    zIndex: this.config.zIndex + 1,
                    opacity: 0,
                    display: 'block'
                }).animate({
                    opacity: 1
                }, 200);

                // Add keyboard trap for menu
                this.trapFocus(menu);

                // Add click outside handler
                setTimeout(() => {
                    jQuery(document).on('click.accessibility-menu', (e) => {
                        if (!menu.is(e.target) && 
                            !button.is(e.target) && 
                            menu.has(e.target).length === 0 && 
                            button.has(e.target).length === 0) {
                            this.toggleMenu();
                            jQuery(document).off('click.accessibility-menu');
                        }
                    });
                }, 0);

                // Add window resize handler
                jQuery(window).on('resize.accessibility-menu', this.debounce(() => {
                    if (menu.is(':visible')) {
                        this.toggleMenu();
                        this.toggleMenu();
                    }
                }, 150));
            }
        } catch (error) {
            console.error('Error toggling menu:', error);
            throw error;
        }
    }

    trapFocus(menu) {
        const focusableElements = menu.find('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements.first();
        const lastFocusable = focusableElements.last();

        this.addEventHandler(menu, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggleMenu();
                this.widgetButton.focus();
                return;
            }

            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable[0]) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable[0]) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });

        firstFocusable.focus();
    }

    createMenu() {
        const menu = jQuery('<div>', {
            id: 'campos-accessibility-menu',
            class: 'campos-accessibility-menu',
            'aria-label': 'Menú de accesibilidad',
            role: 'dialog',
            'aria-modal': 'true'
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
            { id: 'motorDisability', title: 'Navegación por teclado', icon: 'dashicons-admin-generic', description: 'Mejora la navegación usando el teclado' },
            { id: 'blindness', title: 'Lector de pantalla', icon: 'dashicons-visibility', description: 'Optimiza el contenido para lectores de pantalla' },
            { id: 'colorBlindness', title: 'Filtros de color', icon: 'dashicons-art', description: 'Ajusta los colores para daltonismo' },
            { id: 'dyslexia', title: 'Ayuda para dislexia', icon: 'dashicons-editor-spellcheck', description: 'Facilita la lectura para personas con dislexia' },
            { id: 'lowVision', title: 'Aumentar texto', icon: 'dashicons-visibility', description: 'Aumenta el tamaño del texto' },
            { id: 'cognitive', title: 'Vista simplificada', icon: 'dashicons-welcome-learn-more', description: 'Simplifica la presentación del contenido' },
            { id: 'seizure', title: 'Reducir animaciones', icon: 'dashicons-warning', description: 'Reduce o elimina las animaciones' },
            { id: 'adhd', title: 'Modo enfoque', icon: 'dashicons-admin-users', description: 'Ayuda a mantener el enfoque en el contenido' }
        ];

        features.forEach(feature => {
            const button = jQuery('<button>', {
                class: 'campos-feature-button',
                'data-feature': feature.id,
                'aria-pressed': 'false',
                role: 'switch',
                'aria-label': `${feature.title}: ${feature.description}`
            }).css({
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px',
                margin: '4px 0',
                border: 'none',
                borderRadius: '4px',
                background: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            });

            const icon = jQuery('<span>', {
                class: `dashicons ${feature.icon}`,
                'aria-hidden': 'true'
            });

            const textContainer = jQuery('<div>').css({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px'
            });

            const title = jQuery('<span>', {
                text: feature.title,
                class: 'feature-title'
            }).css({
                fontWeight: '500'
            });

            const description = jQuery('<span>', {
                text: feature.description,
                class: 'feature-description'
            }).css({
                fontSize: '0.85em',
                color: '#666'
            });

            textContainer.append(title, description);
            button.append(icon, textContainer);

            this.addEventHandler(button, 'mouseenter', () => {
                button.css({
                    background: '#f0f0f0',
                    transform: 'translateX(5px)'
                });
            });

            this.addEventHandler(button, 'mouseleave', () => {
                button.css({
                    background: 'none',
                    transform: 'translateX(0)'
                });
            });

            this.addEventHandler(button, 'click', () => this.toggleFeature(feature.id, button));

            menu.append(button);
        });

        return menu;
    }

    toggleFeature(featureId, button) {
        try {
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
        } catch (error) {
            console.error('Error toggling feature:', error);
            throw error;
        }
    }

    toggleKeyboardNavigation() {
        try {
            const body = this.cache.body;
            const isEnabled = body.hasClass('keyboard-navigation');
            
            // Limpiar eventos anteriores si existen
            if (this.keyboardNavHandler) {
                jQuery(document).off('focusin.keyboard-nav focusout.keyboard-nav');
                delete this.keyboardNavHandler;
            }
        
            if (!isEnabled) {
                body.addClass('keyboard-navigation');
                
                this.cache.focusableElements.css({
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
                
                body.append(focusIndicator);
                
                this.keyboardNavHandler = true;
                this.addEventHandler(document, 'focusin.keyboard-nav', function(e) {
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
                
                this.addEventHandler(document, 'focusout.keyboard-nav', function() {
                    focusIndicator.css('display', 'none');
                });
            } else {
                body.removeClass('keyboard-navigation');
                
                this.cache.focusableElements.css({
                    'outline': '',
                    'outline-offset': ''
                });
                
                jQuery('#keyboard-focus-indicator').remove();
            }
        } catch (error) {
            console.error('Error toggling keyboard navigation:', error);
            throw error;
        }
    }

    adjustFontSize(factor) {
        try {
            this.cache.body.find('*').each(function() {
                const el = jQuery(this);
                const currentSize = parseFloat(el.css('font-size'));
                if (!isNaN(currentSize)) {
                    el.css('font-size', (currentSize * factor) + 'px');
                }
            });
        } catch (error) {
            console.error('Error adjusting font size:', error);
            throw error;
        }
    }

    toggleSimplifiedView() {
        try {
            const body = this.cache.body;
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
        } catch (error) {
            console.error('Error toggling simplified view:', error);
            throw error;
        }
    }

    toggleDyslexiaSupport() {
        try {
            const body = this.cache.body;
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
        } catch (error) {
            console.error('Error toggling dyslexia support:', error);
            throw error;
        }
    }

    toggleColorFilters() {
        try {
            const body = this.cache.body;
            if (!body.hasClass('color-filters')) {
                body.addClass('color-filters');
                const filters = jQuery('<div>', {
                    id: 'color-filters-overlay',
                    'aria-hidden': 'true'
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
                body.append(filters);
            } else {
                body.removeClass('color-filters');
                jQuery('#color-filters-overlay').remove();
            }
        } catch (error) {
            console.error('Error toggling color filters:', error);
            throw error;
        }
    }

    toggleScreenReader() {
        try {
            const body = this.cache.body;
            if (!body.hasClass('screen-reader')) {
                body.addClass('screen-reader');
                jQuery('img:not([alt])').attr('alt', 'Imagen sin descripción');
                jQuery('a:not([aria-label])').each(function() {
                    const link = jQuery(this);
                    link.attr('aria-label', link.text().trim() || link.attr('title') || 'Enlace');
                });
            } else {
                body.removeClass('screen-reader');
            }
        } catch (error) {
            console.error('Error toggling screen reader:', error);
            throw error;
        }
    }

    toggleFocusMode() {
        try {
            const body = this.cache.body;
            if (!body.hasClass('focus-mode')) {
                body.addClass('focus-mode');
                const overlay = jQuery('<div>', {
                    id: 'focus-mode-overlay',
                    'aria-hidden': 'true'
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
                body.append(overlay);

                const focusableContent = 'p, h1, h2, h3, h4, h5, h6, img, button, input, textarea';
                this.addEventHandler(focusableContent, 'mouseenter', function() {
                    jQuery(this).css({
                        position: 'relative',
                        zIndex: 999999,
                        backgroundColor: 'white',
                        padding: '10px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.5)'
                    });
                });

                this.addEventHandler(focusableContent, 'mouseleave', function() {
                    jQuery(this).css({
                        position: '',
                        zIndex: '',
                        backgroundColor: '',
                        padding: '',
                        boxShadow: ''
                    });
                });
            } else {
                body.removeClass('focus-mode');
                jQuery('#focus-mode-overlay').remove();
                jQuery('p, h1, h2, h3, h4, h5, h6, img, button, input, textarea').off('mouseenter mouseleave');
            }
        } catch (error) {
            console.error('Error toggling focus mode:', error);
            throw error;
        }
    }
}

// Exportar la clase para su uso
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CamposAccessibility;
} else if (typeof window !== 'undefined') {
    window.CamposAccessibility = CamposAccessibility;
}
