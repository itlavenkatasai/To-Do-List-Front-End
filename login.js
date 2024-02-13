const form = document.getElementById("form");
const phoneNumber = document.getElementById("phonenumber");
const password = document.getElementById("password");

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    validate();
    const data = {
        phoneNumber: phoneNumber.value,
        password: password.value
    }
    const loginResult = await POSTJSON(data);
    console.log(loginResult);
    const { data: { data: { token } } } = loginResult;
    console.log(token);
    localStorage.setItem("token", token);
    const { status } = loginResult;
    if (status) {
        window.location = './tasks.html';
    }
});

async function POSTJSON(data) {
    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "Application/json"
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
        const showError = document.getElementById("showError");
        showError.innerHTML = message;

        return {
            status: false,
            data: null
        }
    }
}

function validate() {
    const phoneNumberValue = phoneNumber.value.trim();
    const passwordValue = password.value.trim();

    if (phoneNumberValue === '') {
        setError(phoneNumber, 'phone number value cannot be empty');
    }
    else if (phoneNumberValue.length < 10) {
        setError(phoneNumber, 'phone number must have 10 characters');
    }
    else {
        setSuccess(phoneNumber);
    }
    if (passwordValue === '') {
        setError(password, 'password value cannot be empty');
    }
    else if (passwordValue.length < 6) {
        setError(password, 'password value must have minimum six letters');
    }
    else {
        setSuccess(password);
    }
}

function setError(input, message) {
    const parent = input.parentElement;
    const small = parent.querySelector('small');
    small.innerText = message;
    parent.classList.add("error");
    parent.classList.remove("success");
}
function setSuccess(input) {
    const parent = input.parentElement;
    parent.classList.add("success");
    parent.classList.remove("error");
}