const canvas = document.getElementById('reactorCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.75;


function getRandomInt(min, max) {
  return Math.random() * (max - min) + min;
}
function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


class Particles{
  constructor(x, y, color, type = 'uranium'){
    this.color ='#A9A9A9';
    this.type=type;
    this.Radius = 7;
    this.spacing = 33;  
    this.squareSize = 28; 
    this.allCircles = []; 
  }

  draw() {
    const numColumns = 40;
    const numRows = Math.ceil(canvas.height / this.spacing); 

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numColumns; col++) {
        const x = col * this.spacing + this.Radius;
        const y = row * this.spacing + this.Radius;

        this.allCircles.push({ x, y });

        
        ctx.fillStyle = '#ADD8E6';
        ctx.fillRect(
          x - this.squareSize / 2,
          y - this.squareSize / 2,
          this.squareSize,
          this.squareSize
        );

        
        ctx.beginPath();
        ctx.arc(x, y, this.Radius, 0, Math.PI * 2);
        ctx.fillStyle = 'grey'; 
        ctx.fill();
        ctx.closePath();
      }
    }
  }
  colorRandomCircles(numberOfCircles) {
    const shuffled = this.allCircles.sort(() => Math.random() - 0.5);
    const selectedCircles = shuffled.slice(0, numberOfCircles);

    selectedCircles.forEach((circle) => {
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, this.Radius, 0, Math.PI * 2);
      ctx.fillStyle = 'blue';
      ctx.fill();
      ctx.closePath();
    });
  }
}

const particles = new Particles();
particles.draw();
particles.colorRandomCircles(150);

addEventListener('resize', function () {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.8;
  particles.draw();
  particles.colorRandomCircles(150);
});