const form = document.getElementById("form");
const name = document.getElementById("name");
const phoneNumber = document.getElementById("phonenumber");
const password = document.getElementById("password");
const cpassword = document.getElementById("cpassword");
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    validate();
    const data = {
        name: name.value,
        phoneNumber: phoneNumber.value,
        password: password.value,
        confirmPassword: cpassword.value
    }
    const resultsRegister = await POSTJSON(data);
    const { status } = resultsRegister;
    if (status) {
        window.location = './login.html';
    }
});

async function POSTJSON(data) {
    try {
        const response = await fetch('http://localhost:3000/register', {
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
        showError.innerHTML = message+" register with another number";
        return {
            data: null,
            status: false,
            error: message
        }
    }
}
function validate() {
    const nameValue = name.value.trim();
    const phoneNumberValue = phoneNumber.value.trim();
    const passwordValue = password.value.trim();
    const cpasswordValue = cpassword.value.trim();

    if (nameValue === '') {
        setError(name, 'name value cannot be empty');
    }
    else if (nameValue.length < 3) {
        setError(name, 'name length minimum 3 characters');
    }
    else {
        setSuccess(name);
    }

    if (phoneNumberValue === '') {
        setError(phoneNumber, 'phonenumber value cannot be empty');
    }
    else if (phoneNumberValue.length < 10) {
        setError(phoneNumber, 'phoneNumber must have 10 numbers');
    }
    else {
        setSuccess(phoneNumber);
    }

    if (passwordValue === '') {
        setError(password, 'password cannot be empty');
    }
    else if (passwordValue.length < 6) {
        setError(password, 'password value must have 6 characters');
    }
    else {
        setSuccess(password);
    }

    if (cpasswordValue === '') {
        setError(cpassword, 'Confirm Password cannot be empty');
    }
    else if (cpasswordValue != passwordValue) {
        setError(cpassword, 'confirm passsword match with above password');
    }
    else {
        setSuccess(cpassword);
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