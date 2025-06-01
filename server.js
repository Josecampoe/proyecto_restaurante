const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos de React
app.use(express.static(path.join(__dirname, 'client/build')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bizantino', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB exitosamente');
}).catch((error) => {
  console.error('Error conectando a MongoDB:', error);
});

// Esquema de Pedido
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

const Pedido = mongoose.model('Pedido', pedidoSchema);

// Modelo de Inventario para platos
const inventarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  cantidad: { type: Number, default: 0 },
  minimo: { type: Number, default: 0 }
});
const Inventario = mongoose.model('Inventario', inventarioSchema);

// Rutas API
app.post('/api/pedidos', async (req, res) => {
  try {
    const nuevoPedido = new Pedido(req.body);
    // Descontar inventario por cada item
    for (const item of nuevoPedido.items) {
      await Inventario.findOneAndUpdate(
        { nombre: item.nombre },
        { $inc: { cantidad: -item.cantidad } },
        { new: true }
      );
    }
    await nuevoPedido.save();
    io.emit('nuevoPedido', nuevoPedido);
    res.status(201).json(nuevoPedido);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pedido y descontar inventario' });
  }
});

app.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ timestamp: -1 });
    res.json(pedidos);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.patch('/api/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = req.body;
    
    console.log('ID del pedido a actualizar:', id);
    console.log('Datos de actualización:', actualizacion);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('ID de pedido inválido:', id);
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    // Permitir actualizar ajuste y comentarioAjuste
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
      console.log('Pedido no encontrado');
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Notificar actualización
    io.emit('actualizacionPedido', pedidoActualizado);
    
    console.log('Pedido actualizado:', pedidoActualizado);
    res.json(pedidoActualizado);
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    res.status(500).json({ error: 'Error al actualizar pedido', details: error.message });
  }
});

app.patch('/api/pedidos/:id/editar', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = req.body;
    
    console.log('Editando pedido completo:', id);
    console.log('Nuevos datos:', actualizacion);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('ID de pedido inválido:', id);
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    // Verificar que el pedido no esté preparado
    const pedidoExistente = await Pedido.findById(id);
    if (!pedidoExistente) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedidoExistente.preparado) {
      return res.status(400).json({ 
        error: 'No se puede editar un pedido que ya está preparado' 
      });
    }

    // Actualizar el pedido completo
    const pedidoActualizado = await Pedido.findByIdAndUpdate(
      id,
      { 
        $set: {
          items: actualizacion.items,
          total: actualizacion.total,
          // Mantener el estado de pago y preparación
          pagado: pedidoExistente.pagado,
          preparado: pedidoExistente.preparado
        }
      },
      { new: true }
    );

    // Notificar la actualización
    io.emit('pedidoEditado', pedidoActualizado);
    
    res.json(pedidoActualizado);
  } catch (error) {
    console.error('Error al editar pedido:', error);
    res.status(500).json({ error: 'Error al editar pedido', details: error.message });
  }
});

// Agregar ruta para borrar historial de ventas
app.delete('/api/pedidos/historial', async (req, res) => {
  try {
    // Solo borra los pedidos que están pagados
    const resultado = await Pedido.deleteMany({ pagado: true });
    console.log('Historial de ventas borrado:', resultado);
    res.json({ mensaje: 'Historial de ventas borrado exitosamente' });
  } catch (error) {
    console.error('Error al borrar historial:', error);
    res.status(500).json({ error: 'Error al borrar historial de ventas' });
  }
});

