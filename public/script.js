////////////////////////////////////////////
//////////// SIGNATURE SCRIPT //////////////
////////////////////////////////////////////

// Defining variables
let canvas = document.getElementById("signatureCanvas");
let context = canvas.getContext("2d");
let isDrawing = false; // defines when the pen draws or not
let hidden = document.getElementById("signatureField");

// Style for pen
context.lineJoin = "round";
context.lineCap = "round";
context.lineWidth = 1;
context.strokeStyle = "#000";

// Events in canvas
canvas.addEventListener("mousedown", e => {
    isDrawing = true;
    let x = e.clientX;
    let y = e.clientY;
    context.moveTo(x, y);
    console.log(e);
    context.beginPath();

    canvas.addEventListener("mousemove", e => {
        if (isDrawing) {
            let x = e.clientX - canvas.offsetLeft; // offsetLeft is value of the screen edge to the left of the canvas
            let y = e.clientY - canvas.offsetTop; // offsetLeft is value of the screen edge to the top of the canvas
            context.lineTo(x, y);
            context.stroke();
        }
    });
});
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    var dataURL = canvas.toDataURL();
    hidden.value = dataURL;
    console.log(" DATA URL IS ", dataURL);
});
canvas.addEventListener("mouseout", () => {
    isDrawing = false;
});

/// clear canvas function
$("#canvasClear").click(function clear() {
    canvas.width = canvas.width;
});
