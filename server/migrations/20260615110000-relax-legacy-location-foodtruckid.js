'use strict';

const columnExists = async (queryInterface, tableName, columnName) => {
  const table = await queryInterface.describeTable(tableName);
  return Boolean(table[columnName]);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const hasLegacyColumn = await columnExists(queryInterface, 'Locations', 'FoodTruckId');
    const hasCurrentColumn = await columnExists(queryInterface, 'Locations', 'foodTruckId');

    if (hasLegacyColumn && hasCurrentColumn) {
      await queryInterface.sequelize.query(`
        UPDATE "Locations"
        SET "foodTruckId" = "FoodTruckId"
        WHERE "foodTruckId" IS NULL AND "FoodTruckId" IS NOT NULL
      `);

      await queryInterface.sequelize.query(`
        UPDATE "Locations"
        SET "FoodTruckId" = "foodTruckId"
        WHERE "FoodTruckId" IS NULL AND "foodTruckId" IS NOT NULL
      `);

      await queryInterface.changeColumn('Locations', 'FoodTruckId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'FoodTrucks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }
  },

  async down() {
    // No-op: keeping this migration reversible would risk blocking existing production rows.
  }
};
