import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Autocomplete,
  Tabs,
  Tab,
  Grid,
  InputAdornment,
  Chip,
  Divider,
  ListItemButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import axios from 'axios';
import { API_URL } from '../config';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import WarningIcon from '@mui/icons-material/Warning';

const menu = {
  desayunos: [
    { id: 'D1', nombre: 'Desayuno Continental', precio: 14000 },
    { id: 'D2', nombre: 'Desayuno Omelet', precio: 12000 },
    { id: 'D3', nombre: 'Huevos al gusto', precio: 9000 },
    { id: 'D4', nombre: 'Desayuno calentado de lenteja', precio: 10000 },
    { id: 'D5', nombre: 'Desayuno calentado de frijol', precio: 12000 },
    { id: 'D6', nombre: 'Otro desayuno (huevos al gusto, queso, pan, fruta/yogurth, jugo, bebida caliente)', precio: 11000 }
  ],
  parrilla: [
    { id: 'P1', nombre: 'Carne llanera', precio: 30000 },
    { id: 'P2', nombre: 'Bistec a caballo', precio: 42000 },
    { id: 'P3', nombre: 'Bandeja paisa', precio: 35000 },
    { id: 'P4', nombre: 'Chuleta de pollo', precio: 28000 },
    { id: 'P5', nombre: 'Chuleta de cerdo', precio: 28000 },
    { id: 'P6', nombre: 'Filete de pollo', precio: 28000 },
    { id: 'P7', nombre: 'Mixta', precio: 30000 },
    { id: 'P8', nombre: 'Lomo de cerdo', precio: 28000 },
    { id: 'P9', nombre: 'Lomo de res', precio: 30000 },
    { id: 'P10', nombre: 'Parrillada en salsa de champiñones', precio: 32000 },
    { id: 'P11', nombre: 'Parrillada hawaiana', precio: 30000 },
    { id: 'P12', nombre: 'Parrillada gratinada', precio: 30000 }
  ],
  carta: [
    { id: 'C1', nombre: 'Churrasco 250g', precio: 40000 },
    { id: 'C2', nombre: 'Churrasco 400g', precio: 55000 },
    { id: 'C3', nombre: 'Punta de anca 250g', precio: 40000 },
    { id: 'C4', nombre: 'Punta de anca 400g', precio: 55000 },
    { id: 'C5', nombre: 'Bife de chorizo', precio: 50000 },
    { id: 'C6', nombre: 'Alitas BBQ (8 piezas)', precio: 28000 },
    { id: 'C7', nombre: 'Picada Personal', precio: 30000 },
    { id: 'C8', nombre: 'Picada Para dos', precio: 47000 },
    { id: 'C9', nombre: 'Picada Familiar', precio: 67000 },
    { id: 'C10', nombre: 'Pincho de res', precio: 14000 },
    { id: 'C11', nombre: 'Pincho de cerdo', precio: 14000 },
    { id: 'C12', nombre: 'Pincho de pollo', precio: 14000 },
    { id: 'C13', nombre: 'Pincho mixto', precio: 14000 },
    { id: 'C14', nombre: 'Costillas BBQ', precio: 28000 },
    { id: 'C15', nombre: 'Costillas al limón', precio: 28000 },
    { id: 'C16', nombre: 'Salchipapa', precio: 9000 },
    { id: 'C17', nombre: 'Salchipapa gratinada', precio: 11000 }
  ],
  mariscos: [
    { id: 'M1', nombre: 'Almuerzo con filete de pescado apanado', precio: 20000 },
    { id: 'M2', nombre: 'Almuerzo con tilapia roja (500g)', precio: 30000 },
    { id: 'M3', nombre: 'Almuerzo con trucha (350g)', precio: 28000 },
    { id: 'M4', nombre: 'Almuerzo con trucha (250g)', precio: 22000 },
    { id: 'M5', nombre: 'Almuerzo con sierra frita (250g)', precio: 28000 },
    { id: 'M6', nombre: 'Camarones apanados', precio: 38000 },
    { id: 'M7', nombre: 'Camarones encocados', precio: 42000 },
    { id: 'M8', nombre: 'Ceviche de camarones grande', precio: 44000 },
    { id: 'M9', nombre: 'Cazuela de camarones', precio: 53000 },
    { id: 'M10', nombre: 'Langostinos apanados', precio: 62000 },
    { id: 'M11', nombre: 'Langostinos encocados', precio: 65000 },
    { id: 'M12', nombre: 'Langostinos a la parrilla', precio: 60000 },
    { id: 'M13', nombre: 'Camarones a la parrilla', precio: 38000 },
    { id: 'M14', nombre: 'Arroz con camarón', precio: 38000 },
    { id: 'M15', nombre: 'Pargo frito', precio: 50000 },
    { id: 'M16', nombre: 'Pargo encocado', precio: 55000 },
    { id: 'M17', nombre: 'Trucha en salsa de camarón', precio: 50000 },
    { id: 'M18', nombre: 'Pargo en salsa de camarón', precio: 65000 },
    { id: 'M19', nombre: 'Pescado pelada frita', precio: 45000 },
    { id: 'M20', nombre: 'Pescado pelada encocada', precio: 50000 },
    { id: 'M21', nombre: 'Trucha en salsa de champiñón', precio: 32000 },
    { id: 'M22', nombre: 'Cazuela de mariscos', precio: 60000 },
    { id: 'M23', nombre: 'Sierra encocada', precio: 30000 },
    { id: 'M24', nombre: 'Arroz marinero', precio: 45000 },
    { id: 'M25', nombre: 'Porción pescado (400g de sierra)', precio: 25000 },
    { id: 'M26', nombre: 'Salmón (300g)', precio: 45000 }
  ],
  especiales: [
    { id: 'E1', nombre: 'Almuerzo con carnes a la parrilla', precio: 20000 },
    { id: 'E2', nombre: 'Sancocho trifásico', precio: 35000 },
    { id: 'E3', nombre: 'Sancocho de pescado', precio: 32000 },
    { id: 'E4', nombre: 'Sancocho de espinazo (400g)', precio: 30000 },
    { id: 'E5', nombre: 'Ajiaco (250g de pechuga)', precio: 30000 }
  ],
  ejecutivos: [
    { id: 'EJ1', nombre: 'Almuerzo ejecutivo (130g carne a la parrilla)', precio: 16000 },
    { id: 'EJ2', nombre: 'Almuerzo con chuleta de cerdo (140g)', precio: 20000 },
    { id: 'EJ3', nombre: 'Almuerzo con chuleta de pollo (140g)', precio: 20000 },
    { id: 'EJ4', nombre: 'Almuerzo con costilla ahumada (200g)', precio: 20000 },
    { id: 'EJ5', nombre: 'Almuerzo con pollo ahumado (1/4)', precio: 22000 }
  ],
  frijolada: [
    { id: 'F1', nombre: 'Cazuela de frijoles completa', precio: 22000 }
  ],
  adicionales: [
    { id: 'A1', nombre: 'Frijol pequeño', precio: 3000 },
    { id: 'A2', nombre: 'Frijol grande', precio: 8000 },
    { id: 'A3', nombre: 'Arroz', precio: 3000 },
    { id: 'A4', nombre: 'Patacones', precio: 3000 },
    { id: 'A5', nombre: 'Sopa', precio: 7000 },
    { id: 'A6', nombre: 'Consomé', precio: 7000 },
    { id: 'A7', nombre: 'Fruta', precio: 5000 },
    { id: 'A8', nombre: 'Huevo adicional', precio: 3000 }
  ],
  bebidas: [
    { id: 'B1', nombre: 'Limonada', precio: 8000 },
    { id: 'B2', nombre: 'Limonada jarra', precio: 25000 },
    { id: 'B3', nombre: 'Jugo en agua', precio: 6000 },
    { id: 'B4', nombre: 'Jugo en leche', precio: 8000 },
    { id: 'B5', nombre: 'Jarra de jugo natural', precio: 25000 },
    { id: 'B6', nombre: 'Cerezada', precio: 11000 },
    { id: 'B7', nombre: 'Coca Cola', precio: 3000 },
    { id: 'B8', nombre: 'Gaseosa', precio: 3000 },
    { id: 'B9', nombre: 'Agua', precio: 3000 }
  ]
};

