'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Dish extends Model {
    static associate(models) {
      
      Dish.belongsTo(models.FoodTruck, { foreignKey: 'foodTruckId' });
    }
  }
  
  Dish.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    foodTruckId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Dish',
  });
  
  return Dish;
};