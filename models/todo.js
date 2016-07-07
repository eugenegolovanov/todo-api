module.exports = function(sequelize, DataTypes) {

	return  sequelize.define('todo' ,{
			description: {
				type: DataTypes.STRING,
				allowNull: false, //is not optional
				validate: {
					// notEmpty: true   //not allow empty strings
					len: [1, 250]   //length from 1 to 250
				}
			},
			completed: {
				type: DataTypes.BOOLEAN,
				allowNull: false, //is not optional
				defaultValue: false

			}
		})
	
};