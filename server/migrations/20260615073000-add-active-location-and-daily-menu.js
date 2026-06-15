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

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  return tables.includes(tableName);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfMissing(queryInterface, Sequelize, 'Locations', 'dayOfWeek', (DataTypes) => ({
      type: DataTypes.INTEGER,
      allowNull: true
    }));

    await addColumnIfMissing(queryInterface, Sequelize, 'Locations', 'startTime', (DataTypes) => ({
      type: DataTypes.TIME,
      allowNull: true
    }));

    await addColumnIfMissing(queryInterface, Sequelize, 'Locations', 'endTime', (DataTypes) => ({
      type: DataTypes.TIME,
      allowNull: true
    }));

    await addColumnIfMissing(queryInterface, Sequelize, 'Locations', 'isActive', (DataTypes) => ({
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }));

    await addColumnIfMissing(queryInterface, Sequelize, 'Locations', 'latitude', (DataTypes) => ({
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    }));

    await addColumnIfMissing(queryInterface, Sequelize, 'Locations', 'longitude', (DataTypes) => ({
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    }));

    if (!(await tableExists(queryInterface, 'DailyMenuItems'))) {
      await queryInterface.createTable('DailyMenuItems', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        foodTruckId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'FoodTrucks',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        dishId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Dishes',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        stock: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        isAvailable: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });

      await queryInterface.addIndex('DailyMenuItems', ['foodTruckId', 'dishId', 'date'], {
        unique: true,
        name: 'daily_menu_unique_food_truck_dish_date'
      });
    }
  },

  async down() {
    // No-op: preserving schedule, coordinates and daily menu data is safer than dropping columns.
  }
};
