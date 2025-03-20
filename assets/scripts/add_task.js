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


document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("task-form");

    function validateField(input) {
        if (input.value.trim() === "") {
            input.classList.add("is-invalid");
            input.classList.remove("is-valid");
        } else {
            input.classList.remove("is-invalid");
            input.classList.add("is-valid");
        }
    }

    // Add event listeners to all inputs for validation
    document.querySelectorAll("#task-form input, #task-form select, #task-form textarea").forEach(input => {
        input.addEventListener("blur", () => validateField(input)); // Validate on blur
        input.addEventListener("input", () => validateField(input)); // Live validation
    });

    taskForm.addEventListener("submit", function (event) {
        let isValid = true;
        document.querySelectorAll("#task-form input, #task-form select").forEach(input => {
            validateField(input);
            if (input.classList.contains("is-invalid")) {
                isValid = false;
            }
        });

        if (!isValid) {
            event.preventDefault(); // Prevent submission if form is invalid
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const startDate = document.getElementById("start_date");
    const dueDate = document.getElementById("due_date");
    const reminder = document.getElementById("reminder");

    if (startDate) {
        const today = new Date();
        const minDate = today.toISOString().split("T")[0]; // Today's date
        const maxDate = new Date(today.setFullYear(today.getFullYear() + 5)).toISOString().split("T")[0]; // 5 years later

        startDate.setAttribute("min", minDate);
        startDate.setAttribute("max", maxDate);
        console.log("Start Date Limit:", minDate, maxDate);
    }

    if (startDate && dueDate) {
        startDate.addEventListener("change", function () {
            dueDate.value = "";
            dueDate.setAttribute("min", this.value);
            const maxDue = new Date(this.value);
            maxDue.setFullYear(maxDue.getFullYear() + 5); // Limit Due Date to 5 years from Start Date
            dueDate.setAttribute("max", maxDue.toISOString().split("T")[0]);
            console.log("Due Date Limit:", this.value, maxDue.toISOString().split("T")[0]);
        });
    }

    if (dueDate && reminder) {
        dueDate.addEventListener("change", function () {
            reminder.value = "";
            reminder.setAttribute("max", this.value);
            if (startDate.value) {
                reminder.setAttribute("min", startDate.value);
            }
            console.log("Reminder Limit:", startDate.value, this.value);
        });
    }
});
