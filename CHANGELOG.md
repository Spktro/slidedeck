# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.1.0/). Versionado [SemVer](https://semver.org/lang/es/).

## [1.0.4] - 2026-09-08

### Cambiado
- El clic por mitades solo navega si cae en el fondo de la slide (la `section.slide`, el `.deck` o el `body`), nunca sobre contenido. Así el doble o triple clic para seleccionar una palabra o un párrafo tampoco cambia de slide. Antes el primer clic del doble clic navegaba.

## [1.0.3] - 2026-09-08

### Corregido
- Seleccionar texto con el mouse ya no cambia de slide. El clic por mitades se ignora si al soltar hay texto seleccionado o si el puntero se arrastró más de 5 px desde el `pointerdown`.

### Agregado
- `data-click-nav="off"` en `.deck` desactiva la navegación por clic en mitades. Teclado, hash y miniaturas siguen funcionando.

## [1.0.2] - 2026-05-30

### Agregado
- `data-repo` en `.deck`: muestra un ícono de GitHub junto a la marca.

## [1.0.1] - 2026-05-30

- Versión inicial publicada: `deck.css` + `deck.js`, tema claro/oscuro, selector de tamaño, navegador de miniaturas, botón de copiar, navegación por teclado/clic/hash y export a PDF.

[1.0.4]: https://github.com/Spktro/slidedeck/compare/1.0.3...1.0.4
[1.0.3]: https://github.com/Spktro/slidedeck/compare/1.0.2...1.0.3
[1.0.2]: https://github.com/Spktro/slidedeck/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/Spktro/slidedeck/releases/tag/1.0.1
