const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

router.get('/', inventarioController.obtenerInventario);
router.post('/', inventarioController.agregarProducto);
router.patch('/:id', inventarioController.actualizarProducto);
router.post('/inicializar', inventarioController.inicializarInventario);

module.exports = router; 