# AGENTS.md

# PLPrint ERP

Este repositorio corresponde al sistema PLPrint ERP.

Antes de responder o modificar código, el agente debe leer este documento.

---

# Objetivo

El objetivo del agente es modificar únicamente el código necesario.

Debe evitar leer archivos innecesarios y reutilizar la arquitectura existente.

Nunca debe reconstruir funcionalidades que ya existen.

---

# Stack

Frontend

- React
- TypeScript
- Vite
- TailwindCSS

Backend

- Node.js
- Express
- TypeScript
- Prisma ORM

Base de datos

- MySQL

---

# Organización del proyecto

plprint-api/

Backend

plprint-web/

Frontend

---

# Backend

La arquitectura es estrictamente:

Routes

↓

Controllers

↓

Services

↓

Prisma

↓

MySQL

Reglas:

- Routes únicamente registran endpoints.
- Controllers reciben request y response.
- Services contienen TODA la lógica del negocio.
- Prisma únicamente accede a la base de datos.

Nunca mover lógica de negocio a Controllers.

---

# Frontend

La arquitectura es:

Pages

↓

Components

↓

API

↓

Backend

Reglas:

Las páginas contienen la lógica principal.

Los componentes son reutilizables.

Las llamadas HTTP únicamente viven dentro de /api.

Nunca hacer fetch directamente dentro de componentes.

---

# Convenciones

Antes de crear un archivo nuevo:

1. Buscar si ya existe uno similar.

Antes de crear un componente:

Buscar dentro de:

components/

pages/*/components/

Antes de crear un hook:

Buscar dentro de hooks/

Antes de crear un servicio:

Buscar dentro de services/

Nunca duplicar funcionalidades.

---

# Cuando se modifica una funcionalidad

El agente debe identificar primero:

1. Ruta

2. Controller

3. Service

4. Modelo Prisma

5. API del frontend

6. Página React

7. Componentes relacionados

No debe modificar archivos fuera de esta cadena salvo que sea estrictamente necesario.

---

# Cambios pequeños

Si un cambio afecta únicamente un componente React:

NO leer todo el backend.

Si afecta un endpoint:

NO leer el frontend completo.

Leer únicamente los archivos relacionados.

---

# Rendimiento

Evitar abrir archivos grandes.

Buscar primero por nombre.

Buscar referencias.

Leer únicamente el contexto necesario.

---

# Diseño

Mantener el mismo estilo visual existente.

No cambiar colores.

No cambiar tipografía.

No cambiar componentes UI salvo que sea solicitado.

---

# Código

Preferir modificar código existente.

Antes de escribir una función nueva:

Buscar una existente.

Antes de crear un componente:

Buscar reutilización.

---

# Errores

Cuando exista un error:

1. Identificar la causa.

2. Explicar por qué ocurre.

3. Proponer la solución más pequeña posible.

Evitar refactorizaciones masivas.

---

# Refactor

No realizar refactorizaciones completas a menos que el usuario las solicite.

Cambiar únicamente lo necesario.

---

# Respuesta esperada

Antes de modificar código, explicar:

- qué archivos serán modificados
- por qué esos archivos
- qué impacto tendrá el cambio

Después realizar la implementación.

---

# Regla principal

La prioridad es:

1. Reutilizar.

2. Mantener consistencia.

3. Modificar lo mínimo posible.

4. Evitar leer archivos innecesarios.