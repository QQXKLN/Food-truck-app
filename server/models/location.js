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
    dayOfWeek: DataTypes.INTEGER,
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    latitude: DataTypes.DECIMAL(10, 7),
    longitude: DataTypes.DECIMAL(10, 7),
    foodTruckId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Location',
  });
  
  return Location;
};
