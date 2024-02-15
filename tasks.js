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
    // console.log(tasks.length);
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
                        <input type="radio" id="radio" class="radio" onclick="changeStatus('${id}','no')">
                        <p>${text}</p>
                        <label class="date" id="date">${dueDate}</label>
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
                  <label class="date" id="date"><s>${dueDate}</s></label>
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

async function listTasksAPI() {
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

async function changeStatus(id, isTicked) {
    console.log(id);
    const data = {
        status: isTicked == "no" ? true: false
    }
    await updateTaskAPI(data, id);
    const listResults = await listTasksAPI();
    const { status, data: { data: tasks } } = listResults;
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

async function deleteTask(id) {
    // console.log("delete task id:", id);
    await deleteTaskAPI(id);
    const listResults = await listTasksAPI();
    const { status, data: { data: tasks } } = listResults;
    if (status) {
        writeDataIntoTable(tasks);
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