// Select the PLAY button from the intro screen
let button = document.querySelector("button");

// Select the intro screen container
let introBack = document.querySelector(".introBack");

// Select the main game container
let main = document.querySelector(".main");
let body = document.querySelector("body");

// Set initial bird coordinates (16% from left, 1/3 from top)
let birdX = window.innerWidth*0.16;
let birdY = window.innerHeight*0.1;

// Select the bird element
let bird = document.querySelector(".bird");

// Select headings in the intro/game over screen
let headingA = document.querySelector(".A");
let headingB = document.querySelector(".B");

// Initial score
let score = 0;

// Bird dimensions
let birdHeight = 24;
let birdWidth = 34;

// Flag to track if game is over
let gameOver = false;

// Game state variable to control when input is allowed
// Possible values: "wait" (intro or game over), "playing" (game active)
let gameState = "wait";

// Gravity pulls the bird down each frame
let gravity = 0.4;


let pipes = [];             // Array to hold all pipe objects
const pipeWidth = 32;       // Width of each pipe
const pipeGap = 150;        // Vertical space for the bird to pass
const pipeSpawnInterval = 3000; // Time (ms) between new pipes
let pipeSpawner;            // Variable to store setInterval reference


//preloading audio
let buttonClick = new Audio("click.mp3");
let introBgm = new Audio("birds.mp3");
let bgm = new Audio("BIRDO.mp3");
let flap = new Audio("flap.mp3");
let die = new Audio("die.mp3");
let hit = new Audio("hit.mp3");

introBgm.loop = true;
bgm.loop = true;

// Main game loop using requestAnimationFrame
let lastPipeTime = 0;
let lastFrameTime = 0;


//bgm
document.addEventListener("click",()=>{
    introBgm.play();
    introBgm.currentTime = 0;
}, {once: true});

//velocity of bird
let birdV = 0;







// Function to update bird's position on the screen
function updateBird(){
    bird.style.left = birdX + "px"; // horizontal position
    bird.style.top = birdY + "px";  // vertical position
}          




function gameLoop(timestamp) {
    if (gameOver === true){  // Stop loop if game is over
        return;
    }

    if (!lastFrameTime) {          // ADD THIS BLOCK
        lastFrameTime = timestamp;
    }


    if(!lastPipeTime) {
        lastPipeTime = timestamp;
        requestAnimationFrame(gameLoop);
        return;
    }
    if(timestamp - lastPipeTime >= pipeSpawnInterval){
        spawnPipe();
        lastPipeTime = timestamp;
    }

    // calculate delta time (seconds since last frame)
    let delta = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp; // update for next frame

    // Bird falls down gradually due to gravity
    birdV += gravity*delta*10;
    birdY += birdV;

    // Ceiling collision: prevent bird from going above the screen
    if(birdY <= 0){
        birdY = 0;
        die.play();
        die.currentTime = 0;
        gameEnd();
    } 
    // Floor collision: if bird hits bottom, game over
    else if (birdY >= window.innerHeight - birdHeight){
        birdY = window.innerHeight - birdHeight;
        die.play();
        die.currentTime = 0;
        gameEnd();
    }
    updateBird();
    updatePipe(delta);
    requestAnimationFrame(gameLoop); // Continue the loop
}

// Add a global keydown listener for spacebar
window.addEventListener("keydown",(e)=>{
    if(e.key !== " " ){  // Only respond to spacebar
        return;
    }
    if (gameState !== "playing"){ // Only allow jump when game is active
        return;
    }

    e.preventDefault(); // Prevent default scrolling behavior
    birdV = -3;        // Move bird up by 40 pixels (jump)
    flap.play();
    flap.currentTime = 0;
    updateBird();       // Reflect new position visually
})
window.addEventListener("click",(e)=>{
    if (gameState !== "playing"){ // Only allow jump when game is active
        return;
    }

    e.preventDefault(); // Prevent default scrolling behavior
    birdV = -3;        // Move bird up by 40 pixels (jump)
    flap.play();
    flap.currentTime = 0;
    updateBird();       // Reflect new position visually
})


