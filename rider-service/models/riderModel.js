
const pool = require("../db");


async function createRider(name, email, hashedPassword, phone) {
  await pool.query(
    "INSERT INTO riders (name, email, password, phone) VALUES ($1, $2, $3, $4)",
    [name, email, hashedPassword, phone]
  );
}

async function getRiderByEmail(email) {
  const result = await pool.query("SELECT * FROM riders WHERE email = $1", [email]);
  return result.rows[0];
}



module.exports = { getRiderByEmail, createRider };