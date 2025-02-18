<?php
/*
Plugin Name: CamposAccessibility
Plugin URI: https://davidcampos.com.co
Description: Plugin de accesibilidad web que proporciona herramientas para diferentes tipos de discapacidades.
Version: 1.0.0
Author: Juan David Valor Campos
Author URI: https://davidcampos.com.co
License: GPL v2 or later
*/

if (!defined('ABSPATH')) {
    exit;
}

class CamposAccessibility {
    private $plugin_path;
    private $plugin_url;
    private $version = '1.0.0';

    public function __construct() {
        $this->plugin_path = plugin_dir_path(__FILE__);
        $this->plugin_url = plugin_dir_url(__FILE__);

        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        add_action('wp_ajax_save_campos_accessibility_settings', array($this, 'save_settings'));
    }

    public function add_admin_menu() {
        add_menu_page(
            'CamposAccessibility',
            'Accesibilidad',
            'manage_options',
            'campos-accessibility',
            array($this, 'render_admin_page'),
            'dashicons-universal-access-alt',
            100
        );
    }

    public function admin_enqueue_scripts($hook) {
        if ($hook !== 'toplevel_page_campos-accessibility') {
            return;
        }

        wp_enqueue_style('wp-color-picker');
        wp_enqueue_style('campos-accessibility-admin', $this->plugin_url . 'admin.css', array(), $this->version);
        wp_enqueue_script('campos-accessibility-admin', $this->plugin_url . 'admin.js', array('jquery', 'wp-color-picker'), $this->version, true);
    }

    public function frontend_enqueue_scripts() {
        wp_enqueue_style('dashicons');
        wp_enqueue_style('campos-accessibility', $this->plugin_url . 'dashicons.css', array(), $this->version);
        wp_enqueue_script('campos-accessibility', $this->plugin_url . 'campos-accessibility.js', array('jquery'), $this->version, true);

        $settings = get_option('campos_accessibility_settings', $this->get_default_settings());
        wp_localize_script('campos-accessibility', 'camposAccessibilitySettings', $settings);
    }

    private function get_default_settings() {
        return array(
            'position' => 'bottom-right',
            'primaryColor' => '#2c3e50',
            'secondaryColor' => '#3498db',
            'buttonSize' => 'medium',
            'borderRadius' => '50',
            'showLabels' => true,
            'animations' => true,
            'features' => array(
                'motorDisability' => true,
                'blindness' => true,
                'colorBlindness' => true,
                'dyslexia' => true,
                'lowVision' => true,
                'cognitive' => true,
                'seizure' => true,
                'adhd' => true
            )
        );
    }

    public function save_settings() {
        check_ajax_referer('campos_accessibility_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'No tienes permisos para realizar esta acción.'));
        }

        $settings = isset($_POST['settings']) ? $_POST['settings'] : array();
        $sanitized_settings = $this->sanitize_settings($settings);
        
        update_option('campos_accessibility_settings', $sanitized_settings);
        wp_send_json_success(array('message' => 'Configuración guardada exitosamente.'));
    }

    private function sanitize_settings($settings) {
        return array(
            'position' => sanitize_text_field($settings['position']),
            'primaryColor' => sanitize_hex_color($settings['primaryColor']),
            'secondaryColor' => sanitize_hex_color($settings['secondaryColor']),
            'buttonSize' => sanitize_text_field($settings['buttonSize']),
            'borderRadius' => absint($settings['borderRadius']),
            'showLabels' => (bool) $settings['showLabels'],
            'animations' => (bool) $settings['animations'],
            'features' => array(
                'motorDisability' => (bool) $settings['features']['motorDisability'],
                'blindness' => (bool) $settings['features']['blindness'],
                'colorBlindness' => (bool) $settings['features']['colorBlindness'],
                'dyslexia' => (bool) $settings['features']['dyslexia'],
                'lowVision' => (bool) $settings['features']['lowVision'],
                'cognitive' => (bool) $settings['features']['cognitive'],
                'seizure' => (bool) $settings['features']['seizure'],
                'adhd' => (bool) $settings['features']['adhd']
            )
        );
    }

