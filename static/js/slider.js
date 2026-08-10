const slider = document.getElementById('scale');
const output = document.getElementById('output');
const ticksContainer = document.getElementById('ticks-container');

// Dynamic tick generator setup
const min = parseInt(slider.min);
const max = parseInt(slider.max);
const step = 0.5; // Places a custom tick mark label every 25 units

for (let i = min; i <= max; i += step) {
    const tick = document.createElement('div');
    tick.classList.add('tick');
    tick.setAttribute('data-value', i.toFixed(1));
    ticksContainer.appendChild(tick);
}

// Live updating listener event triggers during the active dragging process
slider.addEventListener('input', (e) => {
    output.textContent = Number(e.target.value).toFixed(2);
});