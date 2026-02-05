const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Dimensiones definidas por ti (mitad de la pantalla)
const window_height = window.innerHeight / 2;
const window_width = window.innerWidth / 2;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "#ff8";

class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.color = color;
    this.text = text;
    this.speed = speed;

    // Dirección Aleatoria (Positiva o Negativa)
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
    context.font = "20px Arial";
    context.fillStyle = this.color;
    context.fillText(this.text, this.posX, this.posY);

    context.lineWidth = 2;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
  }

  update(context) {
    this.draw(context);

    // Rebote derecha e izquierda
    if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
      this.dx = -this.dx;
    }

    // Rebote arriba y abajo
    if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
      this.dy = -this.dy;
    }

    this.posX += this.dx;
    this.posY += this.dy;
  }
}

// Función auxiliar para generar posición segura dentro del canvas
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Función auxiliar para color aleatorio (opcional, para que se vean distintos)
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// --- Generación de Círculos (Array) ---
let circles = []; 
const maxCircles = 10;

for (let i = 0; i < maxCircles; i++) {
  // 1. Radio aleatorio entre 20 y 50
  let radius = Math.floor(Math.random() * 30 + 20); 

  // 2. Posición segura (para no quedar trabados en bordes)
  let x = randomInRange(radius, window_width - radius);
  let y = randomInRange(radius, window_height - radius);

  // 3. Velocidad aleatoria entre 1 y 4
  let speed = (Math.random() * 3) + 1;

  // 4. Texto dinámico (Tec1, Tec2...)
  let text = "Tec" + (i + 1);
  
  // 5. Color aleatorio
  let color = getRandomColor();

  // Crear y guardar en el arreglo
  circles.push(new Circle(x, y, radius, color, text, speed));
}

// Bucle de animación
let updateCircle = function () {
  requestAnimationFrame(updateCircle);
  ctx.clearRect(0, 0, window_width, window_height);

  // Recorremos el arreglo y actualizamos cada círculo
  circles.forEach(circle => {
    circle.update(ctx);
  });
};

updateCircle();