const mongoose = require('mongoose');

const inventarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  cantidad: { type: Number, default: 0 },
  minimo: { type: Number, default: 0 }
});

module.exports = mongoose.model('Inventario', inventarioSchema); 