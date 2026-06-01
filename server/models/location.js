'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Una ubicación pertenece a un Food Truck
     Location.belongsTo(models.FoodTruck, {
       foreignKey: 'foodTruckId',
       as: 'foodTruck'
     });
    }
  }
  Location.init({
    address: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    isActive: DataTypes.BOOLEAN,
    foodTruckId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};