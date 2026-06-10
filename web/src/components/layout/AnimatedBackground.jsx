'use client'

import { useEffect, useRef } from 'react'

const SQUARE_SIZE = 30;
const TRAIL_DECAY = 0.8;

const PATTERN_OFFSETS = [
    [[1,0,1], [0,1,0], [1,0,1]],
    [[1,0,0], [1,0,0], [1,0,0]],
    [[1,1,1], [0,0,0], [0,0,0]],
    [[0,1,0], [1,0,1], [0,1,0]],
    [[1,0,0], [0,0,0], [0,0,0]],
    [[1,0,0], [0,1,0], [0,0,1]],
    [[0,0,1], [0,1,0], [1,0,0]],
    [[0,1,0], [1,1,1], [0,1,0]],
].map(pattern => {
    const offsets = [];
    const pixelSize = SQUARE_SIZE / pattern.length;
    for (let r = 0; r < pattern.length; r++) {
        for (let c = 0; c < pattern[r].length; c++) {
            if (pattern[r][c] === 1) {
                offsets.push({ x: c * pixelSize, y: r * pixelSize, size: pixelSize });
            }
        }
    }
    return offsets;
});

export default function AnimatedBackground() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d'); 

        let width, height;
        let cols, rows;
        let cells = [];
        let mouse = { x: -1000, y: -1000 };
        let animationFrameId;

        class Cell {
            constructor(c, r, now) {
                this.x = c * SQUARE_SIZE;
                this.y = r * SQUARE_SIZE;
                this.hoverIntensity = 0;
                this.patternIdx = Math.floor(Math.random() * PATTERN_OFFSETS.length);
                
                this.phase = Math.random() * Math.PI * 2;
                this.speed = 0.001 + Math.random() * 0.02;
                this.color = `hsl(0, 0%, 90%)`;
                
                this.setNextPatternChangeTime(now);
            }

            setNextPatternChangeTime(now) {
                const MIN_INTERVAL = 5000;
                const MAX_INTERVAL = 60000;
                this.nextPatternChangeTime = now + MIN_INTERVAL + Math.random() * (MAX_INTERVAL - MIN_INTERVAL);
            }

            update(now) {
                const isHovered = mouse.x >= this.x && mouse.x < this.x + SQUARE_SIZE &&
                                  mouse.y >= this.y && mouse.y < this.y + SQUARE_SIZE;

                if (isHovered) {
                    this.hoverIntensity = 1;
                } else if (this.hoverIntensity > 0.01) {
                    this.hoverIntensity *= TRAIL_DECAY;
                } else {
                    this.hoverIntensity = 0;
                }

                this.phase += this.speed;
                const randomOscillation = (Math.sin(this.phase) + 1) / 2;
                
                const baseLightness = 90 + (randomOscillation * 5);
                const targetLightness = 60;

                const currentLightness = baseLightness + ((targetLightness - baseLightness) * this.hoverIntensity);
                this.color = `hsl(0, 0%, ${currentLightness}%)`;

                if (now > this.nextPatternChangeTime) {
                    this.patternIdx = Math.floor(Math.random() * PATTERN_OFFSETS.length);
                    this.setNextPatternChangeTime(now);
                }
            }

            draw(ctx) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                
                const offsets = PATTERN_OFFSETS[this.patternIdx];
                for (let i = 0; i < offsets.length; i++) {
                    const o = offsets[i];
                    ctx.rect(this.x + o.x, this.y + o.y, o.size, o.size);
                }
                
                ctx.fill();
            }
        }

        function initGrid() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            cols = Math.ceil(width / SQUARE_SIZE) + 1;
            rows = Math.ceil(height / SQUARE_SIZE) + 1;

            const now = Date.now();
            cells = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    cells.push(new Cell(c, r, now));
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            const now = Date.now();

            for (let i = 0; i < cells.length; i++) {
                cells[i].update(now);
                cells[i].draw(ctx);
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        const handlePointerMove = (e) => {
            const newX = e.clientX;
            const newY = e.clientY;

            if (mouse.x !== -1000) {
                const dx = newX - mouse.x;
                const dy = newY - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const steps = Math.max(1, Math.ceil(distance / (SQUARE_SIZE / 2)));

                for (let i = 0; i < steps; i++) {
                    const interpX = mouse.x + dx * (i / steps);
                    const interpY = mouse.y + dy * (i / steps);
                    
                    const col = Math.floor(interpX / SQUARE_SIZE);
                    const row = Math.floor(interpY / SQUARE_SIZE);
                    
                    if (col >= 0 && col < cols && row >= 0 && row < rows) {
                        const cellIndex = row * cols + col;
                        if (cells[cellIndex]) {
                            cells[cellIndex].hoverIntensity = 1;
                        }
                    }
                }
            }

            mouse.x = newX;
            mouse.y = newY;
        };

        const handlePointerOut = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        window.addEventListener('resize', initGrid);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerout', handlePointerOut);

        initGrid();
        animate();

        return () => {
            window.removeEventListener('resize', initGrid);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerout', handlePointerOut);
            cancelAnimationFrame(animationFrameId);
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-screen h-screen -z-10 pointer-events-none mask-[linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
        />
    )
}