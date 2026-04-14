document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    let currentSlideIndex = 0;

    // --- 1. THE ADVANCED STEP ENGINE --- //
    
    function initSlides() {
        slides.forEach((slide, index) => {
            if (index === 0) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
            
            // Calculate how many total steps this slide has
            let maxStep = 0;
            slide.querySelectorAll('.step').forEach(el => {
                let s = parseInt(el.getAttribute('data-step') || '1');
                if (s > maxStep) maxStep = s;
                el.classList.remove('active');
            });
            
            slide.setAttribute('data-current-step', '0');
            slide.setAttribute('data-max-step', maxStep);
        });
    }

    function advance() {
        const slide = slides[currentSlideIndex];
        let currentStep = parseInt(slide.getAttribute('data-current-step'));
        let maxStep = parseInt(slide.getAttribute('data-max-step'));

        if (currentStep < maxStep) {
            // Reveal the next group of steps
            currentStep++;
            slide.setAttribute('data-current-step', currentStep);
            
            // Activate all elements belonging to this step number
            slide.querySelectorAll(`.step[data-step="${currentStep}"]`).forEach(el => {
                el.classList.add('active');
            });
        } else {
            // Out of steps, go to next slide
            if (currentSlideIndex < slides.length - 1) {
                goToSlide(currentSlideIndex + 1);
            }
        }
    }

    function retreat() {
        const slide = slides[currentSlideIndex];
        let currentStep = parseInt(slide.getAttribute('data-current-step'));

        if (currentStep > 0) {
            // Hide the current step
            slide.querySelectorAll(`.step[data-step="${currentStep}"]`).forEach(el => {
                el.classList.remove('active');
            });
            // Decrement
            currentStep--;
            slide.setAttribute('data-current-step', currentStep);
        } else {
            // At step 0, go to previous slide
            if (currentSlideIndex > 0) {
                goToSlide(currentSlideIndex - 1);
            }
        }
    }

    function goToSlide(n) {
        if (n < 0 || n >= slides.length) return;
        
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = n;
        const newSlide = slides[currentSlideIndex];
        
        // Reset steps on the new slide so they start hidden
        newSlide.setAttribute('data-current-step', '0');
        newSlide.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        
        newSlide.classList.add('active');
    }

    // Input Listeners
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
            e.preventDefault();
            advance();
        }
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            retreat();
        }
    });

    document.getElementById('deck').addEventListener('click', (e) => {
        // Don't advance if clicking a button/link
        if (e.target.tagName === 'A' || e.target.closest('a')) return;
        advance();
    });

    // --- 2. RESPONSIVE SCALE ENGINE --- //
    function resizeDeck() {
        const deck = document.getElementById('deck');
        const scaleX = window.innerWidth / 1280;
        const scaleY = window.innerHeight / 720;
        let scale = Math.min(scaleX, scaleY);
        if (scale < 1) scale = scale * 0.98;
        deck.style.transform = `scale(${scale})`;
    }
    window.addEventListener('resize', resizeDeck);

    // --- 3. SLIDE 1: AI SERVER NETWORK --- //
    function initParticles() {
        const canvas = document.getElementById('networkCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        canvas.width = 1280;
        canvas.height = 720;

        let nodesArray = [];
        const mouse = { x: null, y: null, radius: 150 };

        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            mouse.x = (event.clientX - rect.left) * scaleX;
            mouse.y = (event.clientY - rect.top) * scaleY;
        });

        canvas.addEventListener('mouseleave', function() {
            mouse.x = null;
            mouse.y = null;
        });

        class AINode {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5 + 1.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.blinkOffset = Math.random() * Math.PI * 2;
                this.blinkSpeed = Math.random() * 0.05 + 0.01;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                if (mouse.x != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        this.x -= dx / 50;
                        this.y -= dy / 50;
                    }
                }
            }
            draw() {
                let alpha = 0.2 + 0.8 * Math.abs(Math.sin(this.blinkOffset));
                ctx.fillStyle = `rgba(217, 70, 239, ${alpha})`; // Glowing pink/purple node
                ctx.shadowBlur = 15;
                ctx.shadowColor = 'rgba(217, 70, 239, 0.8)';
                
                // Draw as digital squares instead of circles
                ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
                
                ctx.shadowBlur = 0;
                this.blinkOffset += this.blinkSpeed;
            }
        }

        function buildNodes() {
            nodesArray = [];
            for (let i = 0; i < 70; i++) {
                nodesArray.push(new AINode());
            }
        }

        function animateNodes() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = 0; i < nodesArray.length; i++) {
                nodesArray[i].update();
                nodesArray[i].draw();
                
                for (let j = i; j < nodesArray.length; j++) {
                    let dx = nodesArray[i].x - nodesArray[j].x;
                    let dy = nodesArray[i].y - nodesArray[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(139, 92, 246, ${1 - distance/130})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(nodesArray[i].x, nodesArray[i].y);
                        ctx.lineTo(nodesArray[j].x, nodesArray[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateNodes);
        }

        buildNodes();
        animateNodes();
    }

    // Run Boots
    resizeDeck(); 
    initSlides();
    initParticles();
});
