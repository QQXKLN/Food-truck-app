'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
      Location.belongsTo(models.FoodTruck, { foreignKey: 'FoodTruckId' });
    }
  }
  
  Location.init({
    address: DataTypes.STRING,
    schedule: DataTypes.STRING,
    FoodTruckId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Location',
  });
  
  return Location;
};