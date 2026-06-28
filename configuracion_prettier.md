# Configuración de Prettier

Este documento describe la especificación del formateador de código **Prettier** para garantizar la uniformidad estilística entre el backend (`server/`) y frontend (`client/`).

---

## 1. Configuración Unificada (`.prettierrc`)

Se utiliza la misma configuración en ambos proyectos (`server/.prettierrc` y `client/.prettierrc`) con el siguiente contenido JSON:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "endOfLine": "auto"
}
```

---

## 2. Justificación Técnica de las Reglas Seleccionadas

* **`semi: true`**:
  * *Razón*: Asegura el uso de punto y coma al final de cada declaración. Evita comportamientos inesperados producidos por el mecanismo ASI (Automatic Semicolon Insertion) de JavaScript, reduciendo bugs lógicos difíciles de depurar en producción.
* **`singleQuote: true`**:
  * *Razón*: Enforcea el uso de comillas simples (`'`) en lugar de comillas dobles (`"`). Mejora la consistencia visual y la legibilidad del código JavaScript/React. Facilita además escribir cadenas HTML o JSX internas sin escapar comillas dobles.
* **`tabWidth: 2`**:
  * *Razón*: Usa 2 espacios para indentación. Es el estándar de facto en el ecosistema Node.js y React, ofreciendo el equilibrio ideal entre legibilidad y ahorro de espacio horizontal (especialmente útil en estructuras anidadas de React).
* **`trailingComma: "es5"`**:
  * *Razón*: Añade comas finales donde sea válido bajo la especificación ES5 (arreglos, objetos, parámetros de funciones). Reduce la cantidad de cambios en el control de versiones (diffs) al agregar nuevos elementos al final, ya que no se modifica la línea anterior.
* **`printWidth: 80`**:
  * *Razón*: Define el límite de longitud de línea en 80 caracteres. Esto previene el scroll horizontal, facilitando el desarrollo colaborativo con pantallas divididas y mejorando sustancialmente la revisión de código en GitHub.
* **`endOfLine: "auto"`**:
  * *Razón*: Maneja el fin de línea de manera flexible para evitar conflictos de sistema operativo (LF en Unix/macOS y CRLF en Windows). Esto evita advertencias del linter y ruidos en git al clonar el repositorio en entornos Windows, lo cual es muy común en equipos híbridos.
