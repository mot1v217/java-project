(function () {
        const canvas = document.getElementById("springCanvas");
        const ctx = canvas.getContext("2d");

        // фиксированные точки пружины
        const anchorX = 140; // точка подвеса (неподвижна)
        const equilibriumX = 400; // положение равновесия груза (центр масс)
        // ограничения движения груза
        const minMassX = 240;
        const maxMassX = 560;

        // Начальное положение груза – точно в равновесии
        let massX = equilibriumX;

        // физические переменные для инерционной имитации
        let velocity = 0; // скорость груза (пиксели/кадр)
        // параметры (будут обновляться из слайдеров)
        let stiffness = 1.5; // k
        let mass = 1.0; // m (условная)
        let damping = 0.14; // демпфирование

        // флаг перетаскивания
        let isDragging = false;

        // ---- привязка слайдеров ----
        const kSlider = document.getElementById("kSlider");
        const kSpan = document.getElementById("kValue");
        const massSlider = document.getElementById("massSlider");
        const massSpan = document.getElementById("massValue");
        const dampSlider = document.getElementById("dampSlider");
        const dampSpan = document.getElementById("dampValue");

        function updateSliders() {
          stiffness = parseFloat(kSlider.value);
          kSpan.textContent = stiffness.toFixed(2);

          mass = parseFloat(massSlider.value);
          massSpan.textContent = mass.toFixed(2);

          damping = parseFloat(dampSlider.value);
          dampSpan.textContent = damping.toFixed(2);
        }

        kSlider.addEventListener("input", updateSliders);
        massSlider.addEventListener("input", updateSliders);
        dampSlider.addEventListener("input", updateSliders);
        updateSliders(); // инициализация

        // ----- отображение силы и смещения -----
        const forceDisplay = document.getElementById("forceDisplay");
        const displacementDisplay = document.getElementById(
          "displacementDisplay",
        );

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
          ctx.lineTo(equilibriumX, 200); // линия до равновесной позиции (просто визуальная)
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
          const endX = massX - 18; // соединяем с грузом
          const endY = 200;

          ctx.beginPath();
          ctx.moveTo(startX, startY);

          // амплитуда зигзага
          const amp = 16;
          const segments = 10;
          const stepX = (endX - startX) / segments;
          const stepY = (endY - startY) / segments;

          for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const x = startX + stepX * i;
            // зигзаг по y (прямоугольная псевдо-пружина)
            const y =
              startY +
              stepY * i +
              (i % 2 === 0 ? amp : -amp) * Math.sin(t * Math.PI);
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

          // дополнительная накладка
          ctx.fillStyle = "#b1361e";
          ctx.beginPath();
          ctx.roundRect(massX - 18, 184, 36, 36, 8);
          ctx.fill();

          // маленький блеск
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#f9e0d0";
          ctx.beginPath();
          ctx.arc(massX - 4, 194, 5, 0, 2 * Math.PI);
          ctx.globalAlpha = 0.4;
          ctx.fill();
          ctx.globalAlpha = 1.0;

          // точка крепления пружины к грузу
          ctx.fillStyle = "#2b3f5e";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(massX - 18, 200, 6, 0, 2 * Math.PI);
          ctx.fill();

          // ---- метка равновесия (пунктир) уже есть, добавим полупрозрачный круг ----
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = "#4a80e5";
          ctx.beginPath();
          ctx.arc(equilibriumX, 202, 12, 0, 2 * Math.PI);
          ctx.fill();
          ctx.globalAlpha = 1.0;

          // стрелочка силы (если не в равновесии и не перетаскиваем)
          if (Math.abs(massX - equilibriumX) > 2 && !isDragging) {
            ctx.beginPath();
            const direction = Math.sign(equilibriumX - massX); // направление к равновесию
            const arrowX = massX + direction * 35;
            ctx.moveTo(massX - 8, 160);
            ctx.lineTo(arrowX, 140);
            ctx.strokeStyle = "#e05a3a";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            // треугольник
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

        // вспомогательный метод CanvasRenderingContext2D.roundRect
        CanvasRenderingContext2D.prototype.roundRect = function (
          x,
          y,
          w,
          h,
          r,
        ) {
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

        // ---- физическое обновление (когда не перетаскиваем) ----
        function updatePhysics() {
          if (isDragging) return; // при перетаскивании физика не меняет положение

          const dx = massX - equilibriumX; // смещение от равновесия
          const force = -stiffness * dx; // закон Гука
          const acceleration = force / (mass * 30); // масса влияет (множитель для визуальной плавности)
          velocity = velocity * (1 - damping * 0.1) + acceleration; // демпфирование
          massX += velocity;

          // мягкие границы (отбой)
          if (massX < minMassX) {
            massX = minMassX;
            velocity = -velocity * 0.4;
          } else if (massX > maxMassX) {
            massX = maxMassX;
            velocity = -velocity * 0.4;
          }

          // минимизация микродрейфа
          if (Math.abs(velocity) < 0.02 && Math.abs(dx) < 0.5) {
            massX = equilibriumX;
            velocity = 0;
          }
        }

        // ---- анимация ----
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
          const scaleX = canvas.width / rect.width; // соотношение логических пикселей canvas и CSS
          let clientX;
          if (e.touches) {
            clientX = e.touches[0].clientX;
            e.preventDefault();
          } else {
            clientX = e.clientX;
          }
          // вычисляем координату внутри canvas в пикселях canvas
          let canvasX = (clientX - rect.left) * scaleX;
          // ограничим диапазоном
          canvasX = Math.min(maxMassX, Math.max(minMassX, canvasX));
          return canvasX;
        }

        function startDrag(e) {
          e.preventDefault();
          const canvasX = getMouseCoord(e);
          // проверяем попадание в область груза (упрощённо)
          if (Math.abs(canvasX - massX) < 40) {
            isDragging = true;
            velocity = 0; // сбрасываем скорость
          }
        }

        function onDrag(e) {
          if (!isDragging) return;
          e.preventDefault();
          const canvasX = getMouseCoord(e);
          massX = canvasX;
          updateForceLabel();
        }

        function stopDrag(e) {
          if (isDragging) {
            isDragging = false;
            // небольшой толчок можно добавить при отпускании, но оставим как есть — пусть скорость с нуля
            velocity = 0; // можно убрать, чтобы была инерция, но аккуратнее: обнулим для предсказуемости
          }
        }

        canvas.addEventListener("mousedown", startDrag);
        window.addEventListener("mousemove", onDrag);
        window.addEventListener("mouseup", stopDrag);

        // тач-события (мобильные)
        canvas.addEventListener("touchstart", startDrag, { passive: false });
        window.addEventListener("touchmove", onDrag, { passive: false });
        window.addEventListener("touchend", stopDrag);
        window.addEventListener("touchcancel", stopDrag);

        // предотвращаем выделение при двойном ходе
        canvas.addEventListener("dragstart", (e) => e.preventDefault());
      })();