const categorias = {
  desayunos: '🥐 Desayunos',
  parrilla: '🍖 Parrilla / Carnes',
  carta: '🍽️ Platos a la Carta',
  mariscos: '🐟 Mariscos',
  especiales: '🍲 Especiales Domingo',
  ejecutivos: '🍛 Almuerzos / Ejecutivos',
  frijolada: '🍲 Frijolada',
  adicionales: '➕ Adicionales',
  bebidas: '🥤 Bebidas'
};

const TomarPedido = () => {
  const [numeroMesa, setNumeroMesa] = useState('');
  const [items, setItems] = useState([]);
  const [categoriaActual, setCategoriaActual] = useState('carta');
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [comentario, setComentario] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [inventario, setInventario] = useState([]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#FF6B00',
      },
    },
  });

  // Crear una lista plana de todos los productos para la búsqueda
  const todosLosProductos = useMemo(() => {
    return Object.entries(menu).flatMap(([categoria, productos]) =>
      productos.map(producto => ({
        ...producto,
        categoria
      }))
    );
  }, []);

  // Obtener inventario
  const obtenerInventario = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/inventario`);
      setInventario(res.data);
    } catch (error) {}
  };

  useEffect(() => {
    obtenerInventario();
  }, []);

  // Filtrar productos basados en la búsqueda y el inventario
  const productosFiltrados = useMemo(() => {
    let base = menu[categoriaActual];
    if (!busqueda) return base.map(prod => {
      const inv = inventario.find(i => i.nombre === prod.nombre);
      return { ...prod, disponible: inv ? inv.cantidad : undefined };
    });
    return todosLosProductos.filter(producto =>
      producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
    ).map(prod => {
      const inv = inventario.find(i => i.nombre === prod.nombre);
      return { ...prod, disponible: inv ? inv.cantidad : undefined };
    });
  }, [busqueda, categoriaActual, todosLosProductos, inventario]);

  const handleChangeCategorias = (event, newValue) => {
    setCategoriaActual(newValue);
    setItemSeleccionado(null);
    setBusqueda('');
  };

  const agregarItem = () => {
    if (itemSeleccionado) {
      const nuevoItem = {
        ...itemSeleccionado,
        cantidad,
        subtotal: itemSeleccionado.precio * cantidad,
        comentario: comentario.trim()
      };
      setItems(prevItems => [...prevItems, nuevoItem]);
      setItemSeleccionado(null);
      setCantidad(1);
      setComentario('');
    }
  };

  const eliminarItem = (index) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  };

  // Función para cargar pedido para editar
  const cargarPedidoParaEditar = (pedido) => {
    setModoEdicion(true);
    setPedidoEditando(pedido);
    setNumeroMesa(pedido.mesa.toString());
    setItems(pedido.items);
  };

  // Función para cancelar edición
  const cancelarEdicion = () => {
    setModoEdicion(false);
    setPedidoEditando(null);
    setNumeroMesa('');
    setItems([]);
  };

  // Modificar enviarPedido para manejar edición
  const enviarPedido = async () => {
    if (!numeroMesa || items.length === 0) {
      alert('Por favor ingresa el número de mesa y al menos un producto');
      return;
    }

    try {
      const pedido = {
        mesa: numeroMesa,
        items: items.map(item => ({
          id: item.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
          subtotal: item.subtotal,
          comentario: item.comentario || ''
        })),
        total: calcularTotal()
      };

      let response;
      
      if (modoEdicion && pedidoEditando) {
        // Si estamos editando, usar PATCH
        response = await axios.patch(`${API_URL}/api/pedidos/${pedidoEditando._id}/editar`, pedido);
        alert('Pedido actualizado con éxito');
      } else {
        // Si es nuevo pedido, usar POST
        response = await axios.post(`${API_URL}/api/pedidos`, pedido);
        alert('Pedido enviado con éxito');
      }
      
      if (response.data) {
        setNumeroMesa('');
        setItems([]);
        setItemSeleccionado(null);
        setCantidad(1);
        setBusqueda('');
        setModoEdicion(false);
        setPedidoEditando(null);
      }
    } catch (error) {
      console.error('Error al enviar pedido:', error);
      if (error.response?.data?.error === 'No se puede editar un pedido que ya está preparado') {
        alert('No se puede editar un pedido que ya está preparado en cocina');
      } else {
        alert('Error al procesar el pedido. Por favor intenta nuevamente.');
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

  // Efecto para escuchar el evento de cargar pedido para editar
  useEffect(() => {
    const handleCargarPedido = (event) => {
      cargarPedidoParaEditar(event.detail);
    };

    window.addEventListener('cargarPedidoParaEditar', handleCargarPedido);
    return () => window.removeEventListener('cargarPedidoParaEditar', handleCargarPedido);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ maxWidth: 1400, margin: 'auto', p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
        <Grid container spacing={3}>
          {/* Panel izquierdo: Categorías */}
          <Grid item xs={12} md={2}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper',
                height: '100%',
                borderRadius: 2,
                border: '1px solid rgba(255, 107, 0, 0.1)'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#FF6B00', 
                  fontWeight: 'bold', 
                  mb: 3,
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '2px solid #FF6B00',
                  paddingBottom: '8px'
                }}
              >
                Categorías
              </Typography>
              <List sx={{ 
                '& .Mui-selected': {
                  bgcolor: '#FF6B00 !important',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#FF8534 !important',
                  },
                }
              }}>
                {Object.entries(categorias).map(([key, label]) => (
                  <ListItem 
                    key={key}
                    disablePadding
                    sx={{ mb: 1 }}
                  >
                    <ListItemButton
                      selected={categoriaActual === key}
                      onClick={() => handleChangeCategorias(null, key)}
                      sx={{
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#FF6B00',
                          color: 'white',
                          transform: 'translateX(5px)'
                        },
                      }}
                    >
                      <ListItemText 
                        primary={label}
                        primaryTypographyProps={{
                          fontSize: '0.95rem',
                          fontWeight: categoriaActual === key ? 'bold' : 'normal'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Panel central: Selección de productos */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3, 
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid rgba(255, 107, 0, 0.1)'
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: '#FF6B00', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  mb: 3,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderBottom: '2px solid #FF6B00',
                  paddingBottom: '8px'
                }}
              >
                Tomar Pedido
              </Typography>

              <TextField
                fullWidth
                label="Número de Mesa"
                value={numeroMesa}
                onChange={(e) => setNumeroMesa(e.target.value)}
                type="number"
                required
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 107, 0, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 107, 0, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B00',
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Buscar producto"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255, 107, 0, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 107, 0, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FF6B00',
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#FF6B00' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ mb: 3 }}>
                <Autocomplete
                  value={itemSeleccionado}
                  onChange={(event, newValue) => setItemSeleccionado(newValue)}
                  options={productosFiltrados}
                  getOptionLabel={(option) => `${option.nombre} - ${formatearPrecio(option.precio)}${typeof option.disponible !== 'undefined' ? ` (Disp: ${option.disponible})` : ''}`}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Seleccionar producto" 
                      fullWidth
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'rgba(255, 107, 0, 0.3)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 107, 0, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#FF6B00',
                          },
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        width: '100%',
                        p: 1
                      }}>
                        <Typography>{option.nombre}</Typography>
                        <Typography sx={{ 
                          color: '#FF6B00', 
                          fontWeight: 'bold',
                          bgcolor: 'rgba(255, 107, 0, 0.1)',
                          px: 1,
                          borderRadius: 1
                        }}>
                          {formatearPrecio(option.precio)}
                        </Typography>
                        {typeof option.disponible !== 'undefined' && (
                          <Typography sx={{ ml: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
                            {option.disponible > 0 ? `Disp: ${option.disponible}` : 'Sin stock'}
                          </Typography>
                        )}
                      </Box>
                    </li>
                  )}
                />
              </Box>

              {itemSeleccionado && (
                <>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Comentarios (opcional)"
                        placeholder="Ej: Término de la carne, sin cebolla, etc."
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        sx={{
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255, 107, 0, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 107, 0, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#FF6B00',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Cantidad"
                        value={cantidad}
                        onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                        inputProps={{ min: 1 }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'rgba(255, 107, 0, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(255, 107, 0, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#FF6B00',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={agregarItem}
                        sx={{ 
                          height: '100%',
                          bgcolor: '#FF6B00',
                          '&:hover': {
                            bgcolor: '#FF8534',
                          }
                        }}
                      >
                        Agregar al Pedido
                      </Button>
                    </Grid>
                  </Grid>
                </>
              )}
            </Paper>
          </Grid>

          {/* Panel derecho: Resumen del pedido */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 3, 
                bgcolor: 'background.paper',
                height: '100%',
                borderRadius: 2,
                border: '1px solid rgba(255, 107, 0, 0.1)'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#FF6B00', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  mb: 3,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  borderBottom: '2px solid #FF6B00',
                  paddingBottom: '8px'
                }}
              >
                Resumen del Pedido
              </Typography>

              {items.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    my: 4, 
                    color: 'text.secondary',
                    p: 3,
                    border: '2px dashed rgba(255, 107, 0, 0.2)',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    No hay items en el pedido
                  </Typography>
                  <Typography variant="body2" color="text.disabled">
                    Selecciona productos para comenzar
                  </Typography>
                </Box>
              ) : (
                <List>
                  {items.map((item, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        sx={{
                          bgcolor: 'rgba(255, 107, 0, 0.05)',
                          borderRadius: 1,
                          mb: 1,
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(255, 107, 0, 0.1)',
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%'
                        }}>
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
                          <IconButton 
                            edge="end" 
                            onClick={() => eliminarItem(index)}
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                bgcolor: 'rgba(255, 0, 0, 0.1)',
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        {item.comentario && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'text.secondary',
                              mt: 1,
                              fontStyle: 'italic',
                              bgcolor: 'rgba(255, 107, 0, 0.05)',
                              p: 1,
                              borderRadius: 1
                            }}
                          >
                            Nota: {item.comentario}
                          </Typography>
                        )}
                      </ListItem>
                      {index < items.length - 1 && <Divider sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ 
                bgcolor: 'rgba(255, 107, 0, 0.1)', 
                p: 2, 
                borderRadius: 2,
                mb: 2
              }}>
                <Typography 
                  variant="h5" 
                  align="right" 
                  sx={{ 
                    color: '#FF6B00',
                    fontWeight: 'bold'
                  }}
                >
                  Total: {formatearPrecio(calcularTotal())}
                </Typography>
              </Box>

              <Button
                fullWidth
                variant="contained"
                onClick={enviarPedido}
                disabled={items.length === 0 || !numeroMesa}
                sx={{ 
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  bgcolor: modoEdicion ? '#4CAF50' : '#FF6B00',
                  '&:hover': {
                    bgcolor: modoEdicion ? '#45a049' : '#FF8534',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(255, 107, 0, 0.3)',
                  }
                }}
              >
                {modoEdicion ? 'Actualizar Pedido' : 'Enviar Pedido'}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default TomarPedido; 