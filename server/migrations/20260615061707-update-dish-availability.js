'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Dishes');

    if (!table.isAvailable) {
      await queryInterface.addColumn('Dishes', 'isAvailable', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
    }
  },

  down: async () => {
    // No-op: preserving existing stock and availability data is safer than dropping columns.
  }
};
