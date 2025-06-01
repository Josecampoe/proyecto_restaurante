const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.post('/', pedidoController.crearPedido);
router.get('/', pedidoController.obtenerPedidos);
router.patch('/:id', pedidoController.actualizarPedido);
router.patch('/:id/editar', pedidoController.editarPedido);
router.delete('/historial', pedidoController.borrarHistorial);

module.exports = router; 