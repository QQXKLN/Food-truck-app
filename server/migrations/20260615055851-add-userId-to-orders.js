module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable('Orders');

    if (!table.userId) {
      await queryInterface.addColumn('Orders', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  down: async () => {
    // No-op: userId is part of the current Orders schema and may contain production data.
  }
};
