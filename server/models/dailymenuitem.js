'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DailyMenuItem extends Model {
    static associate(models) {
      DailyMenuItem.belongsTo(models.FoodTruck, { foreignKey: 'foodTruckId' });
      DailyMenuItem.belongsTo(models.Dish, { foreignKey: 'dishId', as: 'dish' });
    }
  }

  DailyMenuItem.init({
    foodTruckId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dishId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'DailyMenuItem',
  });

  return DailyMenuItem;
};
