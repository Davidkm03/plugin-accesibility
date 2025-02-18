jQuery(document).ready(function($) {
    // Inicializar color pickers
    $('.campos-color-picker').wpColorPicker();

    // Manejar cambios en tiempo real
    function updatePreview() {
        const config = {
            position: $('#campos-position').val(),
            primaryColor: $('#campos-primary-color').val(),
            secondaryColor: $('#campos-secondary-color').val(),
            buttonSize: $('#campos-button-size').val(),
            borderRadius: $('#campos-border-radius').val() + 'px',
            showLabels: $('#campos-show-labels').is(':checked'),
            animations: $('#campos-animations').is(':checked')
        };

        // Actualizar el botón de vista previa
        const $preview = $('#campos-preview-button');
        $preview.css({
            'background-color': config.primaryColor,
            'border-radius': config.borderRadius,
            'padding': config.buttonSize === 'small' ? '8px 16px' : 
                      config.buttonSize === 'medium' ? '12px 20px' : '16px 24px'
        });

        if (!config.showLabels) {
            $preview.find('.text').hide();
        } else {
            $preview.find('.text').show();
        }

        if (!config.animations) {
            $preview.css('transition', 'none');
        } else {
            $preview.css('transition', 'all 0.3s ease');
        }

        // Actualizar posición
        const positions = {
            'top-left': { top: '20px', left: '20px', bottom: 'auto', right: 'auto' },
            'top-right': { top: '20px', right: '20px', bottom: 'auto', left: 'auto' },
            'bottom-left': { bottom: '20px', left: '20px', top: 'auto', right: 'auto' },
            'bottom-right': { bottom: '20px', right: '20px', top: 'auto', left: 'auto' }
        };
        $preview.css(positions[config.position]);
    }

    // Eventos para actualizar la vista previa
    $('.campos-setting').on('change', updatePreview);
    $('.campos-color-picker').wpColorPicker({
        change: updatePreview,
        clear: updatePreview
    });

    // Manejar guardado de configuración
    $('#campos-accessibility-form').on('submit', function(e) {
        e.preventDefault();

        const formData = {
            action: 'save_campos_accessibility_settings',
            nonce: $('#campos_accessibility_nonce').val(),
            settings: {
                position: $('#campos-position').val(),
                primaryColor: $('#campos-primary-color').val(),
                secondaryColor: $('#campos-secondary-color').val(),
                buttonSize: $('#campos-button-size').val(),
                borderRadius: $('#campos-border-radius').val(),
                showLabels: $('#campos-show-labels').is(':checked'),
                animations: $('#campos-animations').is(':checked'),
                features: {
                    motorDisability: $('#campos-motor-disability').is(':checked'),
                    blindness: $('#campos-blindness').is(':checked'),
                    colorBlindness: $('#campos-color-blindness').is(':checked'),
                    dyslexia: $('#campos-dyslexia').is(':checked'),
                    lowVision: $('#campos-low-vision').is(':checked'),
                    cognitive: $('#campos-cognitive').is(':checked'),
                    seizure: $('#campos-seizure').is(':checked'),
                    adhd: $('#campos-adhd').is(':checked')
                }
            }
        };

        $.post(ajaxurl, formData, function(response) {
            if (response.success) {
                // Mostrar mensaje de éxito
                $('#campos-settings-message')
                    .removeClass('error')
                    .addClass('updated')
                    .html('<p>' + response.data.message + '</p>')
                    .show()
                    .delay(3000)
                    .fadeOut();
            } else {
                // Mostrar mensaje de error
                $('#campos-settings-message')
                    .removeClass('updated')
                    .addClass('error')
                    .html('<p>' + response.data.message + '</p>')
                    .show();
            }
        });
    });

    // Manejar reset de configuración
    $('#campos-reset-settings').on('click', function(e) {
        e.preventDefault();
        
        if (confirm('¿Estás seguro de que quieres restablecer la configuración a los valores predeterminados?')) {
            const defaultSettings = {
                position: 'bottom-right',
                primaryColor: '#2c3e50',
                secondaryColor: '#3498db',
                buttonSize: 'medium',
                borderRadius: '50',
                showLabels: true,
                animations: true,
                features: {
                    motorDisability: true,
                    blindness: true,
                    colorBlindness: true,
                    dyslexia: true,
                    lowVision: true,
                    cognitive: true,
                    seizure: true,
                    adhd: true
                }
            };

            // Actualizar campos del formulario
            $('#campos-position').val(defaultSettings.position);
            $('#campos-primary-color').wpColorPicker('color', defaultSettings.primaryColor);
            $('#campos-secondary-color').wpColorPicker('color', defaultSettings.secondaryColor);
            $('#campos-button-size').val(defaultSettings.buttonSize);
            $('#campos-border-radius').val(defaultSettings.borderRadius);
            $('#campos-show-labels').prop('checked', defaultSettings.showLabels);
            $('#campos-animations').prop('checked', defaultSettings.animations);

            // Actualizar checkboxes de características
            Object.keys(defaultSettings.features).forEach(feature => {
                $(`#campos-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`).prop('checked', defaultSettings.features[feature]);
            });

            // Actualizar vista previa
            updatePreview();
        }
    });

    // Inicializar vista previa
    updatePreview();
});
