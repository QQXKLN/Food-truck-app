'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('FoodTrucks');

    if (!table.UserId) {
      await queryInterface.addColumn('FoodTrucks', 'UserId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }
  },

  async down() {
    // No-op: preserving ownership data is safer than dropping UserId.
  }
};