    public function render_admin_page() {
        if (!current_user_can('manage_options')) {
            return;
        }

        $settings = get_option('campos_accessibility_settings', $this->get_default_settings());
        ?>
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
                            <div class="campos-feature-card">
                                <h4><span class="dashicons dashicons-admin-generic"></span> Discapacidad Motora</h4>
                                <p>Navegación por teclado y asistencia de click</p>
                                <div class="campos-feature-toggle">
                                    <label>
                                        <input type="checkbox" id="campos-motor-disability" name="features[motorDisability]" <?php checked($settings['features']['motorDisability']); ?>>
                                        Activar
                                    </label>
                                </div>
                            </div>

                            <div class="campos-feature-card">
                                <h4><span class="dashicons dashicons-visibility"></span> Ceguera</h4>
                                <p>Lector de pantalla y textos alternativos</p>
                                <div class="campos-feature-toggle">
                                    <label>
                                        <input type="checkbox" id="campos-blindness" name="features[blindness]" <?php checked($settings['features']['blindness']); ?>>
                                        Activar
                                    </label>
                                </div>
                            </div>

                            <div class="campos-feature-card">
                                <h4><span class="dashicons dashicons-art"></span> Daltonismo</h4>
                                <p>Filtros de color para diferentes tipos</p>
                                <div class="campos-feature-toggle">
                                    <label>
                                        <input type="checkbox" id="campos-color-blindness" name="features[colorBlindness]" <?php checked($settings['features']['colorBlindness']); ?>>
                                        Activar
                                    </label>
                                </div>
                            </div>

                            <div class="campos-feature-card">
                                <h4><span class="dashicons dashicons-editor-spellcheck"></span> Dislexia</h4>
                                <p>Fuente especial y guía de lectura</p>
                                <div class="campos-feature-toggle">
                                    <label>
                                        <input type="checkbox" id="campos-dyslexia" name="features[dyslexia]" <?php checked($settings['features']['dyslexia']); ?>>
                                        Activar
                                    </label>
                                </div>
                            </div>

                            <div class="campos-feature-card">
                                <h4><span class="dashicons dashicons-visibility"></span> Visión Baja</h4>
                                <p>Aumento de texto y alto contraste</p>
                                <div class="campos-feature-toggle">
                                    <label>
                                        <input type="checkbox" id="campos-low-vision" name="features[lowVision]" <?php checked($settings['features']['lowVision']); ?>>
                                        Activar
                                    </label>
                                </div>
                            </div>

                            <div class="campos-feature-card">
                                <h4><span class="dashicons dashicons-welcome-learn-more"></span> Cognitivo</h4>
                                <p>Vista simplificada y máscara de lectura</p>
                                <div class="campos-feature-toggle">
                                    <label>
                                        <input type="checkbox" id="campos-cognitive" name="features[cognitive]" <?php checked($settings['features']['cognitive']); ?>>
                                        Activar
                                    </label>
                                </div>
                            </div>

                            <div class="campos-feature-card">
                                <h4><span class="dashicons dashicons-warning"></span> Epilepsia</h4>
                                <p>Bloqueo de animaciones y movimientos</p>
                                <div class="campos-feature-toggle">
                                    <label>
                                        <input type="checkbox" id="campos-seizure" name="features[seizure]" <?php checked($settings['features']['seizure']); ?>>
                                        Activar
                                    </label>
                                </div>
                            </div>

                            <div class="campos-feature-card">
                                <h4><span class="dashicons dashicons-admin-users"></span> TDAH</h4>
                                <p>Modo enfoque y retroalimentación</p>
                                <div class="campos-feature-toggle">
                                    <label>
                                        <input type="checkbox" id="campos-adhd" name="features[adhd]" <?php checked($settings['features']['adhd']); ?>>
                                        Activar
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="campos-submit-section">
                            <a href="#" id="campos-reset-settings">Restablecer Configuración</a>
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
        <?php
    }
}

// Inicializar el plugin
function campos_accessibility_init() {
    new CamposAccessibility();
}
add_action('plugins_loaded', 'campos_accessibility_init');