//gameover function
function gameEnd(){
    gameOver = true;     // Stop the game loop
    gameState = "wait";  // Disable further input

    // Update intro/game over screen text
    headingA.textContent = "Game Over";
    headingA.style.color = "#ff0000";
    headingB.textContent = `Your score was ${score}`;

    // Change button text for replay
    button.textContent = "PLAY AGAIN";

    // Show intro/game over screen
    introBack.classList.remove("hide");
    introBack.classList.add("show");

    // Hide main game container
    main.style.display = "none";

    //bgm
    introBgm.play();
    introBgm.currentTime = 0;

    bgm.pause();
    bgm.currentTime = 0;

    body.classList.add("end");

    button.blur() //removes the brower focus
}



function spawnPipe() {
    let topHeight = Math.random()*(window.innerHeight*0.6) + 50;
    let bottomY = topHeight + pipeGap;


    let pipe = {
        x: window.innerWidth,
        topHeight: topHeight,
        bottomY: bottomY,
        passed: false,
        topEl: null,
        bottomEl: null,
    }


    let topPipe = document.createElement("div");
    let bottomPipe = document.createElement("div");
    topPipe.classList.add("pipe", "topPipe");
    bottomPipe.classList.add("pipe", "bottomPipe");


    topPipe.style.width = `${pipeWidth}px`;
    bottomPipe.style.width = `${pipeWidth}px`;
    topPipe.style.left = `${pipe.x}px`;
    bottomPipe.style.left = `${pipe.x}px`;
    topPipe.style.top = "0px";
    bottomPipe.style.top = `${bottomY}px`;
    topPipe.style.height = `${topHeight}px`;
    bottomPipe.style.height = `${window.innerHeight - bottomY}px`;


    main.appendChild(topPipe);
    main.appendChild(bottomPipe);

    pipe.topEl = topPipe;
    pipe.bottomEl = bottomPipe;

    pipes.push(pipe);

}



function startSpawn() {
    spawnPipe();
    pipeSpawner = setInterval(spawnPipe, pipeSpawnInterval);
}



function stopSpawn() {
    clearInterval(pipeSpawner);
}


function updatePipe(delta) {
    let speed = 100;
    for (let j = pipes.length - 1; j >= 0; j--) {
        let pipe = pipes[j];
        pipe.x -= speed * delta;
        pipe.topEl.style.left = `${pipe.x}px`;
        pipe.bottomEl.style.left = `${pipe.x}px`;

        // ---- COLLISION DETECTION ----
        let birdLeft = birdX;
        let birdRight = birdX + birdWidth;
        let birdTop = birdY;
        let birdBottom = birdY + birdHeight;

        let pipeLeft = pipe.x;
        let pipeRight = pipe.x + pipeWidth;

        // Horizontal overlap
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Vertical collision (top OR bottom pipe)
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                hit.play();
                hit.currentTime = 0;
                gameEnd();
                return;
            }
        }
        // ---- SCORE ----
        if (!pipe.passed && pipe.x + pipeWidth < birdX) {
        pipe.passed = true;
        score++;
        }

        // Remove pipe if it goes off screen
        if ((pipe.x + pipeWidth) < 0) {
            pipe.topEl.remove();
            pipe.bottomEl.remove();
            pipes.splice(j, 1);
        }
    }
}




function clearPipes() {
    for(let pipe of pipes){
        if(pipe.topEl) pipe.topEl.remove();
        if(pipe.bottomEl) pipe.bottomEl.remove();
    }
    pipes = [];
}




// Click event for the PLAY button
button.addEventListener("click",()=>{

    buttonClick.play();
    introBgm.pause();
    introBgm.currentTime = 0;

    bgm.play();
    bgm.currentTime = 0;
    if (gameState === "playing"){    // Prevent starting multiple loops if button clicked repeatedly
        return;
    }
    body.classList.remove("end");
    introBack.classList.remove("show");
    introBack.classList.add("hide"); // Start intro hide animation
    

    // Delay to allow intro animation to finish
    setTimeout(()=>{

        main.style.display = "block"; // Show main game container

        // Set initial bird coordinates again (16% from left, 1/3 from top)
        birdX = window.innerWidth*0.16;
        birdY = window.innerHeight*0.1;

        updateBird()                  // Initialize bird's position visually

        clearPipes();
        lastPipeTime = 0;
        score = 0;
        lastFrameTime = 0;   // reset delta timing
        birdV = 0;           // reset velocity

        gameOver = false;
        gameState="playing";          // Set game as active
        requestAnimationFrame(gameLoop); // Start the game loop

    },2000); // End of setTimeout (delay for intro animation)
});






