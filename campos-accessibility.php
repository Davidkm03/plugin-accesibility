<?php
/*
Plugin Name: CamposAccessibility
Plugin URI: https://davidcampos.com.co
Description: Plugin de accesibilidad web que proporciona herramientas para diferentes tipos de discapacidades.
Version: 1.0.2
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
    private $version = '1.0.2';
    private $github_repo = 'Davidkm03/plugin-accesibility';
    private $update_url = 'https://api.github.com/repos/Davidkm03/plugin-accesibility/releases/latest';

    public function __construct() {
        $this->plugin_path = plugin_dir_path(__FILE__);
        $this->plugin_url = plugin_dir_url(__FILE__);

        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
        add_action('wp_enqueue_scripts', array($this, 'frontend_enqueue_scripts'));
        add_action('wp_ajax_save_campos_accessibility_settings', array($this, 'save_settings'));
        
        // Agregar verificación de actualizaciones
        add_filter('pre_set_site_transient_update_plugins', array($this, 'check_for_updates'));
        add_filter('plugins_api', array($this, 'plugin_info'), 20, 3);
        add_action('admin_notices', array($this, 'show_update_notice'));
        
        // Agregar enlace de configuración en la lista de plugins
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), array($this, 'add_settings_link'));
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
        <?php
    }

    public function check_for_updates($transient) {
        if (empty($transient->checked)) {
            return $transient;
        }

        $response = wp_remote_get($this->update_url);
        if (is_wp_error($response)) {
            return $transient;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body);

        if (empty($data)) {
            return $transient;
        }

        $latest_version = ltrim($data->tag_name, 'v');
        if (version_compare($latest_version, $this->version, '>')) {
            $plugin_slug = plugin_basename(__FILE__);
            $transient->response[$plugin_slug] = (object) array(
                'slug' => dirname($plugin_slug),
                'new_version' => $latest_version,
                'url' => 'https://github.com/' . $this->github_repo,
                'package' => $data->zipball_url
            );
        }

        return $transient;
    }

    public function plugin_info($res, $action, $args) {
        if ($action !== 'plugin_information' || !isset($args->slug) || $args->slug !== dirname(plugin_basename(__FILE__))) {
            return $res;
        }

        $response = wp_remote_get($this->update_url);
        if (is_wp_error($response)) {
            return $res;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body);

        if (empty($data)) {
            return $res;
        }

        $res = new stdClass();
        $res->name = 'CamposAccessibility';
        $res->slug = dirname(plugin_basename(__FILE__));
        $res->version = ltrim($data->tag_name, 'v');
        $res->tested = '6.4';
        $res->requires = '5.0';
        $res->author = 'Juan David Valor Campos';
        $res->author_profile = 'https://davidcampos.com.co';
        $res->download_link = $data->zipball_url;
        $res->trunk = $data->zipball_url;
        $res->last_updated = $data->published_at;
        $res->sections = array(
            'description' => $data->body,
            'changelog' => $this->get_changelog()
        );

        return $res;
    }

    private function get_changelog() {
        $response = wp_remote_get('https://api.github.com/repos/' . $this->github_repo . '/commits');
        if (is_wp_error($response)) {
            return 'No se pudo obtener el registro de cambios.';
        }

        $commits = json_decode(wp_remote_retrieve_body($response));
        $changelog = '<h4>Últimos cambios:</h4><ul>';

        foreach (array_slice($commits, 0, 5) as $commit) {
            $changelog .= sprintf(
                '<li><strong>%s</strong>: %s</li>',
                substr($commit->sha, 0, 7),
                esc_html($commit->commit->message)
            );
        }

        $changelog .= '</ul>';
        return $changelog;
    }

    public function show_update_notice() {
        $transient = get_site_transient('update_plugins');
        $plugin_slug = plugin_basename(__FILE__);

        if (isset($transient->response[$plugin_slug])) {
            $update = $transient->response[$plugin_slug];
            $notice = sprintf(
                '<div class="notice notice-info is-dismissible"><p>' .
                'Hay una nueva versión de <strong>CamposAccessibility</strong> disponible (v%s). ' .
                '<a href="%s">Ver detalles</a> o <a href="%s">actualizar ahora</a>.' .
                '</p></div>',
                esc_html($update->new_version),
                self_admin_url('plugin-install.php?tab=plugin-information&plugin=' . $update->slug . '&section=changelog&TB_iframe=true&width=600&height=800'),
                wp_nonce_url(self_admin_url('update.php?action=upgrade-plugin&plugin=' . $plugin_slug), 'upgrade-plugin_' . $plugin_slug)
            );
            echo $notice;
        }
    }

    public function add_settings_link($links) {
        $settings_link = sprintf(
            '<a href="%s">%s</a>',
            admin_url('admin.php?page=campos-accessibility'),
            __('Configuración', 'campos-accessibility')
        );
        array_unshift($links, $settings_link);
        return $links;
    }
}

// Inicializar el plugin
function campos_accessibility_init() {
    new CamposAccessibility();
}
add_action('plugins_loaded', 'campos_accessibility_init');
