<?php
/*
Plugin Name: CamposAccessibility
Plugin URI: https://davidcampos.com.co
Description: Plugin de accesibilidad web que proporciona herramientas para diferentes tipos de discapacidades.
Version: 1.0.4
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
    private $version = '1.0.4';
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
        // Encolar jQuery primero
        wp_enqueue_script('jquery');
        
        // Encolar estilos
        wp_enqueue_style('dashicons');
        wp_enqueue_style('campos-accessibility', $this->plugin_url . 'dashicons.css', array(), $this->version);
        
        // Encolar nuestro script
        wp_enqueue_script('campos-accessibility', $this->plugin_url . 'campos-accessibility.js', array('jquery'), $this->version, true);

        // Obtener configuración
        $settings = get_option('campos_accessibility_settings', $this->get_default_settings());
        
        // Pasar configuración al script
        wp_localize_script('campos-accessibility', 'camposAccessibilitySettings', $settings);
        
        // Agregar script de inicialización
        wp_add_inline_script('campos-accessibility', '
            jQuery(document).ready(function($) {
                const accessibility = new CamposAccessibility(camposAccessibilitySettings);
                accessibility.init();
            });
        ');
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
            'buttonStyle' => 'icon-text', // Nuevas opciones: 'icon-only', 'icon-text', 'text-only'
            'buttonText' => 'Accesibilidad',
            'buttonIcon' => 'dashicons-universal-access',
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
        include($this->plugin_path . 'admin-template.php');
    }

    public function check_for_updates($transient) {
        try {
            if (empty($transient->checked)) {
                return $transient;
            }

            $response = wp_remote_get($this->update_url, array(
                'timeout' => 10,
                'headers' => array(
                    'Accept' => 'application/vnd.github.v3+json'
                )
            ));

            if (is_wp_error($response)) {
                error_log('CamposAccessibility: Error checking updates - ' . $response->get_error_message());
                return $transient;
            }

            $body = wp_remote_retrieve_body($response);
            if (empty($body)) {
                error_log('CamposAccessibility: Empty response from GitHub API');
                return $transient;
            }

            $data = json_decode($body);
            if (!is_object($data)) {
                error_log('CamposAccessibility: Invalid JSON response from GitHub API');
                return $transient;
            }

            // Verificar que tag_name existe y es una cadena
            if (!isset($data->tag_name) || !is_string($data->tag_name)) {
                error_log('CamposAccessibility: No valid tag_name in GitHub response');
                return $transient;
            }

            $latest_version = trim($data->tag_name, 'v');
            if (empty($latest_version)) {
                error_log('CamposAccessibility: Empty version number');
                return $transient;
            }

            if (version_compare($latest_version, $this->version, '>')) {
                $plugin_slug = plugin_basename(__FILE__);
                $transient->response[$plugin_slug] = (object) array(
                    'slug' => dirname($plugin_slug),
                    'new_version' => $latest_version,
                    'url' => 'https://github.com/' . $this->github_repo,
                    'package' => isset($data->zipball_url) ? $data->zipball_url : ''
                );
            }

            return $transient;
        } catch (Exception $e) {
            error_log('CamposAccessibility: Exception checking updates - ' . $e->getMessage());
            return $transient;
        }
    }

    public function plugin_info($res, $action, $args) {
        try {
            if ($action !== 'plugin_information' || !isset($args->slug) || $args->slug !== dirname(plugin_basename(__FILE__))) {
                return $res;
            }

            $response = wp_remote_get($this->update_url, array(
                'timeout' => 10,
                'headers' => array(
                    'Accept' => 'application/vnd.github.v3+json'
                )
            ));

            if (is_wp_error($response)) {
                error_log('CamposAccessibility: Error getting plugin info - ' . $response->get_error_message());
                return $res;
            }

            $body = wp_remote_retrieve_body($response);
            if (empty($body)) {
                error_log('CamposAccessibility: Empty response getting plugin info');
                return $res;
            }

            $data = json_decode($body);
            if (!is_object($data)) {
                error_log('CamposAccessibility: Invalid JSON response getting plugin info');
                return $res;
            }

            $res = new stdClass();
            $res->name = 'CamposAccessibility';
            $res->slug = dirname(plugin_basename(__FILE__));
            
            // Verificar y procesar la versión
            if (isset($data->tag_name) && is_string($data->tag_name)) {
                $res->version = trim($data->tag_name, 'v');
            } else {
                $res->version = $this->version;
            }
            
            $res->tested = '6.4';
            $res->requires = '5.0';
            $res->author = 'Juan David Valor Campos';
            $res->author_profile = 'https://davidcampos.com.co';
            $res->download_link = isset($data->zipball_url) ? $data->zipball_url : '';
            $res->trunk = isset($data->zipball_url) ? $data->zipball_url : '';
            $res->last_updated = isset($data->published_at) ? $data->published_at : current_time('mysql');
            $res->sections = array(
                'description' => isset($data->body) ? $data->body : 'Plugin de accesibilidad web',
                'changelog' => $this->get_changelog()
            );

            return $res;
        } catch (Exception $e) {
            error_log('CamposAccessibility: Exception getting plugin info - ' . $e->getMessage());
            return $res;
        }
    }

    private function get_changelog() {
        $response = wp_remote_get('https://api.github.com/repos/' . $this->github_repo . '/commits');
        if (is_wp_error($response)) {
            return 'No se pudo obtener el registro de cambios.';
        }

        $commits = json_decode(wp_remote_retrieve_body($response));
        if (!is_array($commits)) {
            return 'No hay cambios registrados.';
        }

        $changelog = '<h4>Últimos cambios:</h4><ul>';

        foreach (array_slice($commits, 0, 5) as $commit) {
            if (isset($commit->sha) && isset($commit->commit->message)) {
                $changelog .= sprintf(
                    '<li><strong>%s</strong>: %s</li>',
                    substr($commit->sha, 0, 7),
                    esc_html($commit->commit->message)
                );
            }
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
