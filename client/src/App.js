import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import TomarPedido from './components/TomarPedido';
import VistaCocinero from './components/VistaCocinero';
import VistaCaja from './components/VistaCaja';

// Crear tema personalizado con los colores de Bizantino
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B00', // Naranja del logo
      contrastText: '#fff',
    },
    secondary: {
      main: '#FFA500', // Naranja más claro
    },
    background: {
      default: '#1A1A1A',
      paper: '#2D2D2D',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#FF6B00',
          },
        },
      },
    },
  },
});

function App() {
  const [tabActual, setTabActual] = useState(0);
  const [error, setError] = useState(null);

  const cambiarTab = (event, nuevoValor) => {
    setTabActual(nuevoValor);
  };

  // Agregar efecto para escuchar el evento de edición
  useEffect(() => {
    const handleEditarPedido = (event) => {
      // Cambiar a la vista de tomar pedido
      setTabActual(0);
      
      // Pequeño delay para asegurar que el componente TomarPedido esté montado
      setTimeout(() => {
        // Emitir evento para cargar el pedido en el formulario
        window.dispatchEvent(new CustomEvent('cargarPedidoParaEditar', {
          detail: event.detail.pedido
        }));
      }, 100);
    };

    window.addEventListener('editarPedido', handleEditarPedido);
    return () => window.removeEventListener('editarPedido', handleEditarPedido);
  }, []);

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ p: 3, color: 'error.main' }}>
          <Typography variant="h6">Error: {error.message}</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography 
              variant="h4" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#FF6B00',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              Bizantino
            </Typography>
          </Toolbar>
          <Tabs
            value={tabActual}
            onChange={cambiarTab}
            centered
            textColor="inherit"
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#FF6B00',
                height: '3px'
              },
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 'medium',
                letterSpacing: '0.5px',
                minWidth: 120,
                '&.Mui-selected': {
                  color: '#FF6B00',
                }
              }
            }}
          >
            <Tab label="TOMAR PEDIDO" />
            <Tab label="COCINA" />
            <Tab label="CAJA" />
          </Tabs>
        </AppBar>

        <Container sx={{ mt: 4 }}>
          {tabActual === 0 && <TomarPedido />}
          {tabActual === 1 && <VistaCocinero />}
          {tabActual === 2 && <VistaCaja />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 