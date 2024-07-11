//const locaMongolUrl = 'http://localhost:3000';
const publicMongoUrl = 'https://to-do-list-back-end-qjw5.onrender.com';
const form = document.getElementById("form");
const name = document.getElementById("name");
const phoneNumber = document.getElementById("phonenumber");
const password = document.getElementById("password");
const cpassword = document.getElementById("cpassword");
window.addEventListener('DOMContentLoaded', async () => {
    const tokenValue = localStorage.getItem("token");
    if (tokenValue) {
        window.location = './tasks.html';
    }
});
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nameValue = name.value.trim();
    const phoneNumberValue = phoneNumber.value.trim();
    const passwordValue = password.value.trim();
    const cpasswordValue = cpassword.value.trim();
    let error = false;

    if (nameValue === '') {
        setError(name, 'name value cannot be empty');
        error = true;
    }
    else if (nameValue.length < 3) {
        setError(name, 'name length minimum 3 characters');
        error = true;
    }
    else {
        setSuccess(name);
    }

    if (phoneNumberValue === '') {
        setError(phoneNumber, 'phonenumber value cannot be empty');
        error = true;
    }
    else if (phoneNumberValue.length < 10) {
        setError(phoneNumber, 'phoneNumber must have 10 numbers');
        error = true;
    }
    else {
        setSuccess(phoneNumber);
    }

    if (passwordValue === '') {
        setError(password, 'password cannot be empty');
        error = true;
    }
    else if (passwordValue.length < 6) {
        setError(password, 'password value must have 6 characters');
        error = true;
    }
    else {
        setSuccess(password);
    }

    if (cpasswordValue === '') {
        setError(cpassword, 'Confirm Password cannot be empty');
        error = true;
    }
    else if (cpasswordValue != passwordValue) {
        setError(cpassword, 'confirm passsword match with above password');
        error = true;
    }
    else {
        setSuccess(cpassword);
    }
    if (error) {
        return false;
    }
    const data = {
        name: name.value,
        phoneNumber: phoneNumber.value,
        password: password.value,
        confirmPassword: cpassword.value
    }
    const showError = document.getElementById("backend-error");
    showError.innerHTML = "Your registration is successful";
    showError.style.color = "#2ecc71";
    showError.style.fontSize = "30px";
    showError.style.fontWeight = "bold";
    const resultsRegister = await POSTJSON(data);
    const { status } = resultsRegister;
    setTimeout(() => {
        if (status) {
            window.location = './login.html';
        }
    }, 1000);

});

async function POSTJSON(data) {
    try {
        const response = await fetch(`${publicMongoUrl}/register`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        console.log(response);
        if (!response.ok) {
            throw new Error(JSON.stringify(await response.json()));
        }
        const results = await response.json();
        console.log("sucess", results);
        return {
            status: true,
            data: results

        }
    } catch (error) {
        console.log("error", error);
        const errorMessage = JSON.parse(error.message);
        const { message } = errorMessage;
        const showError = document.getElementById("backend-error");
        showError.innerHTML = message + " register with another number";
        showError.style.color = "red";
        return {
            data: null,
            status: false,
            error: message
        }
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
    parent.classList.add("success");
    parent.classList.remove("error");
}