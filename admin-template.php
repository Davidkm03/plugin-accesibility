<?php if (!defined('ABSPATH')) exit; ?>

<div class="wrap campos-accessibility-admin">
    <div class="campos-admin-header">
        <h1>CamposAccessibility</h1>
        <span class="version">Versión <?php echo esc_html($this->version); ?></span>
    </div>

    <div id="campos-settings-message" style="display: none;"></div>

    <div class="campos-admin-content">
        <div class="campos-settings-panel">
            <form id="campos-accessibility-form" method="post">
                <?php wp_nonce_field('campos_accessibility_nonce', 'campos_accessibility_nonce'); ?>
                
                <h2>Configuración General</h2>
                
                <div class="campos-form-group">
                    <label for="campos-position">Posición del Botón</label>
                    <select id="campos-position" name="position" class="campos-setting">
                        <option value="top-left" <?php selected($settings['position'], 'top-left'); ?>>Superior Izquierda</option>
                        <option value="top-right" <?php selected($settings['position'], 'top-right'); ?>>Superior Derecha</option>
                        <option value="bottom-left" <?php selected($settings['position'], 'bottom-left'); ?>>Inferior Izquierda</option>
                        <option value="bottom-right" <?php selected($settings['position'], 'bottom-right'); ?>>Inferior Derecha</option>
                    </select>
                </div>

                <div class="campos-form-group">
                    <label for="campos-primary-color">Color Principal</label>
                    <input type="text" id="campos-primary-color" name="primaryColor" class="campos-color-picker campos-setting" value="<?php echo esc_attr($settings['primaryColor']); ?>">
                </div>

                <div class="campos-form-group">
                    <label for="campos-secondary-color">Color Secundario</label>
                    <input type="text" id="campos-secondary-color" name="secondaryColor" class="campos-color-picker campos-setting" value="<?php echo esc_attr($settings['secondaryColor']); ?>">
                </div>

                <div class="campos-form-group">
                    <label for="campos-button-size">Tamaño del Botón</label>
                    <select id="campos-button-size" name="buttonSize" class="campos-setting">
                        <option value="small" <?php selected($settings['buttonSize'], 'small'); ?>>Pequeño</option>
                        <option value="medium" <?php selected($settings['buttonSize'], 'medium'); ?>>Mediano</option>
                        <option value="large" <?php selected($settings['buttonSize'], 'large'); ?>>Grande</option>
                    </select>
                </div>

                <div class="campos-form-group">
                    <label for="campos-button-style">Estilo del Botón</label>
                    <select id="campos-button-style" name="buttonStyle" class="campos-setting">
                        <option value="icon-only" <?php selected($settings['buttonStyle'], 'icon-only'); ?>>Solo Icono</option>
                        <option value="icon-text" <?php selected($settings['buttonStyle'], 'icon-text'); ?>>Icono y Texto</option>
                        <option value="text-only" <?php selected($settings['buttonStyle'], 'text-only'); ?>>Solo Texto</option>
                    </select>
                </div>

                <div class="campos-form-group">
                    <label for="campos-border-radius">Radio del Borde (px)</label>
                    <input type="number" id="campos-border-radius" name="borderRadius" class="campos-setting" value="<?php echo esc_attr($settings['borderRadius']); ?>" min="0" max="100">
                </div>

                <div class="campos-form-group">
                    <label>
                        <input type="checkbox" id="campos-show-labels" name="showLabels" class="campos-setting" <?php checked($settings['showLabels']); ?>>
                        Mostrar Etiquetas
                    </label>
                </div>

                <div class="campos-form-group">
                    <label>
                        <input type="checkbox" id="campos-animations" name="animations" class="campos-setting" <?php checked($settings['animations']); ?>>
                        Habilitar Animaciones
                    </label>
                </div>

                <h2>Características de Accesibilidad</h2>
                
                <div class="campos-features-grid">
                    <?php
                    $features = array(
                        'motorDisability' => array(
                            'title' => 'Discapacidad Motora',
                            'description' => 'Navegación por teclado y asistencia de click',
                            'icon' => 'dashicons-admin-generic'
                        ),
                        'blindness' => array(
                            'title' => 'Ceguera',
                            'description' => 'Lector de pantalla y textos alternativos',
                            'icon' => 'dashicons-visibility'
                        ),
                        'colorBlindness' => array(
                            'title' => 'Daltonismo',
                            'description' => 'Filtros de color para diferentes tipos',
                            'icon' => 'dashicons-art'
                        ),
                        'dyslexia' => array(
                            'title' => 'Dislexia',
                            'description' => 'Fuente especial y guía de lectura',
                            'icon' => 'dashicons-editor-spellcheck'
                        ),
                        'lowVision' => array(
                            'title' => 'Visión Baja',
                            'description' => 'Aumento de texto y alto contraste',
                            'icon' => 'dashicons-visibility'
                        ),
                        'cognitive' => array(
                            'title' => 'Cognitivo',
                            'description' => 'Vista simplificada y máscara de lectura',
                            'icon' => 'dashicons-welcome-learn-more'
                        ),
                        'seizure' => array(
                            'title' => 'Epilepsia',
                            'description' => 'Bloqueo de animaciones y movimientos',
                            'icon' => 'dashicons-warning'
                        ),
                        'adhd' => array(
                            'title' => 'TDAH',
                            'description' => 'Modo enfoque y retroalimentación',
                            'icon' => 'dashicons-admin-users'
                        )
                    );

                    foreach ($features as $key => $feature) : ?>
                        <div class="campos-feature-card">
                            <h4>
                                <span class="dashicons <?php echo esc_attr($feature['icon']); ?>"></span>
                                <?php echo esc_html($feature['title']); ?>
                            </h4>
                            <p><?php echo esc_html($feature['description']); ?></p>
                            <div class="campos-feature-toggle">
                                <label>
                                    <input type="checkbox" 
                                           id="campos-<?php echo esc_attr(strtolower(preg_replace('/([A-Z])/', '-$1', $key))); ?>" 
                                           name="features[<?php echo esc_attr($key); ?>]" 
                                           <?php checked($settings['features'][$key]); ?>>
                                    Activar
                                </label>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <div class="campos-submit-section">
                    <a href="#" id="campos-reset-settings" class="button">Restablecer Configuración</a>
                    <button type="submit" class="button button-primary">Guardar Cambios</button>
                </div>
            </form>
        </div>

        <div class="campos-preview-panel">
            <h3>Vista Previa</h3>
            <div class="campos-preview-container">
                <button id="campos-preview-button">
                    <span class="dashicons dashicons-universal-access"></span>
                    <span class="text">Accesibilidad</span>
                </button>
            </div>
        </div>
    </div>
</div>
