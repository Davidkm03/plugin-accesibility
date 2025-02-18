class CamposAccessibility {
    constructor(config = {}) {
        this.initialized = false;
        this.eventHandlers = new Map();
        this.cache = {
            body: null,
            focusableElements: null
        };

        // Event handler methods
        this.addEventHandler = (element, event, fn) => {
            const $element = jQuery(element);
            $element.on(event, fn);
            
            // Store handler for cleanup
            const handlerId = Math.random().toString(36).substring(2);
            this.eventHandlers.set(handlerId, {
                element: $element,
                event,
                fn
            });
            
            return handlerId;
        };

        this.removeEventHandler = (handlerId) => {
            const handler = this.eventHandlers.get(handlerId);
            if (handler) {
                const { element, event, fn } = handler;
                element.off(event, fn);
                this.eventHandlers.delete(handlerId);
            }
        };
        
        // Default configuration
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

        // Available positions
        this.positions = {
            'top-left': { top: '20px', left: '20px' },
            'top-right': { top: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' }
        };

        // Button sizes
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

            // Add skip link at the very beginning
            this.addSkipLink();

            // Add main landmark if not present
            this.addMainLandmark();

            // Add proper landmarks and ARIA roles
            this.addLandmarks();

            // Make phone numbers interactive
            this.makePhoneNumbersClickable();

            // Fix ambiguous links and add external link warnings
            this.fixLinks();

            // Fix form labels and add better error handling
            this.enhanceFormAccessibility();

            // Fix carousel/slider accessibility
            this.enhanceCarouselAccessibility();

            // Fix dropdown menus
            this.enhanceDropdownMenus();

            // Create accessibility widget button
            await this.createWidgetButton();

            this.initialized = true;
        } catch (error) {
            console.error('Error initializing accessibility widget:', error);
            await this.cleanup();
            throw error;
        }
    }

    addSkipLink() {
        if (!jQuery('#skip-to-main-content').length) {
            const skipLink = jQuery('<a>', {
                id: 'skip-to-main-content',
                href: '#main-content',
                text: 'Saltar al contenido principal',
                'aria-label': 'Saltar al contenido principal'
            }).css({
                position: 'absolute',
                top: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: this.config.primaryColor,
                color: '#ffffff',
                padding: '8px 16px',
                zIndex: this.config.zIndex + 2,
                textDecoration: 'none',
                borderRadius: '0 0 4px 4px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                transition: 'top 0.3s ease'
            });

            skipLink.focus(function() {
                jQuery(this).css('top', '0');
            }).blur(function() {
                jQuery(this).css('top', '-40px');
            });

            this.cache.body.prepend(skipLink);
        }
    }

    addMainLandmark() {
        if (!jQuery('main, [role="main"]').length) {
            const mainContent = jQuery('body > div:not(#skip-to-main-content)').first();
            mainContent.attr({
                role: 'main',
                id: 'main-content',
                'aria-label': 'Contenido principal'
            });
        }
    }

    addLandmarks() {
        const landmarks = {
            'header, .header': { role: 'banner', label: 'Encabezado del sitio' },
            'nav, .nav, .navigation': { role: 'navigation', label: 'Navegación principal' },
            'main, [role="main"], #main-content': { role: 'main', label: 'Contenido principal' },
            'footer, .footer': { role: 'contentinfo', label: 'Pie de página' },
            'aside, .sidebar': { role: 'complementary', label: 'Contenido complementario' },
            'form[role="search"], .search-form': { role: 'search', label: 'Búsqueda' }
        };

        Object.entries(landmarks).forEach(([selector, config]) => {
            jQuery(selector).each(function() {
                const $element = jQuery(this);
                if (!$element.attr('role')) {
                    $element.attr({
                        role: config.role,
                        'aria-label': config.label
                    });
                }
            });
        });
    }

    makePhoneNumbersClickable() {
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        jQuery('body').find('*').contents().filter(function() {
            return this.nodeType === 3 && phoneRegex.test(this.nodeValue);
        }).each(function() {
            const text = this.nodeValue;
            const phoneNumbers = text.match(phoneRegex);
            if (phoneNumbers) {
                let newHtml = text;
                phoneNumbers.forEach(phone => {
                    const cleanPhone = phone.replace(/[^\d+]/g, '');
                    newHtml = newHtml.replace(
                        phone,
                        `<a href="tel:${cleanPhone}" aria-label="Llamar al ${phone}">${phone}</a>`
                    );
                });
                jQuery(this).replaceWith(newHtml);
            }
        });
    }

    fixLinks() {
        jQuery('a').each(function() {
            const $link = jQuery(this);
            const text = $link.text().trim();
            const href = $link.attr('href');
            
            // Add warning for external links
            if (href && (href.startsWith('http') || href.startsWith('//')) && !href.includes(window.location.hostname)) {
                $link.attr('aria-label', `${text} - Se abre en una nueva ventana`);
                $link.attr('target', '_blank');
                $link.attr('rel', 'noopener noreferrer');
            }
            
            // Fix ambiguous link text
            if (/^(más|más información|leer más|click aquí|aquí|ver|ver más)$/i.test(text)) {
                const context = $link.closest('p, div, li').text().trim();
                const newLabel = `${text} sobre ${context.substring(0, 50)}...`;
                $link.attr('aria-label', newLabel);
            }
        });
    }

    enhanceFormAccessibility() {
        jQuery('input, select, textarea').each(function() {
            const $input = jQuery(this);
            
            // Ensure proper labels
            if (!$input.attr('id')) {
                const id = `input-${Math.random().toString(36).substring(2, 9)}`;
                $input.attr('id', id);
            }

            if (!$input.attr('aria-label') && !$input.attr('aria-labelledby')) {
                const $label = jQuery(`label[for="${$input.attr('id')}"]`);
                if ($label.length) {
                    const labelId = $label.attr('id') || `label-${$input.attr('id')}`;
                    $label.attr('id', labelId);
                    $input.attr('aria-labelledby', labelId);
                } else {
                    const placeholder = $input.attr('placeholder');
                    const name = $input.attr('name');
                    let label = placeholder || name;
                    
                    // Make label more descriptive
                    if (name && name.toLowerCase().includes('billing')) {
                        label = `Información de facturación - ${label}`;
                    }
                    
                    $input.attr('aria-label', label);
                }
            }

            // Add proper error handling
            $input.on('invalid', function(e) {
                const $this = jQuery(this);
                const name = $this.attr('name') || $this.attr('aria-label') || 'campo';
                $this.attr('aria-invalid', 'true');
                $this.attr('aria-errormessage', `error-${$this.attr('id')}`);
                
                const errorId = `error-${$this.attr('id')}`;
                if (!jQuery(`#${errorId}`).length) {
                    const errorMsg = jQuery('<div>', {
                        id: errorId,
                        class: 'error-message',
                        role: 'alert',
                        'aria-live': 'polite',
                        text: `Error en ${name}: ${e.target.validationMessage}`
                    }).css({
                        color: '#dc3545',
                        fontSize: '0.875em',
                        marginTop: '4px'
                    });
                    $this.after(errorMsg);
                }
            });
        });
    }

    enhanceCarouselAccessibility() {
        jQuery('.carousel, .slider').each(function() {
            const $carousel = jQuery(this);
            const $slides = $carousel.find('.slide, .item');
            const $controls = $carousel.find('.controls, .dots, .nav');
            
            // Move controls before content for proper tab order
            if ($controls.length) {
                $carousel.prepend($controls);
            }
            
            // Add proper ARIA attributes
            $carousel.attr({
                role: 'region',
                'aria-label': 'Carrusel de contenido',
                'aria-roledescription': 'carrusel'
            });
            
            $slides.each(function(index) {
                jQuery(this).attr({
                    role: 'tabpanel',
                    'aria-label': `Diapositiva ${index + 1} de ${$slides.length}`,
                    'aria-hidden': index === 0 ? 'false' : 'true'
                });
            });
        });
    }

    enhanceDropdownMenus() {
        jQuery('.dropdown, [role="menu"]').each(function() {
            const $dropdown = jQuery(this);
            const $trigger = $dropdown.find('[aria-haspopup]');
            const $menu = $dropdown.find('.dropdown-menu, [role="menu"]');
            
            if ($trigger.length && $menu.length) {
                const menuId = `menu-${Math.random().toString(36).substring(2, 9)}`;
                $menu.attr('id', menuId);
                
                $trigger.attr({
                    'aria-expanded': 'false',
                    'aria-controls': menuId
                });
                
                $trigger.on('click', function() {
                    const isExpanded = $trigger.attr('aria-expanded') === 'true';
                    $trigger.attr('aria-expanded', (!isExpanded).toString());
                    $menu.attr('aria-hidden', isExpanded.toString());
                    
                    if (!isExpanded) {
                        setTimeout(() => {
                            $menu.find('a, button').first().focus();
                        }, 100);
                    }
                });
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
                const spaceAbove = buttonPos.top - 10;
                const spaceBelow = windowHeight - (buttonPos.top + buttonHeight + 10);

                if (spaceBelow >= menuHeight || spaceBelow >= spaceAbove) {
                    // Show below if enough space or more space below than above
                    top = buttonPos.top + buttonHeight + 10;
                    if (top + menuHeight > windowHeight - 10) {
                        top = windowHeight - menuHeight - 10;
                    }
                } else {
                    // Show above
                    top = buttonPos.top - menuHeight - 10;
                    if (top < 10) {
                        top = 10;
                    }
                }

                // Apply position with smooth animation
                menu.css({
                    position: 'fixed',
                    top: top,
                    left: left,
                    width: Math.min(menuWidth, windowWidth - 20),
                    maxHeight: Math.min(menuHeight, windowHeight - 20),
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    zIndex: this.config.zIndex + 1,
                    opacity: 0,
                    display: 'block',
                    visibility: 'visible',
                    transform: 'translateY(10px)',
                    transition: 'transform 0.2s ease-out'
                }).animate({
                    opacity: 1,
                    transform: 'translateY(0)'
                }, {
                    duration: 200,
                    queue: false,
                    start: () => {
                        menu.css('transform', 'translateY(0)');
                    }
                });

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
            
            // Clean up previous event handlers
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

    cleanup() {
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
}

// Export the class for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CamposAccessibility;
} else if (typeof window !== 'undefined') {
    window.CamposAccessibility = CamposAccessibility;
}