// Rutas de Inventario
app.get('/api/inventario', async (req, res) => {
  try {
    const inventario = await Inventario.find().sort({ nombre: 1 });
    res.json(inventario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

app.post('/api/inventario', async (req, res) => {
  try {
    const { nombre, cantidad, minimo } = req.body;
    const nuevo = new Inventario({ nombre, cantidad, minimo });
    await nuevo.save();
    res.status(201).json(nuevo);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto al inventario' });
  }
});

app.patch('/api/inventario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const actualizacion = req.body;
    const actualizado = await Inventario.findByIdAndUpdate(id, { $set: actualizacion }, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar inventario' });
  }
});

// Endpoint para inicializar inventario con todos los platos del menú
app.post('/api/inventario/inicializar', async (req, res) => {
  try {
    // Platos del menú (puedes actualizar esta lista según tu menú real)
    const platos = [
      'Desayuno Continental', 'Desayuno Omelet', 'Huevos al gusto', 'Desayuno calentado de lenteja', 'Desayuno calentado de frijol', 'Otro desayuno (huevos al gusto, queso, pan, fruta/yogurth, jugo, bebida caliente)',
      'Carne llanera', 'Bistec a caballo', 'Bandeja paisa', 'Chuleta de pollo', 'Chuleta de cerdo', 'Filete de pollo', 'Mixta', 'Lomo de cerdo', 'Lomo de res', 'Parrillada en salsa de champiñones', 'Parrillada hawaiana', 'Parrillada gratinada',
      'Churrasco 250g', 'Churrasco 400g', 'Punta de anca 250g', 'Punta de anca 400g', 'Bife de chorizo', 'Alitas BBQ (8 piezas)', 'Picada Personal', 'Picada Para dos', 'Picada Familiar', 'Pincho de res', 'Pincho de cerdo', 'Pincho de pollo', 'Pincho mixto', 'Costillas BBQ', 'Costillas al limón', 'Salchipapa', 'Salchipapa gratinada',
      'Almuerzo con filete de pescado apanado', 'Almuerzo con tilapia roja (500g)', 'Almuerzo con trucha (350g)', 'Almuerzo con trucha (250g)', 'Almuerzo con sierra frita (250g)', 'Camarones apanados', 'Camarones encocados', 'Ceviche de camarones grande', 'Cazuela de camarones', 'Langostinos apanados', 'Langostinos encocados', 'Langostinos a la parrilla', 'Camarones a la parrilla', 'Arroz con camarón', 'Pargo frito', 'Pargo encocado', 'Trucha en salsa de camarón', 'Pargo en salsa de camarón', 'Pescado pelada frita', 'Pescado pelada encocada', 'Trucha en salsa de champiñón', 'Cazuela de mariscos', 'Sierra encocada', 'Arroz marinero', 'Porción pescado (400g de sierra)', 'Salmón (300g)',
      'Almuerzo con carnes a la parrilla', 'Sancocho trifásico', 'Sancocho de pescado', 'Sancocho de espinazo (400g)', 'Ajiaco (250g de pechuga)',
      'Almuerzo ejecutivo (130g carne a la parrilla)', 'Almuerzo con chuleta de cerdo (140g)', 'Almuerzo con chuleta de pollo (140g)', 'Almuerzo con costilla ahumada (200g)', 'Almuerzo con pollo ahumado (1/4)',
      'Cazuela de frijoles completa',
      'Frijol pequeño', 'Frijol grande', 'Arroz', 'Patacones', 'Sopa', 'Consomé', 'Fruta', 'Huevo adicional',
      'Limonada', 'Limonada jarra', 'Jugo en agua', 'Jugo en leche', 'Jarra de jugo natural', 'Cerezada', 'Coca Cola', 'Gaseosa', 'Agua'
    ];
    const existentes = await Inventario.find({ nombre: { $in: platos } });
    const existentesNombres = existentes.map(p => p.nombre);
    const nuevos = platos.filter(nombre => !existentesNombres.includes(nombre)).map(nombre => ({ nombre, cantidad: 0, minimo: 0 }));
    if (nuevos.length > 0) {
      await Inventario.insertMany(nuevos);
    }
    res.json({ mensaje: 'Inventario inicializado', agregados: nuevos.length });
  } catch (error) {
    res.status(500).json({ error: 'Error al inicializar inventario' });
  }
});

// Conexiones Socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado');
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Ruta catch-all para servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 