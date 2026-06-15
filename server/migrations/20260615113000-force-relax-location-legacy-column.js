'use strict';

const getTable = async (queryInterface, tableName) => {
  try {
    return await queryInterface.describeTable(tableName);
  } catch (error) {
    return null;
  }
};

module.exports = {
  async up(queryInterface) {
    const locations = await getTable(queryInterface, 'Locations');
    if (!locations) return;

    const hasLegacyColumn = Boolean(locations.FoodTruckId);
    const hasCurrentColumn = Boolean(locations.foodTruckId);

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

      await queryInterface.sequelize.query(`
        ALTER TABLE "Locations"
        ALTER COLUMN "FoodTruckId" DROP NOT NULL
      `);
    }
  },

  async down() {
    // No-op: restoring NOT NULL could break existing production rows.
  }
};
