const Pedido = require('../models/Pedido');
const Inventario = require('../models/Inventario');

exports.crearPedido = async (req, res) => {
  try {
    const nuevoPedido = new Pedido(req.body);
    for (const item of nuevoPedido.items) {
      await Inventario.findOneAndUpdate(
        { nombre: item.nombre },
        { $inc: { cantidad: -item.cantidad } },
        { new: true }
      );
    }
    await nuevoPedido.save();
    req.io.emit('nuevoPedido', nuevoPedido);
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pedido y descontar inventario' });
  }
};

exports.obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ timestamp: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

exports.actualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    const camposActualizables = { ...actualizacion };
    if (typeof actualizacion.ajuste !== 'undefined') {
      camposActualizables.ajuste = actualizacion.ajuste;
    }
    if (typeof actualizacion.comentarioAjuste !== 'undefined') {
      camposActualizables.comentarioAjuste = actualizacion.comentarioAjuste;
    }
    if (typeof actualizacion.total !== 'undefined') {
      camposActualizables.total = actualizacion.total;
    }

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      id,
      { $set: camposActualizables },
      { new: true }
    );

    if (!pedidoActualizado) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    req.io.emit('actualizacionPedido', pedidoActualizado);
    res.json(pedidoActualizado);
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error al actualizar pedido', details: error.message });
  }
};

exports.editarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    const pedidoExistente = await Pedido.findById(id);
    if (!pedidoExistente) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedidoExistente.preparado) {
      return res.status(400).json({ 
        error: 'No se puede editar un pedido que ya está preparado' 
      });
    }

    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      id,
      { 
        $set: {
          items: actualizacion.items,
          total: actualizacion.total,
          pagado: pedidoExistente.pagado,
          preparado: pedidoExistente.preparado
        }
      },
      { new: true }
    );

    req.io.emit('pedidoEditado', pedidoActualizado);
    res.json(pedidoActualizado);
  } catch (error) {
    console.error('Error al editar pedido:', error);
    res.status(500).json({ error: 'Error al editar pedido', details: error.message });
  }
};

exports.borrarHistorial = async (req, res) => {
  try {
    const resultado = await Pedido.deleteMany({ pagado: true });
    res.json({ mensaje: 'Historial de ventas borrado exitosamente' });
  } catch (error) {
    console.error('Error al borrar historial:', error);
    res.status(500).json({ error: 'Error al borrar historial de ventas' });
  }
}; 