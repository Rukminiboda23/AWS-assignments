const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 Replace with YOUR DB PRIVATE IP
const pool = new Pool({
  host: "DB_PRIVATE_IP",
  user: "student_user",
  password: "1234",
  database: "student_db",
  port: 5432,
});


// ✅ TEST API
app.get("/", (req, res) => {
  res.send("Node API running");
});


// ✅ GET STUDENTS
app.get("/students", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM students ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching students");
  }
});


// ✅ ADD STUDENT
app.post("/students", async (req, res) => {
  try {
    const { name, email, age, course } = req.body;

    const result = await pool.query(
      "INSERT INTO students(name, email, age, course) VALUES($1,$2,$3,$4) RETURNING *",
      [name, email, age, course]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding student");
  }
});


// ✅ DELETE STUDENT
app.delete("/students/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM students WHERE id=$1", [req.params.id]);
    res.send("Deleted");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting student");
  }
});


// ✅ UPDATE STUDENT
app.put("/students/:id", async (req, res) => {
  try {
    const { name, email, age, course } = req.body;

    await pool.query(
      "UPDATE students SET name=$1, email=$2, age=$3, course=$4 WHERE id=$5",
      [name, email, age, course, req.params.id]
    );

    res.send("Updated");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating student");
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));