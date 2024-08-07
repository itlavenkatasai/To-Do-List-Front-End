const env = "PROD";
const publicMongoUrl = env === 'PROD' ? 'https://to-do-list-back-end-qjw5.onrender.com' : 'http://localhost:3000';
const form = document.getElementById("form");
const inputTodo = document.getElementById("input-todo");
const inputDate = document.getElementById("input-date");

window.onpopstate = function (event) {
    if (event && event.state) {
        location.reload();
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    const result2 = await listTasksAPI();
    const { status: listTaskStatus, data: { data: tasks } } = result2;
    if (listTaskStatus) {
        writeDataIntoTable(tasks);
    }
});

function handleLogOut() {
    localStorage.removeItem("token");
    window.location = './login.html';
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (inputTodo.value == '') {
        return setError(inputTodo, 'todo value cannot be empty');
    } else {
        setSuccess(inputTodo);
    }

    if (inputDate.value == '') {
        return setError(inputDate, 'todo date cannot be empty');
    } else {
        setSuccess(inputDate);
    }
    const data = {
        "text": inputTodo.value,
        "dueDate": inputDate.value,
        "status": false
    }
    console.log(data.dueDate);
    const showSuccess = document.getElementById("backend-error");
    showSuccess.innerHTML = '';
    showSuccess.innerHTML = "New task created successfully";
    showSuccess.style.display = 'block';
    showSuccess.style.color = "#2ecc71";
    showSuccess.style.fontSize = "30px";
    showSuccess.style.fontWeight = "bold";
    setTimeout(() => {
        const showSuccess = document.getElementById("backend-error");
        showSuccess.style.display = "none";
    }, 1000);
    await createTaskAPI(data);
    const listResults = await listTasksAPI();
    console.log("list", listResults)
    const { status, data: { data: tasks } } = listResults;

    if (status) {
        writeDataIntoTable(tasks);
        inputTodo.value = '';
        inputDate.value = '';
    }
});

function writeDataIntoTable(tasks) {
    console.log("tasks write", tasks);
    const body = document.getElementById('tbody');
    body.innerHTML = ' ';
    const showTasks = document.getElementById("tasks-no");
    showTasks.innerHTML = tasks.length + " tasks";
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const { text, dueDate, status, _id: id } = task;
        const date = new Date(dueDate);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0'); // Adding leading zero to month
        const d = String(date.getDate()).padStart(2, '0');      // Adding leading zero to date
        const format = d + "-" + m + "-" + y;
        task.dueDate = format;
        if (!status) {
            const tr = `
                <tr>
                <td>
                    <div class="field-information">
                        <input type="radio" id="radio" class="radio" onclick="changeStatus('${id}','no')">
                        <p>${text}</p>
                        <label class="date" id="date">${task.dueDate}</label>
                        <i class="material-icons delete-icon" class="delete-row" onclick="deleteTask('${id}',)">delete</i>
                    </div>
                    </td>
                </tr>`;
            body.innerHTML += tr;
        }
        else {
            const tr = `
            <tr>
            <td>
                <div class="field-information">
                    <input type="radio" checked id="radio" class="radio" onclick="changeStatus('${id}','yes')">
                    <p><s>${text}</s></p>
                  <label class="date" id="date"><s>${task.dueDate}</s></label>
                    <i class="material-icons delete-icon" class="delete-row" onclick="deleteTask('${id}')">delete</i>
                </div>
                </td>
            </tr>`;
            body.innerHTML += tr;
        }
    }
}

async function createTaskAPI(data) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${publicMongoUrl}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(JSON.stringify(await response.json()));
        }
        const results = await response.json();
        console.log("success results", results);
        return {
            status: true,
            data: results
        }
    } catch (error) {
        console.log("error", error);
        const errorMessage = JSON.parse(error.message);
        const { message } = errorMessage;
        const showError = document.getElementById("backend-error");
        showError.innerHTML = message;
        return {
            data: null,
            status: false,
            error: message
        }
    }
}

async function listTasksAPI() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${publicMongoUrl}/tasks`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        if (!response.ok) {
            throw new Error(JSON.stringify(await response.json()));
        }
        const results = await response.json();
        console.log("success", results);
        return {
            status: true,
            data: results
        }
    } catch (error) {
        console.log("error", error);
        const errorMessage = JSON.parse(error.message);
        const { message } = errorMessage;
        const showError = document.getElementById("backend-error");
        showError.innerHTML = message;
        return {
            data: null,
            status: false,
            error: message
        }
    }
}

async function updateTaskAPI(data, id) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${publicMongoUrl}/tasks/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data)
        });
        return {
            status: true,
        }
    } catch (error) {
        console.log("error", error);
        return {
            status: false,
        }
    }
}

async function changeStatus(id, isTicked) {
    console.log(id);
    const data = {
        status: isTicked == "no" ? true : false
    }
    await updateTaskAPI(data, id);
    const listResults = await listTasksAPI();
    const { status, data: { data: tasks } } = listResults;
    if (status) {
        writeDataIntoTable(tasks);
        if (data.status) {
            const showSuccess = document.getElementById("backend-error");
            showSuccess.innerHTML = '';
            showSuccess.innerHTML = "Task marked as a completed successfully";
            showSuccess.style.display = 'block';
            showSuccess.style.color = "#2ecc71";
            showSuccess.style.fontSize = "30px";
            showSuccess.style.fontWeight = "bold";
            setTimeout(() => {
                const showSuccess = document.getElementById("backend-error");
                showSuccess.style.display = "none";
            }, 2000);
        }
        if (!data.status) {
            const showSuccess = document.getElementById("backend-error");
            showSuccess.innerHTML = '';
            showSuccess.innerHTML = "Task status reverted to pending successfull";
            showSuccess.style.display = 'block';
            showSuccess.style.color = "#e74c3c";
            showSuccess.style.fontSize = "30px";
            showSuccess.style.fontWeight = "bold";
            setTimeout(() => {
                const showSuccess = document.getElementById("backend-error");
                showSuccess.style.display = "none";
            }, 1000);
        }
    }
}

async function deleteTaskAPI(id) {
    try {
        const token = localStorage.getItem("token");
        await fetch(`${publicMongoUrl}/tasks/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "Application/json",
                "Authorization": `Bearer ${token}`,
            }
        });
        return {
            status: true
        }
    } catch (error) {
        console.log("error while delete the task", error);
        return {
            status: false
        }
    }

}

async function deleteTask(id) {
    // console.log("delete task id:", id);
    await deleteTaskAPI(id);
    const listResults = await listTasksAPI();
    const { status, data: { data: tasks } } = listResults;
    if (status) {
        writeDataIntoTable(tasks);
        const showSuccess = document.getElementById("backend-error");
        showSuccess.innerHTML = '';
        showSuccess.innerHTML = "Task deleted successfully";
        showSuccess.style.display = 'block';
        showSuccess.style.color = "#e74c3c";
        showSuccess.style.fontSize = "30px";
        showSuccess.style.fontWeight = "bold";
        setTimeout(() => {
            const showSuccess = document.getElementById("backend-error");
            showSuccess.style.display = "none";
        }, 1000);
    }
}

function setError(input, message) {
    const parent = input.parentElement;
    const small = parent.querySelector("small");
    small.innerText = message;
    parent.classList.add("error");
    parent.classList.remove("success");
}

function setSuccess(input) {
    const parent = input.parentElement;
    parent.classList.remove("error");
}