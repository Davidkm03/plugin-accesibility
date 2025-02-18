# CamposAccessibility

Plugin de accesibilidad web que proporciona herramientas para diferentes tipos de discapacidades.

## Características

### Discapacidad Motora
- Navegación por teclado
- Asistente de click
- Atajos de teclado personalizables

### Ceguera
- Integración con lectores de pantalla
- Textos alternativos automáticos
- Descripción de imágenes

### Daltonismo
- Modo Protanopia
- Modo Deuteranopia
- Modo Tritanopia
- Ajustes de contraste personalizados

### Dislexia
- Fuente optimizada para dislexia
- Guía de lectura
- Espaciado de texto ajustable

### Visión Baja
- Control de tamaño de texto
- Alto contraste
- Lupa digital
- Resaltado de elementos importantes

### Cognitivo y Aprendizaje
- Vista simplificada
- Máscara de lectura
- Eliminación de distracciones

### Convulsiones y Epilepsia
- Bloqueo de animaciones
- Reducción de movimiento
- Filtros de parpadeo

### TDAH
- Modo enfoque
- Retroalimentación de audio
- Guías visuales

## Instalación

1. Descarga el plugin
2. Sube el plugin a tu sitio WordPress
3. Activa el plugin desde el panel de administración
4. Configura las opciones desde el menú "Accesibilidad"

## Configuración

### Panel de Administración
- Posición del botón (superior/inferior, izquierda/derecha)
- Colores personalizados
- Tamaño del botón
- Radio del borde
- Mostrar/ocultar etiquetas
- Activar/desactivar animaciones
- Activar/desactivar características específicas

### Personalización Visual
- Color primario y secundario
- Tamaño y estilo del botón
- Animaciones y transiciones
- Iconos y etiquetas

## Uso

El plugin agrega un botón flotante en tu sitio web que, al hacer clic, muestra un menú con todas las herramientas de accesibilidad disponibles. Los usuarios pueden:

1. Activar/desactivar características según sus necesidades
2. Personalizar la configuración de cada herramienta
3. Guardar sus preferencias para futuras visitas

## Desarrollo

### Estructura de Archivos
- `campos-accessibility.php` - Archivo principal del plugin
- `campos-accessibility.js` - Funcionalidad frontend
- `admin.js` - Scripts del panel de administración
- `admin.css` - Estilos del panel de administración
- `dashicons.css` - Iconos y estilos del widget

### Tecnologías Utilizadas
- PHP 7.4+
- WordPress 5.0+
- JavaScript (ES6)
- CSS3
- WordPress Dashicons
- WordPress Color Picker API

### Hooks y Filtros
El plugin proporciona varios hooks y filtros para extender su funcionalidad:

```php
// Modificar configuración por defecto
add_filter('campos_accessibility_default_settings', function($settings) {
    $settings['position'] = 'top-right';
    return $settings;
});

// Agregar nuevas características
add_filter('campos_accessibility_features', function($features) {
    $features['custom_feature'] = array(
        'name' => 'Mi Característica',
        'icon' => 'dashicons-admin-generic',
        'description' => 'Descripción de la característica'
    );
    return $features;
});
```

## Contribución

1. Fork el repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un Pull Request

## Licencia

Este plugin está licenciado bajo GPL v2 o posterior.

## Autor

Juan David Valor Campos  
[davidcampos.com.co](https://davidcampos.com.co)

## Soporte

Para soporte técnico o reporte de bugs, por favor crea un issue en el repositorio o contacta al autor.
