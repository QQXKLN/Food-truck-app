'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      
      Location.belongsTo(models.FoodTruck, { foreignKey: 'foodTruckId' });
    }
  }
  
  Location.init({
    address: DataTypes.STRING,
    schedule: DataTypes.STRING,
    
    foodTruckId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Location',
  });
  
  return Location;
};