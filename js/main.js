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
const btnCollision = document.getElementById("btnCollision"); 
const btnReload = document.getElementById("btnReload"); 

// --- ESTADO GLOBAL ---
let isCollisionEnabled = false; // Por defecto apagado

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
        // La masa es proporcional al radio (para física realista)
        this.mass = radius; 
        
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

// --- FÍSICA DE COLISIONES ---
function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

/**
 * Resuelve la colisión elástica entre dos partículas
 * Usa rotación de coordenadas para simplificar la física 2D a 1D
 */
function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.dx - otherParticle.dx;
    const yVelocityDiff = particle.dy - otherParticle.dy;

    const xDist = otherParticle.posX - particle.posX;
    const yDist = otherParticle.posY - particle.posY;

    // Prevenir superposición accidental (evita que se peguen)
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        const angle = -Math.atan2(otherParticle.posY - particle.posY, otherParticle.posX - particle.posX);

        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocidad antes de la ecuación (rotada)
        const u1 = rotate(particle.dx, particle.dy, angle);
        const u2 = rotate(otherParticle.dx, otherParticle.dy, angle);

        // Ecuación de colisión elástica unidimensional
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m1 / (m1 + m2), y: u2.y };

        // Velocidad final (rotada de vuelta)
        const vFinal1 = rotate(v1.x, v1.y, -angle);
        const vFinal2 = rotate(v2.x, v2.y, -angle);

        // Intercambiar velocidades
        particle.dx = vFinal1.x;
        particle.dy = vFinal1.y;
        otherParticle.dx = vFinal2.x;
        otherParticle.dy = vFinal2.y;
    }
}

// Función auxiliar para rotar ejes
function rotate(dx, dy, angle) {
    return {
        x: dx * Math.cos(angle) - dy * Math.sin(angle),
        y: dx * Math.sin(angle) + dy * Math.cos(angle)
    };
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
    
    // Intentar no generar uno encima de otro al inicio
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

// NUEVO: Toggle de Colisiones
btnCollision.addEventListener("click", function() {
    isCollisionEnabled = !isCollisionEnabled;
    
    // Actualizar estilo visual del botón
    if (isCollisionEnabled) {
        this.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg> Colisión: ON
        `;
        this.classList.add("active");
    } else {
        this.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12h8"></path>
            </svg> Colisión: OFF
        `;
        this.classList.remove("active");
    }
});
// EVENTO: Recargar Página (Refresh)
btnReload.addEventListener("click", function() {
    window.location.reload(); // Esto recarga la página web completa
});

// --- ANIMACIÓN ---
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Detectar colisiones entre círculos (solo si está activo)
    if (isCollisionEnabled) {
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                if (getDistance(circles[i].posX, circles[i].posY, circles[j].posX, circles[j].posY) < circles[i].radius + circles[j].radius) {
                    resolveCollision(circles[i], circles[j]);
                }
            }
        }
    }

    // 2. Actualizar posición normal
    circles.forEach(c => c.update(ctx));
}

animate();