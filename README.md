# Sistema de Gestión de Pedidos para Restaurante

Este sistema permite gestionar pedidos en un restaurante, facilitando la comunicación entre meseros, cocina y caja.

## Características

- Toma de pedidos por mesa
- Vista de cocina con pedidos pendientes
- Vista de caja con estado de pagos
- Actualización en tiempo real usando WebSockets
- Interfaz moderna y fácil de usar

## Requisitos Previos

- Node.js (versión 14 o superior)
- npm (viene con Node.js)

## Instalación

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd [NOMBRE_DEL_DIRECTORIO]
```

2. Instala las dependencias del servidor:
```bash
npm install
```

3. Instala las dependencias del cliente:
```bash
cd client
npm install
```

## Ejecución

1. Inicia el servidor (desde la raíz del proyecto):
```bash
npm run dev
```

2. En otra terminal, inicia el cliente:
```bash
cd client
npm start
```

3. Abre tu navegador y visita:
- http://localhost:3000

## Uso

### Vista de Mesero
- Selecciona el número de mesa
- Agrega items del menú y sus cantidades
- Envía el pedido a cocina y caja

### Vista de Cocina
- Visualiza los pedidos pendientes
- Marca los pedidos como completados cuando estén listos

### Vista de Caja
- Visualiza todos los pedidos y sus estados
- Marca los pedidos como pagados
- Ve el historial de pedidos

## Tecnologías Utilizadas

- Frontend: React, Material-UI
- Backend: Node.js, Express
- Comunicación en tiempo real: Socket.io 