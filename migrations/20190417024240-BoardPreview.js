module.exports = {
  up: (queryInterface, Sequelize) => (
    // Create the board_preview row in the Boards table
    queryInterface.addColumn(
      'Boards',
      'board_preview',
      {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="500" height="500"/>',
      },
    )
  ),

  down: queryInterface => (
    // Remove the board_preview row from the Boards table
    queryInterface.removeColumn('Boards', 'board_preview')
  ),
};
