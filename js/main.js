const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// --- REFERENCIAS A LOS CONTROLES ---
const sliderCount = document.getElementById("countRange");
const sliderWidth = document.getElementById("widthRange");
const sliderHeight = document.getElementById("heightRange");
const labelCount = document.getElementById("countVal");
const labelWidth = document.getElementById("widthVal");
const labelHeight = document.getElementById("heightVal");

// --- CONFIGURACIÓN INICIAL ---
canvas.width = window.innerWidth * 0.8;
canvas.height = 400;

sliderWidth.value = canvas.width;
sliderHeight.value = canvas.height;
labelWidth.innerText = Math.floor(canvas.width);
labelHeight.innerText = canvas.height;

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
        context.strokeStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "bold 16px Arial";
        context.fillStyle = this.color;
        
        context.fillText(this.text, this.posX, this.posY);

        context.lineWidth = 3;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        // Colisión normal con rebote
        if (this.posX + this.radius > canvas.width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.posY + this.radius > canvas.height || this.posY - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.posX += this.dx;
        this.posY += this.dy;

        this.draw(context);
    }
}

// --- FUNCIONES DE AYUDA ---
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createNewCircle(index) {
    let radius = Math.floor(Math.random() * 20 + 20);
    
    let safeMaxX = canvas.width - radius;
    let safeMaxY = canvas.height - radius;
    if (safeMaxX < radius) safeMaxX = radius;
    if (safeMaxY < radius) safeMaxY = radius;

    let x = randomInRange(radius, safeMaxX);
    let y = randomInRange(radius, safeMaxY);
    
    let speed = (Math.random() * 2) + 1;
    let text = "C" + (index + 1);
    let color = getRandomColor();

    return new Circle(x, y, radius, color, text, speed);
}

// --- NUEVA FUNCIÓN: REPOSICIONAR CÍRCULOS ---
// Si reducimos el canvas, esta función empuja los círculos hacia adentro
function repositionCircles() {
    circles.forEach(circle => {
        // Si el círculo se quedó fuera a la derecha
        if (circle.posX + circle.radius > canvas.width) {
            circle.posX = canvas.width - circle.radius;
        }
        // Si el círculo se quedó fuera abajo
        if (circle.posY + circle.radius > canvas.height) {
            circle.posY = canvas.height - circle.radius;
        }
    });
}

// --- LÓGICA PRINCIPAL ---
let circles = [];

for(let i=0; i<10; i++){
    circles.push(createNewCircle(i));
}

// --- EVENTOS (SLIDERS) ---

sliderCount.addEventListener("input", function() {
    let targetCount = parseInt(this.value);
    labelCount.innerText = targetCount;
    
    let currentCount = circles.length;
    if (targetCount > currentCount) {
        for (let i = currentCount; i < targetCount; i++) {
            circles.push(createNewCircle(i));
        }
    } else if (targetCount < currentCount) {
        circles.splice(targetCount); 
    }
});

sliderWidth.addEventListener("input", function() {
    canvas.width = parseInt(this.value);
    labelWidth.innerText = this.value;
    // Llamamos a la corrección al cambiar el ancho
    repositionCircles(); 
});

sliderHeight.addEventListener("input", function() {
    canvas.height = parseInt(this.value);
    labelHeight.innerText = this.value;
    // Llamamos a la corrección al cambiar el alto
    repositionCircles(); 
});

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    circles.forEach(circle => {
        circle.update(ctx);
    });
}

animate();