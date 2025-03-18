document.addEventListener("DOMContentLoaded", function () {
    fetchTasks(); // ✅ Fetch and display all tasks

    document.getElementById("addTaskBtn").addEventListener("click", function () {
        window.location.href = "pages/add_task.html"; // ✅ Redirect to add task page
    });
});

// ✅ Function to fetch and display all tasks
async function fetchTasks() {
    try {
        const response = await fetch("http://localhost:3000/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks"); // ✅ Error handling

        const tasks = await response.json();
        const taskContainer = document.querySelector(".task-body");
        if (!taskContainer) return;

        taskContainer.innerHTML = ""; // ✅ Clear previous tasks

        let total = tasks.length;
        let completed = tasks.filter(task => task.status === "Completed").length;
        let open = total - completed;

        document.getElementById("totalTasks").textContent = total;
        document.getElementById("openTasks").textContent = open;
        document.getElementById("completedTasks").textContent = completed;

        tasks.forEach(task => {
            const formattedDate = task.start_date ? new Date(task.start_date).toLocaleDateString() : "No Date";

            const taskRow = document.createElement("div");
            taskRow.classList.add("task-row");
            taskRow.innerHTML = `
                <div class="task-details">
                    <input type="checkbox" ${task.status === "Completed" ? "checked" : ""}>
                    <div class="task-info">
                        <span class="task-name">${task.task_name}</span>
                        <span class="task-meta">${task.owner} • ${formattedDate}</span>
                    </div>
                </div>
                <div class="task-assignee">
                    <div class="initial">${task.owner.charAt(0)}</div>
                </div>
                <button class="btn btn-light edit-task" data-task-id="${task.id}">Edit</button>
                <button class="btn btn-light delete-task" data-task-id="${task.id}">Delete</button>
            `;

            taskContainer.appendChild(taskRow);

            // ✅ Attach Event Listeners
            taskRow.querySelector(".delete-task").addEventListener("click", () => deleteTask(task.id, taskRow));
            taskRow.querySelector(".edit-task").addEventListener("click", () => editTask(task.id));
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

// ✅ Function to redirect to Task Details Page (Edit)
function editTask(taskId) {
    window.location.href = `pages/task_details.html?id=${taskId}`;
}

// ✅ Function to delete a task by ID
async function deleteTask(taskId, taskRow) {
    if (!confirm(`Are you sure you want to delete this task?`)) return;

    try {
        const response = await fetch("http://localhost:3000/delete-task", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ task_id: taskId }), // ✅ Use `task_id` instead of `task_name`
        });

        const result = await response.json();
        alert(result.message);

        if (response.ok) taskRow.remove();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}
