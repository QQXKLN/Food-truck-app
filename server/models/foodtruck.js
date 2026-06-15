'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FoodTruck extends Model {
    static associate(models) {
      FoodTruck.belongsTo(models.User, { foreignKey: 'UserId' });
      
      FoodTruck.hasMany(models.Location, { foreignKey: 'foodTruckId', as: 'locations' });
      FoodTruck.hasMany(models.Dish, { foreignKey: 'foodTruckId', as: 'dishes' });
      FoodTruck.hasMany(models.Order, { foreignKey: 'foodTruckId' });
    }
  }
  
  FoodTruck.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    logo: DataTypes.STRING,
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'FoodTruck',
  });
  
  return FoodTruck;
};
