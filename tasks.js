const form = document.getElementById("form");
const inputTodo = document.getElementById("input-todo");
const inputDate = document.getElementById("input-date");
window.addEventListener('DOMContentLoaded', async () => {
    const result2 = await listTaskAPI();
    const { status: listTaskStatus, data: { data: tasks } } = result2;
    if (listTaskStatus) {
        writeDataIntoTable(tasks);
    }
});

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
    await createTaskAPI(data);
    const listResults = await listTaskAPI();
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
    console.log(tasks.length);
    const body = document.getElementById('tbody');
    body.innerHTML = ' ';
    const showTasks = document.getElementById("tasks-no");
    showTasks.innerHTML = tasks.length + " tasks";
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const { text, dueDate, status, _id: id } = task;
        if (!status) {
            const tr = `
                <tr>
                <td>
                    <div class="field-information">
                        <input type="radio" id="radio" class="radio" onclick="changeStatus('${id}')">
                        <p>${text}</p>
                        <label class="date" id="date">${dueDate}</label>
                        <i class="material-icons delete-icon" class="delete-row" onclick="deleteTask(this,'${id}')">delete</i>
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
                    <input type="radio" checked id="radio" class="radio" onclick="changeStatus('${id}')">
                    <p>${text}</p>
                    <label class="date" id="date">${dueDate}</label>
                    <i class="material-icons delete-icon" class="delete-row" onclick="deleteTask(this,'${id}')">delete</i>
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
        const response = await fetch("http://localhost:3000/tasks", {
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

async function listTaskAPI() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:3000/tasks", {
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
        const response = await fetch(`http://localhost:3000/tasks/${id}`, {
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

async function changeStatus(id) {
    console.log(id);
    const data = {
        status: true
    }
    await updateTaskAPI(data, id);
    const listResults = listTaskAPI();
    const { status, data: tasks } = listResults;
    if (status) {
        writeDataIntoTable(tasks);
    }
}

async function deleteTaskAPI(id) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/tasks/${id}`, {
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

async function deleteTask(icon, id) {
    console.log("delete task id:", id);
    const deleteResults = await deleteTaskAPI(id);
    const { status } = deleteResults;
    if (status) {
        var row = icon.parentNode.parentNode; // Get the parent <tr> element
        row.parentNode.removeChild(row); // Remove the row from the table
        const tasksLength = await listTaskAPI();
        const { data: tasks } = tasksLength;
        const showTasks = document.getElementById("tasks-no");
        showTasks.innerHTML = tasks.length + " tasks";
    }
    else {
        alert('task is no deleted');
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