module.exports = {
  up: async (queryInterface, Sequelize) => {
   
    await queryInterface.removeColumn('Dishes', 'stock');
    await queryInterface.addColumn('Dishes', 'isAvailable', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Dishes', 'stock', { type: Sequelize.INTEGER });
    await queryInterface.removeColumn('Dishes', 'isAvailable');
  }
};