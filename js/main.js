const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Volvemos a las dimensiones originales (Pantalla completa)
const window_height = window.innerHeight/2;
const window_width = window.innerWidth/2;

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

    // --- CAMBIO: Dirección Aleatoria ---
    // Generamos un número al azar: si es menor a 0.5, la dirección es negativa (-1), si no, positiva (1).
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
    context.fillStyle = this.color; // Color del texto igual al borde
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

// Función auxiliar para que no nazcan pegados al borde (mantiene la corrección anterior)
function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

// --- Generación de Círculos ---

// Círculo 1
let r1 = Math.floor(Math.random() * 50 + 30);
let x1 = randomInRange(r1, window_width - r1);
let y1 = randomInRange(r1, window_height - r1);
let miCirculo = new Circle(x1, y1, r1, "blue", "Tec1", 5);

// Círculo 2
let r2 = Math.floor(Math.random() * 50 + 30);
let x2 = randomInRange(r2, window_width - r2);
let y2 = randomInRange(r2, window_height - r2);
let miCirculo2 = new Circle(x2, y2, r2, "red", "Tec2", 2);

// Bucle de animación
let updateCircle = function () {
  requestAnimationFrame(updateCircle);
  ctx.clearRect(0, 0, window_width, window_height);
  miCirculo.update(ctx);
  miCirculo2.update(ctx);
};

updateCircle();