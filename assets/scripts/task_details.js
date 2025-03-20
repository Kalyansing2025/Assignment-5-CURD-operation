document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get("id");

    if (!taskId) {
        alert("Task ID not found!");
        window.location.href = "/dashboard";
        return;
    }

    let isEditing = false; // Track edit mode
    let taskData = {}; // Store the original task data

    try {
        // ✅ Fetch task details
        const response = await fetch(`http://localhost:3000/task/${taskId}`);
        if (!response.ok) throw new Error("Failed to fetch task details");

        taskData = await response.json();
        if (!taskData || !taskData.id) {
            alert("Task not found!");
            window.location.href = "/dashboard";
            return;
        }

        // ✅ Populate Task Details
        document.getElementById("task-name").textContent = taskData.task_name || "Untitled Task";
        document.getElementById("task-owner").textContent = taskData.owner || "Unknown";
        document.getElementById("due-date").textContent = taskData.due_date || "Not Set";
        document.getElementById("task-status").textContent = taskData.status || "Pending";

        document.getElementById("task-owner-detail").textContent = taskData.owner;
        document.getElementById("task-name-detail").textContent = taskData.task_name;
        document.getElementById("task-description").textContent = taskData.description || "-";
        document.getElementById("start-date").textContent = taskData.start_date || "-";
        document.getElementById("due-date-detail").textContent = taskData.due_date || "-";
        document.getElementById("task-reminder").textContent = taskData.reminder || "-";
        document.getElementById("task-assigned").textContent = taskData.owner; 
        document.getElementById("task-priority").textContent = taskData.priority || "Not Set";
        document.getElementById("task-status-detail").textContent = taskData.status;

    } catch (error) {
        console.error("Error fetching task details:", error);
    }

    // ✅ Function to Toggle Edit Mode
    document.getElementById("edit-task-btn").addEventListener("click", function () {
        if (!isEditing) {
            enableEditMode();
        } else {
            saveTaskChanges(taskId);
        }
    });

    // ✅ Cancel Button Redirects
    document.getElementById("cancel-task-btn").addEventListener("click", function () {
        window.location.href = "/task_dashboard.html";
    });

    document.getElementById("close-btn").addEventListener("click", function () {
        window.location.href = "/task_dashboard.html";
    });

    function enableEditMode() {
        isEditing = true;
        document.getElementById("edit-task-btn").textContent = "💾 Save";
    
        // ✅ Format Date to "YYYY-MM-DD"
        const formatDate = (dateString) => {
            if (!dateString) return "";
            return new Date(dateString).toISOString().split("T")[0];
        };
    
        // ✅ Set min/max limits for dates
        const today = new Date().toISOString().split("T")[0]; // Min: Today
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 5); // Max: 5 years from today
        const maxDateFormatted = maxDate.toISOString().split("T")[0];
    
        document.getElementById("task-name-detail").innerHTML = `<input type="text" id="edit-task-name" value="${taskData.task_name}">`;
        document.getElementById("task-owner-detail").innerHTML = `<input type="text" id="edit-task-owner" value="${taskData.owner}">`;
        document.getElementById("task-description").innerHTML = `<textarea id="edit-description">${taskData.description || ""}</textarea>`;
    
        document.getElementById("start-date").innerHTML = `<input type="date" id="edit-start-date" value="${formatDate(taskData.start_date)}" min="${today}" max="${maxDateFormatted}">`;
        document.getElementById("due-date-detail").innerHTML = `<input type="date" id="edit-due-date" value="${formatDate(taskData.due_date)}">`;
        document.getElementById("task-reminder").innerHTML = `<input type="date" id="edit-reminder" value="${formatDate(taskData.reminder)}">`;
    
        document.getElementById("task-priority").innerHTML = `
            <select id="edit-priority">
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
            </select>`;
        document.getElementById("edit-priority").value = taskData.priority || "Low";
    
        document.getElementById("task-status-detail").innerHTML = `
            <select id="edit-status">
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
            </select>`;
        document.getElementById("edit-status").value = taskData.status;
    
        // ✅ Restrict Due Date and Reminder Based on Start Date
        const startDateInput = document.getElementById("edit-start-date");
        const dueDateInput = document.getElementById("edit-due-date");
        const reminderInput = document.getElementById("edit-reminder");
    
        if (startDateInput && dueDateInput) {
            startDateInput.addEventListener("change", function () {
                dueDateInput.value = "";
                dueDateInput.setAttribute("min", this.value);
                const maxDueDate = new Date(this.value);
                maxDueDate.setFullYear(maxDueDate.getFullYear() + 5);
                dueDateInput.setAttribute("max", maxDueDate.toISOString().split("T")[0]);
            });
        }
    
        if (dueDateInput && reminderInput) {
            dueDateInput.addEventListener("change", function () {
                reminderInput.value = "";
                reminderInput.setAttribute("max", this.value);
                if (startDateInput.value) {
                    reminderInput.setAttribute("min", startDateInput.value);
                }
            });
        }
    }
    
    

    async function saveTaskChanges(taskId) {
        isEditing = false;
        document.getElementById("edit-task-btn").textContent = "✏️ Edit";

        const taskName = document.getElementById("edit-task-name").value.trim();
        const owner = document.getElementById("edit-task-owner").value.trim();
        const description = document.getElementById("edit-description").value.trim() || "-";
        const startDate = document.getElementById("edit-start-date").value || null;
        const dueDate = document.getElementById("edit-due-date").value || null;
        const reminder = document.getElementById("edit-reminder").value || null;
        const priority = document.getElementById("edit-priority").value || "Low"; 
        const status = document.getElementById("edit-status").value || "Pending";

        // ✅ Check Required Fields
        if (!taskName || !owner || !startDate || !dueDate || !priority || !status) {
            alert("Please fill all required fields!");
            return;
        }

        const updatedTask = {
            task_id: taskId,
            owner: owner,
            task_name: taskName,
            description: description,
            start_date: startDate,
            due_date: dueDate,
            reminder: reminder,
            priority: priority,
            status: status
        };

        try {
            const response = await fetch(`http://localhost:3000/update-task`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTask),
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok) {
                // ✅ Reflect Changes in the UI Without Reload
                document.getElementById("task-name-detail").textContent = taskName;
                document.getElementById("task-owner-detail").textContent = owner;
                document.getElementById("task-description").textContent = description;
                document.getElementById("start-date").textContent = startDate;
                document.getElementById("due-date-detail").textContent = dueDate;
                document.getElementById("task-reminder").textContent = reminder;
                document.getElementById("task-priority").textContent = priority;
                document.getElementById("task-status-detail").textContent = status;
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    }
});
    