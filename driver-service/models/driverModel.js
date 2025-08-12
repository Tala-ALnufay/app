
const pool = require("../db");

// إنشاء سائق جديد
async function createDriver(name, email, password, phone) {
  const query = `
    INSERT INTO drivers (name, email, password, phone)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, email, password, phone];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// البحث عن سائق عبر الإيميل
async function findDriverByEmail(email) {
  const result = await pool.query("SELECT * FROM drivers WHERE email = $1", [email]);
  return result.rows[0];
}

// تحديث حالة السائق
async function updateDriverState(driverId, state) {
  await pool.query("UPDATE drivers SET driver_state = $1 WHERE id = $2", [state, driverId]);
}

module.exports = {
  createDriver,
  findDriverByEmail,
  updateDriverState,
};
