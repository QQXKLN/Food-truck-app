const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { sequelize } = require('./models');

const foodTruckRoutes = require('./routes/foodTruckRoutes');
const locationRoutes = require('./routes/locationRoutes');
const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN }));

app.get('/', (req, res) => {
  res.send('Servidor del Food Truck funcionando correctamente');
});

app.use('/api/v1/dishes', dishRoutes);
app.use('/api/v1/food-trucks', foodTruckRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada',
    code: 'NOT_FOUND'
  });
});

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);

  try {
    await sequelize.authenticate();
    console.log('Conexion a la base de datos establecida con exito.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
});
