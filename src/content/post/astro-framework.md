---
title: "¿Por qué elegí Astro para mi sitio web?"
description: "Explorando las razones por las que Astro se ha convertido en mi framework favorito para crear sitios web estáticos"
lang: es
publishDate: "02 December 2024"
tags: ["astro", "desarrollo-web", "frontend"]
---

## El descubrimiento de Astro

Después de probar varios frameworks y generadores de sitios estáticos, finalmente encontré Astro y cambió completamente mi perspectiva sobre cómo construir sitios web.

### Las ventajas que me conquistaron

#### 1. Cero JavaScript por defecto

Astro envía **cero JavaScript al cliente** por defecto. Solo se incluye el JavaScript que realmente necesitas, lo que resulta en sitios increíblemente rápidos.

#### 2. Islas de componentes

El concepto de "Component Islands" permite tener componentes interactivos solo donde los necesitas:

```astro
---
import Contador from '../components/Contador.jsx';
---

<h1>Mi página estática</h1>
<p>Este contenido es completamente estático</p>

<!-- Solo este componente será interactivo -->
<Contador client:visible />
```

#### 3. Usa cualquier framework

¿Te gusta React? ¿Prefieres Vue? ¿O tal vez Svelte? Con Astro puedes usar **cualquiera de ellos**, o incluso combinarlos en el mismo proyecto.

### El resultado

Mi sitio ahora carga en menos de un segundo y tiene una puntuación perfecta en Lighthouse. ¡No podría estar más contento con la elección!
