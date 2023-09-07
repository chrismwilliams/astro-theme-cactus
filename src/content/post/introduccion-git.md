---
title: "Introducción a Git"
description: "Una herramienta esencial para el control de versiones en desarrollo de software"
publishDate: "14 Feb 2023"
tags: ["Git"]
---

<div align="center" >
	<img src="https://git-scm.com/images/logo@2x.png" alt="Git" style="padding: 12px; margin-button: 12px;"/>
</div>

## ¿Qué es Git?

<div style="text-align: justify">
	Git es un sistema de control de versiones distribuido, que permite a los
	desarrolladores de software llevar un registro de los cambios realizados en el
	código a lo largo del tiempo. Con Git, es posible revertir los cambios,
	comparar versiones anteriores del código y trabajar en equipo en proyectos de
	software de manera eficiente.
</div>

### ¿Por qué deberías usar Git?

<div style="text-align: justify">

- **_Control de versiones:_** Con Git, puedes rastrear los cambios que realizas en
  el código fuente y volver a versiones anteriores si es necesario. Esto es útil
  si introduces un error en el código o si deseas volver a una versión anterior
  que funcionaba bien.

- **_Colaboración:_** Git facilita la colaboración con otros desarrolladores en el mismo proyecto.
  Puedes trabajar en diferentes partes del código al mismo tiempo y fusionar los cambios cuando
  sea necesario.

- **_Flexibilidad:_** Git es compatible con diferentes tipos de proyectos, desde pequeños scripts
  hasta proyectos de gran escala. También es compatible con diferentes sistemas operativos y plataformas.

</div>

### Instalación y Configuración

1. Descarga Git desde su sitio web oficial: <a href="https://git-scm.com/downloads" target="_blank">Descarga GIT</a>
2. Ejecuta el instalador y sigue las instrucciones en pantalla para completar la instalación
3. Una vez instalado, abre la línea de comandos o terminal de tu sistema operativo.

```javascript
git config --global user.name "Tu Nombre"
git config --global user.email "tu_correo"
```

_Es importante que uses el mismo correo electrónico que usas para tus commits
en GitHub o en otro servidor Git, para que se te pueda atribuir correctamente la autoría de los cambios._

### Iniciar un proyecto con Git

Para iniciar un proyecto con git sólo tienes que seguir los pasos que se indican a continuación.

- **_Creación del repositorio:_** Para crear el proyecto localmente escribe git init

```javascript
cd /path/to/your/existing/code
git init <project directory>
```

### Flujo de trabajo:

Tu repositorio local esta compuesto por tres "árboles" administrados por git.

    - El primero es tu <u>Directorio de trabajo</u> que contiene los archivos
    - El segundo es el <u>Index</u> que actua como una zona intermedia
    - Y el último es el <u>HEAD</u> que apunta al último commit realizado.

<div align="center">
	<img src="https://rogerdudler.github.io/git-guide/img/trees.png" alt="Git" />
</div>

### add & commit

El comando "git add" se utiliza para agregar cambios al área de preparación (staging area) en Git.
Es decir, antes de confirmar los cambios definitivamente en Git,
debes agregarlos al área de preparación mediante el comando "git add".

Puedes registrar cambios (añadirlos al Index) usando

- Archivo en particular

```javascript
git add <filename>
```

- Todos los archivos

```javascript
git add .
```

Después de agregar los cambios con "git add", puedes confirmarlos definitivamente utilizando el comando "git commit".

Para hacer un commit en Git, debes especificar un mensaje que describa brevemente los cambios que has realizado. Por ejemplo, "git commit -m 'Agregado archivo.txt'".
Es importante que el mensaje sea descriptivo y explique claramente qué cambios has realizado en el repositorio.

```javascript
git commit -m "commit message"
```

### Envío de cambios

El comando "git push" se utiliza para enviar los cambios confirmados en tu repositorio local a un repositorio remoto en Git. Es decir, después de realizar los cambios y confirmarlos con el comando "git commit",
debes enviarlos al servidor remoto con "git push".

```javascript
git push <remote> <branch>
```

Para hacer un push en Git, debes especificar el nombre del repositorio remoto y la rama que deseas actualizar.
Por ejemplo, **"git push origin master"** para enviar los cambios confirmados en la rama "master" al repositorio remoto llamado "origin".

### git clone

El comando "git clone" se utiliza para crear una copia local de un repositorio remoto en Git. Es decir, en lugar de crear un nuevo repositorio local, puedes utilizar "git clone" para descargar una copia completa del repositorio remoto en tu ordenador.

```javascript
git clone <repo> <directory>
```

### .gitignore

El archivo ".gitignore" es utilizado en Git para indicarle qué archivos y/o carpetas no debe incluir en el control de versiones. Es decir, puedes especificar archivos o directorios que deseas ignorar y que no deben ser versionados ni aparecer en el historial de cambios.

Para crear un archivo ".gitignore", simplemente crea un archivo con ese nombre en la raíz de tu repositorio local y escribe en él las rutas de los archivos y carpetas que deseas ignorar. Por ejemplo, puedes ignorar todos los archivos de log que se generan en tu proyecto mediante una línea en el archivo ".gitignore" que contenga "\*.log".
