const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
// app.use(express.static(path.join(__dirname, "src/pages")));

const app = express();
app.use(express.json());       
app.use(cors());
app.use(express.static(path.join(__dirname, "src"))); // Serve static files from 'src' folder

//  MySQL Connection (Using Connection Pool)
const db = mysql.createPool({
    host: "localhost",
    user: "root", 
    password: "Pass@123", 
    database: "task_manager", 
    waitForConnections: true, 
    connectionLimit: 10,

    
    queueLimit: 0
}).promise();

//  Health Check Route (Test if Server is Running)
app.get("/", (req, res) => {
    res.send("Server is running!");
});                                     


//  Fetch a Single Task by ID (Fixes Empty Response Issue)
app.get("/task/:id", async (req, res) => {
    const taskId = req.params.id;

    try {
        const [tasks] = await db.execute("SELECT * FROM tasks WHERE id = ?", [taskId]);

        if (tasks.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json(tasks[0]); //  Return first matching task
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: "Failed to fetch task" });
    }
});



//  Delete Task Route (Fixed)
app.delete("/delete-task", async (req, res) => {
    console.log("Delete request received:", req.body);

    const { task_id } = req.body; //  Using `task_id` instead of `task_name`
    if (!task_id) {
        return res.status(400).json({ message: "Task ID is required" });
    }

    try {
        const [result] = await db.execute("DELETE FROM tasks WHERE id = ?", [task_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ message: "Failed to delete task" });
    }
});



// Update Task Route (Supports All Fields)
app.put("/update-task", async (req, res) => {
    console.log("🔹 Update request received:", req.body);

    const { task_id, owner, task_name, description, start_date, due_date, reminder, priority, status } = req.body;

    // Validation: Ensure required fields are present
    if (!task_id || !owner || !task_name || !description || !start_date || !due_date || !priority || !status) {
        return res.status(400).json({ message: "All required fields must be filled!" });
    }

    try {
        //  Update task in the database
        const [result] = await db.execute(
            `UPDATE tasks 
             SET owner = ?, task_name = ?, description = ?, start_date = ?, due_date = ?, reminder = ?, priority = ?, status = ? 
             WHERE id = ?`,
            [owner, task_name, description, start_date, due_date, reminder || null, priority, status, task_id]
        );

        console.log("✅ SQL Update Result:", result);

        //  If no rows were affected, return "Task not found"
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Task not found or no changes made." });
        }

        // Success Response
        res.json({ message: "Task updated successfully!" });
    } catch (error) {
        console.error("❌ Error updating task:", error);
        res.status(500).json({ message: "Internal server error. Please try again later." });
    }
});


//  Add Task Route
app.post("/add-task", async (req, res) => {
    console.log("Received add-task request:", req.body);

    const { owner, task_name, description, start_date, due_date, reminder, priority, status } = req.body;

    if (!task_name || !owner) {
        return res.status(400).json({ message: "Task name and owner are required!" });
    }

    try {
        const sql = " INSERT INTO tasks (owner, task_name, description, start_date, due_date, reminder, priority, status)VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const [result] = await db.execute(sql, [owner, task_name, description, start_date, due_date, reminder, priority, status || "Open"]);

        if (result.affectedRows > 0) {
            res.json({ message: "Task added successfully!",task: { owner, task_name, description, start_date, due_date, reminder, priority, status }
            });
        } else {
            res.status(500).json({ message: "Failed to add task" });
        }
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//  Get All Tasks Route (For Dashboard)
app.get("/tasks", async (req, res) => {
    try {
        const [results] = await db.execute("SELECT * FROM tasks ORDER BY id DESC");
        console.log("Tasks fetched:", results);
        res.status(200).json(results);
    } catch (error) {
        console.error("Database error fetching tasks:", error);
        res.status(500).json({ message: "Database error." });
    }
});

//  Serve Dashboard Page
app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "pages", "task_dashboard.html"));
});

//  Start Server with Proper Shutdown Handling
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

//  Graceful Shutdown (Prevents Port Blocking)
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});
