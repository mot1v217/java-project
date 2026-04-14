(function () {
    // ========== ТОКЕН (добавлено) ==========
    // Генерация или получение сохранённого токена
    let authToken = localStorage.getItem('authToken');
    if (!authToken) {
        authToken = 'Anonymous-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
        localStorage.setItem('authToken', authToken);
        console.log('🔐 Сгенерирован новый токен:', authToken);
    }

    // Функция для отправки запросов с токеном
    async function authFetch(url, options = {}) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = 'Bearer ' + authToken;
        return fetch(url, options);
    }
    // ========== КОНЕЦ БЛОКА ТОКЕНА ==========

    // Используем данные из Thymeleaf
    const initialState = window.initialState || {
        stiffness: 1.5,
        mass: 1.0,
        damping: 0.14,
        equilibriumX: 400,
        minX: 240,
        maxX: 560
    };

    const canvas = document.getElementById("springCanvas");
    const ctx = canvas.getContext("2d");

    // фиксированные точки пружины
    const anchorX = 140; // точка подвеса (неподвижна)
    const equilibriumX = initialState.equilibriumX; // положение равновесия груза
    const minMassX = initialState.minX;
    const maxMassX = initialState.maxX;

    // Начальное положение груза – точно в равновесии
    let massX = equilibriumX;

    // физические переменные для инерционной имитации
    let velocity = 0; // скорость груза (пиксели/кадр)
    
    // параметры (будут обновляться из слайдеров и с сервера)
    let stiffness = initialState.stiffness;
    let mass = initialState.mass;
    let damping = initialState.damping;

    // флаг перетаскивания
    let isDragging = false;

    // ---- привязка слайдеров ----
    const kSlider = document.getElementById("kSlider");
    const kSpan = document.getElementById("kValue");
    const massSlider = document.getElementById("massSlider");
    const massSpan = document.getElementById("massValue");
    const dampSlider = document.getElementById("dampSlider");
    const dampSpan = document.getElementById("dampValue");

    // Функция отправки параметров на сервер (изменено: authFetch)
    async function sendParamsToServer() {
        try {
            const response = await authFetch('/api/update-params', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    stiffness: stiffness,
                    mass: mass,
                    damping: damping,
                    displacement: massX - equilibriumX
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('Parameters updated on server', data);
                }
            }
        } catch (error) {
            console.error('Error sending params to server:', error);
        }
    }

    // Обновление слайдеров и отправка на сервер
    function updateSliders() {
        stiffness = parseFloat(kSlider.value);
        kSpan.textContent = stiffness.toFixed(2);

        mass = parseFloat(massSlider.value);
        massSpan.textContent = mass.toFixed(2);

        damping = parseFloat(dampSlider.value);
        dampSpan.textContent = damping.toFixed(2);

        // Отправляем обновленные параметры на сервер
        sendParamsToServer();
    }

    kSlider.addEventListener("input", updateSliders);
    massSlider.addEventListener("input", updateSliders);
    dampSlider.addEventListener("input", updateSliders);
    updateSliders(); // инициализация

    // ----- отображение силы и смещения -----
    const forceDisplay = document.getElementById("forceDisplay");
    const displacementDisplay = document.getElementById("displacementDisplay");

    function updateForceLabel() {
        const dx = massX - equilibriumX;
        const force = (-stiffness * dx).toFixed(1);
        forceDisplay.innerText = `сила упругости: ${force} Н`;
        displacementDisplay.innerText = `смещение: ${dx.toFixed(1)} px`;
    }

    // ----- рисование -----
    function drawSpring() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ---- фоновая пунктирная линия равновесия ----
        ctx.save();
        ctx.strokeStyle = "#4a80e5";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(anchorX, 80);
        ctx.lineTo(equilibriumX, 200);
        ctx.stroke();

        // вертикальная пунктирная метка равновесия
        ctx.beginPath();
        ctx.moveTo(equilibriumX, 150);
        ctx.lineTo(equilibriumX, 250);
        ctx.strokeStyle = "#4a80e5";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();

        // опорная точка (потолок)
        ctx.beginPath();
        ctx.fillStyle = "#2b3f5e";
        ctx.shadowColor = "#a0b0c8";
        ctx.shadowBlur = 10;
        ctx.arc(anchorX, 80, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";

        // короткая цепочка от потолка до начала пружины
        ctx.beginPath();
        ctx.strokeStyle = "#6b7f9f";
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.moveTo(anchorX, 80);
        ctx.lineTo(anchorX + 18, 120);
        ctx.stroke();

        // ---- пружина (ломаная линия) ----
        const startX = anchorX + 20;
        const startY = 122;
        const endX = massX - 18;
        const endY = 200;

        ctx.beginPath();
        ctx.moveTo(startX, startY);

        const amp = 16;
        const segments = 10;
        const stepX = (endX - startX) / segments;
        const stepY = (endY - startY) / segments;

        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const x = startX + stepX * i;
            const y = startY + stepY * i + (i % 2 === 0 ? amp : -amp) * Math.sin(t * Math.PI);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = "#3a4f70";
        ctx.lineWidth = 3.5;
        ctx.stroke();

        // ---- груз (прямоугольник) ----
        ctx.shadowBlur = 16;
        ctx.shadowColor = "#7f8fa0";
        ctx.fillStyle = "#d44c2f";
        ctx.beginPath();
        ctx.roundRect(massX - 22, 180, 44, 44, 10);
        ctx.fill();

        ctx.fillStyle = "#b1361e";
        ctx.beginPath();
        ctx.roundRect(massX - 18, 184, 36, 36, 8);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#f9e0d0";
        ctx.beginPath();
        ctx.arc(massX - 4, 194, 5, 0, 2 * Math.PI);
        ctx.globalAlpha = 0.4;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = "#2b3f5e";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(massX - 18, 200, 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#4a80e5";
        ctx.beginPath();
        ctx.arc(equilibriumX, 202, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (Math.abs(massX - equilibriumX) > 2 && !isDragging) {
            ctx.beginPath();
            const direction = Math.sign(equilibriumX - massX);
            const arrowX = massX + direction * 35;
            ctx.moveTo(massX - 8, 160);
            ctx.lineTo(arrowX, 140);
            ctx.strokeStyle = "#e05a3a";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.fillStyle = "#e05a3a";
            ctx.beginPath();
            ctx.moveTo(arrowX, 140);
            ctx.lineTo(arrowX - direction * 12, 134);
            ctx.lineTo(arrowX - direction * 12, 146);
            ctx.closePath();
            ctx.fill();
        }
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.restore();
    }

    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };

    function updatePhysics() {
        if (isDragging) return;

        const dx = massX - equilibriumX;
        const force = -stiffness * dx;
        const acceleration = force / (mass * 30);
        velocity = velocity * (1 - damping * 0.1) + acceleration;
        massX += velocity;

        if (massX < minMassX) {
            massX = minMassX;
            velocity = -velocity * 0.4;
        } else if (massX > maxMassX) {
            massX = maxMassX;
            velocity = -velocity * 0.4;
        }

        if (Math.abs(velocity) < 0.02 && Math.abs(dx) < 0.5) {
            massX = equilibriumX;
            velocity = 0;
        }
    }

    function animate() {
        if (!isDragging) {
            updatePhysics();
            updateForceLabel();
        }
        drawSpring();
        requestAnimationFrame(animate);
    }
    animate();

    // ----- МЫШЬ: перетаскивание -----
    function getMouseCoord(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        let clientX;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            e.preventDefault();
        } else {
            clientX = e.clientX;
        }
        let canvasX = (clientX - rect.left) * scaleX;
        canvasX = Math.min(maxMassX, Math.max(minMassX, canvasX));
        return canvasX;
    }

    function startDrag(e) {
        e.preventDefault();
        const canvasX = getMouseCoord(e);
        if (Math.abs(canvasX - massX) < 40) {
            isDragging = true;
            velocity = 0;
        }
    }

    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const canvasX = getMouseCoord(e);
        massX = canvasX;
        updateForceLabel();
        
        // Отправляем смещение на сервер во время перетаскивания
        sendParamsToServer();
    }

    function stopDrag(e) {
        if (isDragging) {
            isDragging = false;
            velocity = 0;
            // Финальное обновление на сервере
            sendParamsToServer();
        }
    }

    canvas.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);

    canvas.addEventListener("touchstart", startDrag, { passive: false });
    window.addEventListener("touchmove", onDrag, { passive: false });
    window.addEventListener("touchend", stopDrag);
    window.addEventListener("touchcancel", stopDrag);

    canvas.addEventListener("dragstart", (e) => e.preventDefault());

    // Периодическое обновление состояния с сервера (каждые 2 секунды) (изменено: authFetch)
    setInterval(async () => {
        try {
            const response = await authFetch('/api/state');
            if (response.ok) {
                const state = await response.json();
                // Обновляем локальные значения, если не перетаскиваем
                if (!isDragging) {
                    stiffness = state.stiffness;
                    mass = state.mass;
                    damping = state.damping;
                    
                    // Обновляем слайдеры
                    kSlider.value = stiffness;
                    kSpan.textContent = stiffness.toFixed(2);
                    massSlider.value = mass;
                    massSpan.textContent = mass.toFixed(2);
                    dampSlider.value = damping;
                    dampSpan.textContent = damping.toFixed(2);
                }
            }
        } catch (error) {
            console.error('Error fetching state from server:', error);
        }
    }, 2000);
})();