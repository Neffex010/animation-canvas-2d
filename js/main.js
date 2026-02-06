const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// --- REFERENCIAS DOM ---
const sliderCount = document.getElementById("countRange");
const sliderWidth = document.getElementById("widthRange");
const sliderHeight = document.getElementById("heightRange");
const labelCount = document.getElementById("countVal");
const labelWidth = document.getElementById("widthVal");
const labelHeight = document.getElementById("heightVal");
const btnReset = document.getElementById("btnReset");
const btnReload = document.getElementById("btnReload");

// --- CONFIGURACIÓN TAMAÑO ---
function getDefaultSize() {
    return { width: window.innerWidth * 0.75, height: window.innerHeight * 0.75 };
}
let defaults = getDefaultSize();
canvas.width = defaults.width;
canvas.height = defaults.height;

sliderWidth.max = window.innerWidth; sliderWidth.value = defaults.width;
sliderHeight.max = window.innerHeight; sliderHeight.value = defaults.height;
labelWidth.innerText = Math.floor(defaults.width); labelHeight.innerText = Math.floor(defaults.height);

// --- COLORES ---
const niceColors = [
    "#F44336", "#E91E63", "#9C27B0", "#673AB7", 
    "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", 
    "#009688", "#4CAF50", "#8BC34A", "#FF9800"
];

// --- CLASE CIRCLE ---
class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;
        
        let directionX = Math.random() < 0.5 ? -1 : 1;
        let directionY = Math.random() < 0.5 ? -1 : 1;
        this.dx = directionX * this.speed;
        this.dy = directionY * this.speed;
    }

    draw(context) {
        context.beginPath();
        context.globalAlpha = 0.2; context.fillStyle = this.color;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
        
        context.globalAlpha = 1.0; context.strokeStyle = this.color;
        context.lineWidth = 3; context.stroke();

        context.fillStyle = "#333"; context.textAlign = "center";
        context.textBaseline = "middle"; context.font = "bold 14px 'Poppins', sans-serif";
        context.fillText(this.text, this.posX, this.posY);
        context.closePath();
    }

    update(context) {
        // Colisiones con paredes
        if (this.posX + this.radius > canvas.width || this.posX - this.radius < 0) this.dx = -this.dx;
        if (this.posY + this.radius > canvas.height || this.posY - this.radius < 0) this.dy = -this.dy;
        
        this.posX += this.dx;
        this.posY += this.dy;
        this.draw(context);
    }
}

// --- LOGICA PRINCIPAL ---
let circles = [];

function randomInRange(min, max) { return Math.random() * (max - min) + min; }
function getRandomColor() { return niceColors[Math.floor(Math.random() * niceColors.length)]; }

function createNewCircle(index) {
    let radius = Math.floor(Math.random() * 20 + 20);
    let safeMaxX = canvas.width - radius;
    let safeMaxY = canvas.height - radius;
    if(safeMaxX < radius) safeMaxX = radius;
    if(safeMaxY < radius) safeMaxY = radius;
    
    let x = randomInRange(radius, safeMaxX);
    let y = randomInRange(radius, safeMaxY);
    let speed = (Math.random() * 2) + 0.8;
    
    return new Circle(x, y, radius, getRandomColor(), "Cir " + (index+1), speed);
}

for(let i=0; i<10; i++) circles.push(createNewCircle(i));

function repositionCircles() {
    circles.forEach(circle => {
        if (circle.posX + circle.radius > canvas.width) circle.posX = canvas.width - circle.radius;
        if (circle.posY + circle.radius > canvas.height) circle.posY = canvas.height - circle.radius;
    });
}

// --- EVENTOS ---
sliderCount.addEventListener("input", function() {
    let target = parseInt(this.value);
    labelCount.innerText = target;
    if (target > circles.length) {
        for (let i = circles.length; i < target; i++) circles.push(createNewCircle(i));
    } else { circles.splice(target); }
});

sliderWidth.addEventListener("input", function() {
    canvas.width = parseInt(this.value); labelWidth.innerText = this.value; repositionCircles();
});
sliderHeight.addEventListener("input", function() {
    canvas.height = parseInt(this.value); labelHeight.innerText = this.value; repositionCircles();
});

btnReset.addEventListener("click", function() {
    let defs = getDefaultSize();
    canvas.width = defs.width; canvas.height = defs.height;
    sliderWidth.value = defs.width; sliderHeight.value = defs.height;
    labelWidth.innerText = Math.floor(defs.width); labelHeight.innerText = Math.floor(defs.height);
    repositionCircles();
});

btnReload.addEventListener("click", function() {
    window.location.reload();
});

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles.forEach(c => c.update(ctx));
}

animate();