import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Divider,
  Alert,
  Grid,
  Tab,
  Tabs,
  IconButton,
  useTheme,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import axios from 'axios';
import { API_URL } from '../config';

const VistaCaja = () => {
  const [pedidos, setPedidos] = useState([]);
  const [historialPedidos, setHistorialPedidos] = useState([]);
  const [vistaActual, setVistaActual] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);
  const [ventasHoy, setVentasHoy] = useState(0);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('efectivo');
  const [darkMode, setDarkMode] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    ventasPorHora: [],
    metodosPago: [],
    productosMasVendidos: []
  });
  const componentRef = React.useRef();
  const [modalEditar, setModalEditar] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [ajuste, setAjuste] = useState(0);
  const [comentarioAjuste, setComentarioAjuste] = useState('');
  const [errorComentario, setErrorComentario] = useState(false);

  const obtenerPedidos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/pedidos`);
      // Filtrar pedidos pendientes (no pagados)
      setPedidos(response.data.filter(pedido => !pedido.pagado));
      // Guardar historial de pedidos pagados
      const pedidosPagados = response.data.filter(pedido => pedido.pagado);
      setHistorialPedidos(pedidosPagados);
      
      // Calcular total de ventas
      const total = pedidosPagados.reduce((sum, pedido) => sum + pedido.total, 0);
      setTotalVentas(total);
      
      // Calcular ventas de hoy
      const hoy = new Date().toLocaleDateString();
      const ventasDelDia = pedidosPagados
        .filter(pedido => new Date(pedido.timestamp).toLocaleDateString() === hoy)
        .reduce((sum, pedido) => sum + pedido.total, 0);
      setVentasHoy(ventasDelDia);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    }
  };

  const calcularEstadisticas = (pedidos) => {
    // Ventas por hora
    const ventasPorHora = Array(24).fill(0).map((_, hora) => ({
      hora: `${hora}:00`,
      ventas: 0
    }));

    // Métodos de pago
    const metodosPago = {};
    
    // Productos más vendidos
    const productosVendidos = {};

    pedidos.forEach(pedido => {
      if (pedido.pagado) {
        // Ventas por hora
        const hora = new Date(pedido.fechaPago).getHours();
        ventasPorHora[hora].ventas += pedido.total;

        // Métodos de pago
        const metodo = pedido.metodoPago || 'efectivo';
        metodosPago[metodo] = (metodosPago[metodo] || 0) + pedido.total;

        // Productos más vendidos
        pedido.items.forEach(item => {
          productosVendidos[item.nombre] = (productosVendidos[item.nombre] || 0) + item.cantidad;
        });
      }
    });

    setEstadisticas({
      ventasPorHora,
      metodosPago: Object.entries(metodosPago).map(([metodo, total]) => ({
        name: metodo.toUpperCase(),
        value: total
      })),
      productosMasVendidos: Object.entries(productosVendidos)
        .map(([nombre, cantidad]) => ({ nombre, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 5)
    });
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#FF6B00',
      },
    },
  });

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  useEffect(() => {
    obtenerPedidos();
    const intervalo = setInterval(obtenerPedidos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    calcularEstadisticas(historialPedidos);
  }, [historialPedidos]);

  const marcarComoPagado = async (pedidoId) => {
    try {
      console.log('Marcando pedido como pagado:', pedidoId);
      const response = await axios.patch(`${API_URL}/api/pedidos/${pedidoId}`, {
        pagado: true,
        metodoPago: metodoPagoSeleccionado,
        fechaPago: new Date().toISOString()
      });

      if (response.data) {
        console.log('Pedido marcado como pagado exitosamente:', response.data);
        obtenerPedidos();
        setMetodoPagoSeleccionado('efectivo'); // Resetear método de pago
      } else {
        console.error('Respuesta vacía al marcar como pagado');
        alert('Error: No se pudo marcar el pedido como pagado');
      }
    } catch (error) {
      console.error('Error al marcar pedido como pagado:', error);
      const mensaje = error.response?.data?.error || error.message || 'Error desconocido';
      alert(`Error al marcar el pedido como pagado: ${mensaje}`);
    }
  };

  const borrarHistorial = async () => {
    if (window.confirm('¿Estás seguro de que deseas borrar todo el historial de ventas? Esta acción no se puede deshacer.')) {
      try {
        await axios.delete(`${API_URL}/api/pedidos/historial`);
        alert('Historial de ventas borrado exitosamente');
        obtenerPedidos();
      } catch (error) {
        console.error('Error al borrar historial:', error);
        alert('Error al borrar el historial de ventas');
      }
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const abrirModalEditar = (pedido) => {
    setPedidoEditando(pedido);
    setAjuste(pedido.ajuste || 0);
    setComentarioAjuste(pedido.comentarioAjuste || '');
    setModalEditar(true);
    setErrorComentario(false);
  };

  const cerrarModalEditar = () => {
    setModalEditar(false);
    setPedidoEditando(null);
    setAjuste(0);
    setComentarioAjuste('');
    setErrorComentario(false);
  };

  const guardarAjuste = async () => {
    if (!comentarioAjuste.trim()) {
      setErrorComentario(true);
      return;
    }
    try {
      const nuevoTotal = (pedidoEditando.total - (pedidoEditando.ajuste || 0)) + Number(ajuste);
      await axios.patch(`${API_URL}/api/pedidos/${pedidoEditando._id}`, {
        ajuste: Number(ajuste),
        comentarioAjuste,
        total: nuevoTotal
      });
      cerrarModalEditar();
      obtenerPedidos();
    } catch (error) {
      alert('Error al guardar el ajuste');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        ref={componentRef}
        sx={{ 
          maxWidth: 1400, 
          margin: 'auto', 
          p: 3,
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>

        {/* Panel Superior - Resumen de Ventas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper 
                elevation={3}
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 107, 0, 0.1)'
                }}
              >
                <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                  Ventas de Hoy
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatearPrecio(ventasHoy)}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Paper 
                elevation={3}
                sx={{ 
                  p: 3, 
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 107, 0, 0.1)'
                }}
              >
                <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                  Total Ventas
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {formatearPrecio(totalVentas)}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Tabs para cambiar entre vistas */}
        <Tabs 
          value={vistaActual} 
          onChange={(e, newValue) => setVistaActual(newValue)}
          sx={{ 
            mb: 3,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              color: 'primary.main',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 'bold'
              }
            }
          }}
        >
          <Tab label="PEDIDOS PENDIENTES" />
          <Tab label="HISTORIAL DE VENTAS" />
          <Tab label="ESTADÍSTICAS" />
        </Tabs>

        {vistaActual === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Grid container spacing={3}>
              {/* Gráfico de Ventas por Hora */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Ventas por Hora</Typography>
                  <BarChart
                    width={500}
                    height={300}
                    data={estadisticas.ventasPorHora}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hora" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatearPrecio(value)} />
                    <Legend />
                    <Bar dataKey="ventas" fill="#FF6B00" />
                  </BarChart>
                </Paper>
              </Grid>

              {/* Gráfico de Métodos de Pago */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Métodos de Pago</Typography>
                  <PieChart width={500} height={300}>
                    <Pie
                      data={estadisticas.metodosPago}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={({ name, value }) => `${name}: ${formatearPrecio(value)}`}
                    >
                      {estadisticas.metodosPago.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#FF6B00', '#FF8534', '#FFA366', '#FFC299'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatearPrecio(value)} />
                  </PieChart>
                </Paper>
              </Grid>

              {/* Productos Más Vendidos */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Productos Más Vendidos</Typography>
                  <List>
                    {estadisticas.productosMasVendidos.map((producto, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={producto.nombre}
                          secondary={`Cantidad vendida: ${producto.cantidad}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {vistaActual === 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrint}
              sx={{ mr: 2 }}
            >
              Imprimir Reporte
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={borrarHistorial}
            >
              Borrar Historial
            </Button>
          </Box>
        )}

        {vistaActual === 0 ? (
          // Vista de Pedidos Pendientes
          <>
            {pedidos.length === 0 ? (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No hay pedidos pendientes de pago
                </Typography>
              </Paper>
            ) : (
              <List sx={{ width: '100%' }}>
                {pedidos.map((pedido) => (
                  <Paper
                    key={pedido._id}
                    elevation={3}
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 107, 0, 0.1)',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Box sx={{ p: 2, bgcolor: 'rgba(255, 107, 0, 0.05)' }}>
                      <Typography variant="h6" sx={{ color: '#FF6B00', fontWeight: 'bold', mb: 1 }}>
                        Mesa {pedido.mesa}
                      </Typography>
                      
                      {!pedido.preparado && (
                        <Alert 
                          severity="info" 
                          sx={{ mb: 2 }}
                        >
                          Nota: Este pedido aún está en preparación
                        </Alert>
                      )}

                      <List dense>
                        {pedido.items.map((item, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography sx={{ fontWeight: 'medium' }}>
                                    {item.nombre}
                                  </Typography>
                                  <Chip 
                                    label={`x${item.cantidad}`}
                                    size="small"
                                    sx={{ 
                                      ml: 1, 
                                      bgcolor: '#FF6B00',
                                      color: 'white',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                </Box>
                              }
                              secondary={formatearPrecio(item.subtotal)}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mt: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Total: {formatearPrecio(pedido.total)}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 1,
                            bgcolor: 'background.paper',
                            p: 1,
                            borderRadius: 1
                          }}>
                            {['efectivo', 'nequi', 'qr', 'datafono'].map((metodo) => (
                              <Chip
                                key={metodo}
                                label={metodo.toUpperCase()}
                                onClick={() => setMetodoPagoSeleccionado(metodo)}
                                color={metodoPagoSeleccionado === metodo ? 'primary' : 'default'}
                                sx={{
                                  bgcolor: metodoPagoSeleccionado === metodo ? '#FF6B00' : 'default',
                                  '&:hover': {
                                    bgcolor: metodoPagoSeleccionado === metodo ? '#FF8534' : 'default',
                                  }
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                        <Button
                          variant="contained"
                          onClick={() => marcarComoPagado(pedido._id)}
                          sx={{
                            bgcolor: '#FF6B00',
                            '&:hover': {
                              bgcolor: '#FF8534',
                            }
                          }}
                        >
                          Marcar como Pagado
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </List>
            )}
          </>
        ) : (
          // Vista de Historial
          <>
            {historialPedidos.length === 0 ? (
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 2
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No hay pedidos en el historial
                </Typography>
              </Paper>
            ) : (
              <List sx={{ width: '100%' }}>
                {historialPedidos
                  .sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago))
                  .map((pedido) => (
                  <Paper
                    key={pedido._id}
                    elevation={3}
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      borderRadius: 2,
                      border: '1px solid rgba(255, 107, 0, 0.1)',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Box sx={{ p: 2, bgcolor: 'rgba(255, 107, 0, 0.05)' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 2
                      }}>
                        <Typography variant="h6" sx={{ color: '#FF6B00', fontWeight: 'bold' }}>
                          Mesa {pedido.mesa}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip
                            label={pedido.metodoPago?.toUpperCase() || 'EFECTIVO'}
                            sx={{
                              bgcolor: '#FF6B00',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {formatearFecha(pedido.fechaPago)}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => abrirModalEditar(pedido)}
                            sx={{ ml: 1 }}
                          >
                            Editar
                          </Button>
                        </Box>
                      </Box>
                      {/* Mostrar ajuste y comentario si existen */}
                      {pedido.ajuste !== 0 && (
                        <Alert severity={pedido.ajuste > 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
                          Ajuste: {pedido.ajuste > 0 ? '+' : ''}{formatearPrecio(pedido.ajuste)}<br/>
                          <b>Motivo:</b> {pedido.comentarioAjuste}
                        </Alert>
                      )}
                      <List dense>
                        {pedido.items.map((item, index) => (
                          <ListItem
                            key={index}
                            sx={{
                              bgcolor: 'background.paper',
                              borderRadius: 1,
                              mb: 1
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Typography sx={{ fontWeight: 'medium' }}>
                                    {item.nombre}
                                  </Typography>
                                  <Chip 
                                    label={`x${item.cantidad}`}
                                    size="small"
                                    sx={{ 
                                      ml: 1, 
                                      bgcolor: '#FF6B00',
                                      color: 'white',
                                      fontWeight: 'bold'
                                    }}
                                  />
                                </Box>
                              }
                              secondary={formatearPrecio(item.subtotal)}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Divider sx={{ my: 2 }} />

                      <Typography 
                        variant="h6" 
                        align="right"
                        sx={{ 
                          fontWeight: 'bold',
                          color: '#FF6B00'
                        }}
                      >
                        Total: {formatearPrecio(pedido.total)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </List>
            )}
          </>
        )}
      </Box>
      <Dialog open={modalEditar} onClose={cerrarModalEditar}>
        <DialogTitle>Editar Pedido (Ajuste)</DialogTitle>
        <DialogContent>
          <TextField
            label="Ajuste (puede ser positivo o negativo)"
            type="number"
            fullWidth
            value={ajuste}
            onChange={e => setAjuste(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Motivo del ajuste"
            fullWidth
            required
            value={comentarioAjuste}
            onChange={e => setComentarioAjuste(e.target.value)}
            error={errorComentario}
            helperText={errorComentario ? 'El motivo es obligatorio' : ''}
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModalEditar}>Cancelar</Button>
          <Button onClick={guardarAjuste} variant="contained" color="primary">Guardar</Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default VistaCaja; 