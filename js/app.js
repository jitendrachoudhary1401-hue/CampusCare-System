const button = document.getElementById('testButton');
const message = document.getElementById("message");

button.addEventListener('click', function ()  {
    message.textContent = "Javascript is working!";
});