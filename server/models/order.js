'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      
      Order.belongsTo(models.FoodTruck, { foreignKey: 'foodTruckId' });
      Order.belongsTo(models.User, { foreignKey: 'userId' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
    }
  }
  
  Order.init({
    foodTruckId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    total: DataTypes.DECIMAL(10, 2),
    status: DataTypes.STRING,
    items: DataTypes.TEXT,
    
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  
  return Order;
};
