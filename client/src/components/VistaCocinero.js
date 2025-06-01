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
  Tabs,
  Tab,
  Container,
  IconButton,
  TextField
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import KitchenIcon from '@mui/icons-material/Kitchen';
import HistoryIcon from '@mui/icons-material/History';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import axios from 'axios';
import { API_URL } from '../config';

const VistaCocinero = () => {
  const [pedidos, setPedidos] = useState([]);
  const [historialPedidos, setHistorialPedidos] = useState([]);
  const [vistaActual, setVistaActual] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [inventario, setInventario] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', cantidad: 0, minimo: 0 });
  const [editandoId, setEditandoId] = useState(null);
  const [editandoProducto, setEditandoProducto] = useState({ nombre: '', cantidad: 0, minimo: 0 });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#FF6B00',
      },
    },
  });

  const obtenerPedidos = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/pedidos`);
      // Filtrar pedidos pendientes y preparados
      setPedidos(response.data.filter(pedido => !pedido.preparado));
      setHistorialPedidos(response.data.filter(pedido => pedido.preparado));
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
    }
  };

  useEffect(() => {
    obtenerPedidos();
    const intervalo = setInterval(obtenerPedidos, 5000);
    return () => clearInterval(intervalo);
  }, []);

  const marcarComoPreparado = async (pedidoId) => {
    try {
      console.log('Marcando pedido como preparado:', pedidoId);
      const response = await axios.patch(`${API_URL}/api/pedidos/${pedidoId}`, {
        preparado: true,
        fechaPreparacion: new Date().toISOString()
      });

      if (response.data) {
        console.log('Pedido marcado como preparado exitosamente');
        obtenerPedidos();
      } else {
        alert('Error: No se pudo marcar el pedido como preparado');
      }
    } catch (error) {
      console.error('Error al marcar pedido como preparado:', error);
      alert('Error al marcar el pedido como preparado. Por favor intenta nuevamente.');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Función para editar pedido
  const editarPedido = (pedido) => {
    // Emitir evento para cambiar a la vista de tomar pedido
    window.dispatchEvent(new CustomEvent('editarPedido', { 
      detail: { pedido } 
    }));
  };

  // Obtener inventario
  const obtenerInventario = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/inventario`);
      setInventario(res.data);
    } catch (error) {
      // ...manejo de error...
    }
  };

  useEffect(() => {
    obtenerInventario();
  }, []);

  // Agregar producto
  const agregarProducto = async () => {
    if (!nuevoProducto.nombre.trim()) return;
    try {
      await axios.post(`${API_URL}/api/inventario`, nuevoProducto);
      setNuevoProducto({ nombre: '', cantidad: 0, minimo: 0 });
      obtenerInventario();
    } catch (error) {}
  };

  // Editar producto
  const guardarEdicion = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/inventario/${id}`, editandoProducto);
      setEditandoId(null);
      setEditandoProducto({ nombre: '', cantidad: 0, minimo: 0 });
      obtenerInventario();
    } catch (error) {}
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          py: 4
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          <Paper 
            elevation={3}
            sx={{
              p: 3,
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: '1px solid rgba(255, 107, 0, 0.2)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mb: 4,
              gap: 2
            }}>
              <RestaurantIcon sx={{ color: 'primary.main', fontSize: 40 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  color: 'primary.main',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                Cocina
              </Typography>
            </Box>

            <Tabs 
              value={vistaActual} 
              onChange={(e, newValue) => setVistaActual(newValue)}
              sx={{ 
                mb: 4,
                '& .MuiTab-root': {
                  color: 'rgba(255, 107, 0, 0.7)',
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 'medium'
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                  height: 3,
                  borderRadius: '3px'
                }
              }}
            >
              <Tab 
                icon={<KitchenIcon />} 
                iconPosition="start" 
                label="Pedidos en Preparación" 
              />
              <Tab 
                icon={<HistoryIcon />} 
                iconPosition="start" 
                label="Historial de Preparados" 
              />
            </Tabs>

            {vistaActual === 0 ? (
              <>
                {pedidos.length === 0 ? (
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: 4,
                      border: '2px dashed rgba(255, 107, 0, 0.3)',
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 107, 0, 0.05)'
                    }}
                  >
                    <KitchenIcon sx={{ fontSize: 60, color: 'rgba(255, 107, 0, 0.3)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      No hay pedidos pendientes de preparación
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ width: '100%' }}>
                    {pedidos.map((pedido) => (
                      <Paper
                        key={pedido._id}
                        elevation={3}
                        sx={{
                          mb: 3,
                          overflow: 'hidden',
                          borderRadius: 3,
                          border: '1px solid rgba(255, 107, 0, 0.2)',
                          bgcolor: 'rgba(255, 255, 255, 0.03)',
                          transition: 'transform 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Box sx={{ p: 3, bgcolor: 'rgba(255, 107, 0, 0.05)' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 2 
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <RestaurantIcon sx={{ color: 'primary.main' }} />
                              <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                Mesa {pedido.mesa}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              {!pedido.preparado && (
                                <Button
                                  variant="outlined"
                                  onClick={() => editarPedido(pedido)}
                                  startIcon={<EditIcon />}
                                  sx={{
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '&:hover': {
                                      borderColor: 'primary.light',
                                      bgcolor: 'rgba(255, 107, 0, 0.1)',
                                    }
                                  }}
                                >
                                  Editar
                                </Button>
                              )}
                              {pedido.pagado && (
                                <Chip
                                  icon={<CheckCircleIcon />}
                                  label="PAGADO"
                                  color="success"
                                  variant="filled"
                                  sx={{ fontWeight: 'bold' }}
                                />
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon sx={{ color: 'text.secondary' }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  Ingresó: {formatearFecha(pedido.timestamp)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>

                          <List sx={{ 
                            bgcolor: 'rgba(0, 0, 0, 0.2)',
                            borderRadius: 2,
                            p: 2,
                            mb: 2
                          }}>
                            {pedido.items.map((item, index) => (
                              <ListItem
                                key={index}
                                sx={{
                                  flexDirection: 'column',
                                  alignItems: 'stretch',
                                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                                  borderRadius: 2,
                                  mb: 1,
                                  p: 2,
                                  '&:last-child': {
                                    mb: 0
                                  }
                                }}
                              >
                                <ListItemText
                                  primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Typography sx={{ 
                                        fontWeight: 'medium',
                                        color: 'primary.main'
                                      }}>
                                        {item.nombre}
                                      </Typography>
                                      <Chip 
                                        label={`x${item.cantidad}`}
                                        size="small"
                                        sx={{ 
                                          ml: 1, 
                                          bgcolor: 'primary.main',
                                          color: 'white',
                                          fontWeight: 'bold'
                                        }}
                                      />
                                    </Box>
                                  }
                                />
                                {item.comentario && (
                                  <Box sx={{
                                    mt: 1,
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255, 107, 0, 0.1)',
                                    border: '1px solid rgba(255, 107, 0, 0.2)'
                                  }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: 'primary.main',
                                        fontStyle: 'italic',
                                        fontWeight: 'medium'
                                      }}
                                    >
                                      ⚠️ {item.comentario}
                                    </Typography>
                                  </Box>
                                )}
                              </ListItem>
                            ))}
                          </List>

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              onClick={() => marcarComoPreparado(pedido._id)}
                              startIcon={<CheckCircleIcon />}
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                px: 3,
                                py: 1.5,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontSize: '1rem',
                                fontWeight: 'medium',
                                '&:hover': {
                                  bgcolor: 'primary.light',
                                },
                                transition: 'all 0.2s ease-in-out',
                                '&:active': {
                                  transform: 'scale(0.98)'
                                }
                              }}
                            >
                              Marcar como Preparado
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                )}
              </>
            ) : (
              // Vista de Historial con el mismo estilo mejorado
              <>
                {historialPedidos.length === 0 ? (
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: 4,
                      border: '2px dashed rgba(255, 107, 0, 0.3)',
                      borderRadius: 2,
                      bgcolor: 'rgba(255, 107, 0, 0.05)'
                    }}
                  >
                    <HistoryIcon sx={{ fontSize: 60, color: 'rgba(255, 107, 0, 0.3)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                      No hay pedidos en el historial
                    </Typography>
                  </Box>
                ) : (
                  <List sx={{ width: '100%' }}>
                    {historialPedidos
                      .sort((a, b) => new Date(b.fechaPreparacion) - new Date(a.fechaPreparacion))
                      .map((pedido) => (
                        <Paper
                          key={pedido._id}
                          elevation={3}
                          sx={{
                            mb: 3,
                            overflow: 'hidden',
                            borderRadius: 3,
                            border: '1px solid rgba(255, 107, 0, 0.2)',
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            opacity: 0.8
                          }}
                        >
                          <Box sx={{ p: 3, bgcolor: 'rgba(255, 107, 0, 0.05)' }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              mb: 2 
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <RestaurantIcon sx={{ color: 'primary.main' }} />
                                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                  Mesa {pedido.mesa}
                                </Typography>
                              </Box>
                              <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'flex-end',
                                gap: 1
                              }}>
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  {pedido.pagado && (
                                    <Chip
                                      icon={<CheckCircleIcon />}
                                      label="PAGADO"
                                      color="success"
                                      variant="filled"
                                      size="small"
                                      sx={{ fontWeight: 'bold' }}
                                    />
                                  )}
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 'small' }} />
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Ingresó: {formatearFecha(pedido.timestamp)}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 'small' }} />
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Preparado: {formatearFecha(pedido.fechaPreparacion)}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            <List sx={{ 
                              bgcolor: 'rgba(0, 0, 0, 0.2)',
                              borderRadius: 2,
                              p: 2
                            }}>
                              {pedido.items.map((item, index) => (
                                <ListItem
                                  key={index}
                                  sx={{
                                    flexDirection: 'column',
                                    alignItems: 'stretch',
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: 2,
                                    mb: 1,
                                    p: 2,
                                    '&:last-child': {
                                      mb: 0
                                    }
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ 
                                          fontWeight: 'medium',
                                          color: 'primary.main'
                                        }}>
                                          {item.nombre}
                                        </Typography>
                                        <Chip 
                                          label={`x${item.cantidad}`}
                                          size="small"
                                          sx={{ 
                                            ml: 1, 
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            fontWeight: 'bold'
                                          }}
                                        />
                                      </Box>
                                    }
                                  />
                                  {item.comentario && (
                                    <Box sx={{
                                      mt: 1,
                                      p: 1.5,
                                      borderRadius: 2,
                                      bgcolor: 'rgba(255, 107, 0, 0.1)',
                                      border: '1px solid rgba(255, 107, 0, 0.2)'
                                    }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: 'primary.main',
                                          fontStyle: 'italic',
                                          fontWeight: 'medium'
                                        }}
                                      >
                                        ⚠️ {item.comentario}
                                      </Typography>
                                    </Box>
                                  )}
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </Paper>
                      ))}
                  </List>
                )}
              </>
            )}
          </Paper>
          <Box sx={{ mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                  Inventario de Platos
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PlaylistAddIcon />}
                  onClick={async () => {
                    await axios.post(`${API_URL}/api/inventario/inicializar`);
                    obtenerInventario();
                  }}
                >
                  Inicializar Inventario
                </Button>
              </Box>
              <List>
                {inventario.map((prod) => (
                  <ListItem key={prod._id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {editandoId === prod._id ? (
                      <>
                        <TextField size="small" value={editandoProducto.nombre} onChange={e => setEditandoProducto({ ...editandoProducto, nombre: e.target.value })} sx={{ width: 180 }} />
                        <TextField size="small" type="number" value={editandoProducto.cantidad} onChange={e => setEditandoProducto({ ...editandoProducto, cantidad: e.target.value })} sx={{ width: 90 }} />
                        <TextField size="small" type="number" value={editandoProducto.minimo} onChange={e => setEditandoProducto({ ...editandoProducto, minimo: e.target.value })} sx={{ width: 90 }} />
                        <IconButton onClick={() => guardarEdicion(prod._id)} color="success"><SaveIcon /></IconButton>
                      </>
                    ) : (
                      <>
                        <Typography sx={{ width: 180 }}>{prod.nombre}</Typography>
                        <Typography sx={{ width: 90 }}>{prod.cantidad}</Typography>
                        <Typography sx={{ width: 90 }}>{prod.minimo}</Typography>
                        {prod.cantidad <= prod.minimo && <WarningIcon color="warning" sx={{ ml: 1 }} />}
                        <IconButton onClick={() => { setEditandoId(prod._id); setEditandoProducto(prod); }} color="primary"><EditIcon /></IconButton>
                      </>
                    )}
                  </ListItem>
                ))}
                <ListItem sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TextField size="small" placeholder="Nuevo plato" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} sx={{ width: 180 }} />
                  <TextField size="small" type="number" placeholder="Cantidad" value={nuevoProducto.cantidad} onChange={e => setNuevoProducto({ ...nuevoProducto, cantidad: e.target.value })} sx={{ width: 90 }} />
                  <TextField size="small" type="number" placeholder="Mínimo" value={nuevoProducto.minimo} onChange={e => setNuevoProducto({ ...nuevoProducto, minimo: e.target.value })} sx={{ width: 90 }} />
                  <IconButton onClick={agregarProducto} color="primary"><AddIcon /></IconButton>
                </ListItem>
              </List>
            </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default VistaCocinero; 