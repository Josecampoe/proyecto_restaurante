const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  mesa: Number,
  items: [{
    id: String,
    nombre: String,
    cantidad: Number,
    precio: Number,
    subtotal: Number,
    comentario: { type: String, default: '' }
  }],
  total: Number,
  preparado: { type: Boolean, default: false },
  pagado: { type: Boolean, default: false },
  metodoPago: { type: String, enum: ['efectivo', 'nequi', 'qr', 'datafono'], default: 'efectivo' },
  timestamp: { type: Date, default: Date.now },
  fechaPreparacion: Date,
  fechaPago: Date,
  ajuste: { type: Number, default: 0 },
  comentarioAjuste: { type: String, default: '' }
});

module.exports = mongoose.model('Pedido', pedidoSchema); 