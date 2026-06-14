'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FoodTruck extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    // Un Food Truck pertenece a un solo Usuario
    FoodTruck.belongsTo(models.User, { foreignKey: 'UserId' });
    // Un Food Truck tiene muchas ubicaciones (NUEVO)
    FoodTruck.hasMany(models.Location, { foreignKey: 'FoodTruckId', as: 'locations' });
  }
  }

  FoodTruck.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    logo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FoodTruck',
  });
  return FoodTruck;
};