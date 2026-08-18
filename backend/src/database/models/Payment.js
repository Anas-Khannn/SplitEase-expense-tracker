const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Payment = sequelize.define(
    "Payment",
    {
      payment_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      group_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      paid_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      paid_to: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
      },
      payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "payments",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Payment;
};
