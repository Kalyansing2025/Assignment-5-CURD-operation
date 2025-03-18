document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("task-form");
    const submitAndNewBtn = document.getElementById("submit-new");
    const closeButton = document.getElementById("close-btn");
    const cancelButton = document.getElementById("cancel-btn");

    async function handleTaskSubmission(event, resetForm = false) {
        event.preventDefault();

        const taskData = {
            owner: document.getElementById("owner").value,
            task_name: document.getElementById("task_name").value,
            description: document.getElementById("description").value,
            start_date: document.getElementById("start_date").value,
            due_date: document.getElementById("due_date").value,
            reminder: document.getElementById("reminder").value,
            priority: document.getElementById("priority").value,
            status: document.getElementById("status").value
        };

        try {
            const response = await fetch("http://localhost:3000/add-task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(taskData),
            });

            const result = await response.json();
            alert(result.message);

            if (response.ok) {
                if (resetForm) {
                    taskForm.reset(); // Clear form fields for new task
                } else {
                    window.location.href = "../task_dashboard.html"; // Redirect to Dashboard
                }
            }
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task. Please try again.");
        }
    }

    // Submit form normally
    if (taskForm) {
        taskForm.addEventListener("submit", (event) => handleTaskSubmission(event));
    }

    // Submit and add new task without redirect
    if (submitAndNewBtn) {
        submitAndNewBtn.addEventListener("click", (event) => handleTaskSubmission(event, true));
    }

    // Redirect to dashboard on cancel
    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            window.location.href = "../task_dashboard.html";
        });
    }

    // Close button redirect
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            window.location.href = "../task_dashboard.html";
        });
    }
});
