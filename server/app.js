const express = require('express');
const { sequelize } = require('./models');
require('dotenv').config();
const cors = require('cors');

const foodTruckRoutes = require('./routes/foodTruckRoutes');
const locationRoutes = require('./routes/locationRoutes');
const authRoutes = require('./routes/authRoutes');
const dishRoutes = require('./routes/dishRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use('/api/v1/dishes', dishRoutes);

app.use(express.json());

app.use('/api/v1/food-trucks', foodTruckRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/auth', authRoutes); 

app.get('/', (req, res) => {
  res.send('¡Servidor del Food Truck funcionando perfectamente!');
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida con éxito.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
});