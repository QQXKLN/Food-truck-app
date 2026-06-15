'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('Users');

    if (!table.isAdmin) {
      await queryInterface.addColumn('Users', 'isAdmin', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
  },

  async down() {
    // No-op: preserving role/admin data is safer than dropping isAdmin.
  }
};
