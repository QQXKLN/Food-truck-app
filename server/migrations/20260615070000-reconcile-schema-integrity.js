'use strict';

const columnExists = async (queryInterface, tableName, columnName) => {
  const table = await queryInterface.describeTable(tableName);
  return Boolean(table[columnName]);
};

const addColumnIfMissing = async (queryInterface, Sequelize, tableName, columnName, definition) => {
  if (!(await columnExists(queryInterface, tableName, columnName))) {
    await queryInterface.addColumn(tableName, columnName, definition(Sequelize));
  }
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, Sequelize, 'Locations', 'foodTruckId', (DataTypes) => ({
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'FoodTrucks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }));

    if (await columnExists(queryInterface, 'Locations', 'FoodTruckId')) {
      await queryInterface.sequelize.query(`
        UPDATE "Locations"
        SET "foodTruckId" = "FoodTruckId"
        WHERE "foodTruckId" IS NULL
      `);
    }

    await addColumnIfMissing(queryInterface, Sequelize, 'Orders', 'items', (DataTypes) => ({
      type: DataTypes.TEXT,
      allowNull: true
    }));

    await addColumnIfMissing(queryInterface, Sequelize, 'Orders', 'paymentMethod', (DataTypes) => ({
      type: DataTypes.STRING,
      allowNull: true
    }));

    await addColumnIfMissing(queryInterface, Sequelize, 'Orders', 'userId', (DataTypes) => ({
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }));

    await addColumnIfMissing(queryInterface, Sequelize, 'Dishes', 'isAvailable', (DataTypes) => ({
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }));

    const dishes = await queryInterface.describeTable('Dishes');
    if (dishes.price) {
      await queryInterface.changeColumn('Dishes', 'price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: dishes.price.allowNull
      });
    }

    const orders = await queryInterface.describeTable('Orders');
    if (orders.total) {
      await queryInterface.changeColumn('Orders', 'total', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: orders.total.allowNull
      });
    }

    const orderItems = await queryInterface.describeTable('OrderItems');
    if (orderItems.price) {
      await queryInterface.changeColumn('OrderItems', 'price', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: orderItems.price.allowNull
      });
    }
  },

  async down() {
    // No-op by design: this migration reconciles live schemas without dropping data.
  }
};
