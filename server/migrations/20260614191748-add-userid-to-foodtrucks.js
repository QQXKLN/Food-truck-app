'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('FoodTrucks', 'UserId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Users', // Apunta a la tabla Users
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE' // Si borramos al usuario, se borran sus camiones
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('FoodTrucks', 'UserId');
  }
};
