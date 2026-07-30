  const canvas = document.getElementById('main-canvas');
  const ctx = canvas.getContext('2d');
  const area = document.getElementById('canvas-area');

  // State
  let img = null;
  let zoomLevel = 1, panX = 0, panY = 0;
  let isPanning = false, panStart = null;
  let mode = 'calibrate';
  let calibPts = [], calibMpp = null;
  let runwayEnd = null;
  let obstacles = [], obsCount = 0;
  let hoverPt = null;

  // Colors
  const C = {
    blue: '#378ADD', blueD: '#0C447C',
    green: '#1D9E75', greenD: '#085041',
    amber: '#EF9F27', amberD: '#633806',
    red: '#D85A30', redD: '#712B13',
    white: '#ffffff',
  };


// ── File loading ──────────────────────────────────────────────
function loadChart(e) {
    const file = e.target.files[0];
    if (!file) return;
    loadImageFile(file);
}

function loadImageFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
    const image = new Image();
    image.onload = () => {
        img = image;
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        fitView();
        //enableUI();
        document.getElementById('to-dir').disabled = false;
        document.getElementById('btn-confirm-dir').disabled = false;
        document.getElementById('btn-confirm-dir').classList.add('flash-bg');
        document.getElementById('icao-input').classList.add('flash-bg');
        document.getElementById('rwy-input').classList.add('flash-bg');
        document.getElementById('eff-date-input').classList.add('flash-bg');

        document.getElementById('chart-info').style.display = 'block';
        document.getElementById('chart-info').textContent =
        `${file.name} · ${image.naturalWidth}×${image.naturalHeight}px`;
        setMode('calibrate');
        setHint('Step 1: Click the start of a known distance on the scale bar');
        draw();
    };
    image.src = ev.target.result;
    };
    reader.readAsDataURL(file);
    disableUpload();
}

function disableUpload() {
    document.getElementById('btn-upload').classList.remove('flash-bg');
    document.getElementById('btn-upload').disabled = true
}

function enableUI() {
    ['btn-calib', 'btn-rwy', 'btn-obs', 'btn-export', 'to-dir', 'btn-confirm-dir'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = false;
    });
}

function disableUI() {
    ['btn-calib', 'btn-rwy', 'btn-obs', 'btn-export', 'to-dir', 'btn-confirm-dir'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = true;
    });
}

// ── View transform ────────────────────────────────────────────
function fitView() {
    if (!img) return;
    /*if (mode === 'runway') {
    setHint('Click the end of the runway to continue');
    undoLast();
    }
    if (mode === 'obstacle') {
    undoLast();
    if (obstacles.length == 0) {
        setMode('runway');
    }
    }*/
    const W = area.clientWidth, H = area.clientHeight;
    zoomLevel = Math.min(W / img.naturalWidth, H / img.naturalHeight) * 0.95;
    panX = (W - img.naturalWidth * zoomLevel) / 2;
    panY = (H - img.naturalHeight * zoomLevel) / 2;
    applyTransform();
}

function zoom(factor) {
    const W = area.clientWidth, H = area.clientHeight;
    const cx = W / 2, cy = H / 2;
    panX = cx - (cx - panX) * factor;
    panY = cy - (cy - panY) * factor;
    zoomLevel *= factor;
    applyTransform();
}

function applyTransform() {
    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    draw();
}

// Canvas coords (image pixels) from screen coords
function screenToCanvas(sx, sy) {
    return { x: (sx - panX) / zoomLevel, y: (sy - panY) / zoomLevel };
}

// ── Finalize takeoff direction ─────────────────────────────────
function confirmDirection() {
    const select = document.getElementById('to-dir');
    const dir = select.value;
    if (dir === 'left') {
    // Default orientation is left takeoff, so no change needed
    setHint('Takeoff direction confirmed as LEFT. Proceed to calibration.');
    } else {
    setHint('Takeoff direction confirmed as RIGHT. Proceed to calibration.');
    }
    document.getElementById('to-dir').disabled = true;
    document.getElementById('btn-confirm-dir').disabled = true;
    document.getElementById('btn-confirm-dir').classList.remove('flash-bg');

    document.getElementById('btn-calib').disabled = false;
    document.getElementById('btn-calib').classList.add('flash-bg');
}

// ── Mouse events ──────────────────────────────────────────────
area.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const rect = area.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    panX = sx - (sx - panX) * factor;
    panY = sy - (sy - panY) * factor;
    zoomLevel *= factor;
    applyTransform();
}, { passive: false });

area.addEventListener('mousedown', e => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
    isPanning = true;
    panStart = { x: e.clientX - panX, y: e.clientY - panY };
    canvas.classList.add('grabbing');
    e.preventDefault();
    }
});

area.addEventListener('mousemove', e => {
    const rect = area.getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    hoverPt = screenToCanvas(sx, sy);

    if (isPanning) {
    panX = e.clientX - panStart.x;
    panY = e.clientY - panStart.y;
    applyTransform();
    return;
    }

    // Update coord bar
    if (img) {
    document.getElementById('coord-bar').style.display = 'block';
    document.getElementById('coord-bar').textContent =
        `x: ${Math.round(hoverPt.x)}  y: ${Math.round(hoverPt.y)}`;
    }

    // Live measurement preview
    /*if (runwayEnd && mode === 'obstacle' && calibMpp) {
    const m = measure(hoverPt);
    document.getElementById('s-long').textContent = m.long + ' m';
    document.getElementById('s-lat').textContent  = m.lat  + ' m';
    document.getElementById('s-dist').textContent = m.dist + ' m';
    } */

    // Live calibration line
    if (mode === 'calibrate' && calibPts.length === 1) draw();
});

area.addEventListener('mouseup', e => {
    if (isPanning) { isPanning = false; canvas.classList.remove('grabbing'); }
});

area.addEventListener('mouseleave', () => { hoverPt = null; draw(); });

area.addEventListener('click', e => {
    if (isPanning || e.altKey) return;
    const rect = area.getBoundingClientRect();
    const pt = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    handleClick(pt);
});

function handleClick(pt) {
    if (!img) return;

    if (pt.x < 0 || pt.y < 0 || pt.x > img.naturalWidth || pt.y > img.naturalHeight) {
    setHint('Click is outside the chart area');
    return;
    }

    if (mode === 'calibrate') {
    calibPts.push(pt);
    if (calibPts.length === 2) finishCalibration();
    else setHint('Now click the END of the known distance');
    draw(); return;
    }

    if (mode === 'runway') {
    runwayEnd = pt;
    document.getElementById('btn-obs').disabled = false;
    setHint('Runway end set. Switch to "Place obstacle" and click each obstacle.');
    document.getElementById('step1-num').className = 'step-num done';
    draw(); setMode('obstacle'); return;
    }

    if (mode === 'obstacle') {
    if (!runwayEnd) { setHint('Set the runway end first'); return; }
    obsCount++;
    //const { x: x_new, y: y_new } = checkRunwayDirection(pt);
    //x_new = pt.x
    //y_new = pt.y
    //console.log("New obstacle at: ", x_new, y_new);
    obstacles.push({ id: obsCount, uid: 'u' + Date.now(), x: pt.x, y: pt.y, elev: '' });
    //document.getElementById('s-count').textContent = obstacles.length;
    document.getElementById('btn-export').disabled = false;
    document.getElementById('downloadBtn').disabled = false;
    updateTable();
    setHint(`Obstacle ${obsCount} placed — continue clicking or export when done`);
    draw();
    }
}

// ── Calibration ───────────────────────────────────────────────
function finishCalibration() {
    const dist = parseFloat(document.getElementById('calib-dist').value) || 1000;
    const unit = document.getElementById('calib-unit').value;
    const distM = unit === 'ft' ? dist * 0.3048 : unit === 'nm' ? dist * 1852 : dist;
    const dx = calibPts[1].x - calibPts[0].x;
    const dy = calibPts[1].y - calibPts[0].y;
    const px = Math.sqrt(dx * dx + dy * dy);
    calibMpp = distM / px;

    //const badge = document.getElementById('scale-badge');
    //badge.style.display = 'block';
    //badge.textContent = `Scale: ${calibMpp.toFixed(4)} m/px`;

    //const res = document.getElementById('calib-result');
    //res.style.display = 'block';
    //res.textContent = `✓ ${dist} ${unit} = ${Math.round(px)} px → ${calibMpp.toFixed(4)} m/px`;

    document.getElementById('btn-rwy').disabled = false;
    document.getElementById('btn-calib').disabled = true;
    document.getElementById('calib-unit').disabled = true;
    document.getElementById('calib-dist').disabled = true;
    setHint('Calibrated. Now click "Set runway end" and click the runway threshold.');
    updateTable();
    document.getElementById('btn-calib').classList.remove('flash-bg');
    setMode('runway');
    document.getElementById('btn-rwy').classList.add('flash-bg');
}

function setMode(m) {
    mode = m;
    if (m === 'calibrate') { calibPts = []; document.getElementById('calib-result').style.display = 'none'; calibMpp = null; document.getElementById('scale-badge').style.display = 'none'; }
    ['btn-calib', 'btn-rwy', 'btn-obs'].forEach(id => document.getElementById(id).classList.remove('active'));
    const map = { calibrate: 'btn-calib', runway: 'btn-rwy', obstacle: 'btn-obs' };
    document.getElementById(map[m]).classList.add('active');

    const hints = {
    calibrate: 'Click the START of a known distance on the scale bar',
    runway: 'Click the runway threshold — the end of runway closest to approach',
    obstacle: runwayEnd ? 'Click to place each obstacle on the chart' : 'Set runway end first'
    };
    setHint(hints[m]);
    draw();
}

// ── Verify Lateral and DER ────────────────────────────────────
function checkRunwayDirection(x, y) {
    if (!runwayEnd || !calibMpp) return false;
    direction = document.getElementById('to-dir').value

    if (direction == "left") {
    x = x * -1;
    y = y * -1;
    }
    return [x, y];
}

// ── Measurement ───────────────────────────────────────────────
function measure(pt) {
    if (!runwayEnd || !calibMpp) return { long: 0, lat: 0, dist: 0 };

    //const { x: x_new, y: y_new } = checkRunwayDirection(pt);
    const x = pt.x - runwayEnd.x;
    const y = pt.y - runwayEnd.y;

    const [dxPx, dyPx] = checkRunwayDirection(x, y);

    //console.log("dxPx, dyPx: ", dxPx, dyPx);

    return {
    long: Math.round(dxPx * calibMpp),
    lat: Math.round(dyPx * calibMpp),
    dist: Math.round(Math.sqrt(dxPx * dxPx + dyPx * dyPx) * calibMpp)
    };
}

// ── Drawing ───────────────────────────────────────────────────
function draw() {
    if (!img) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const showDims = document.getElementById('tog-dims').checked;
    const showLabels = document.getElementById('tog-labels').checked;
    const showIds = document.getElementById('tog-ids').checked;

    // Calibration points & line
    if (calibPts.length > 0 && calibPts.length <= 2) {
    calibPts.forEach((p, i) => {
        drawMarker(p.x, p.y, C.amber, i === 0 ? 'A' : 'B', 6);
    });
    if (calibPts.length === 2) {
        drawDashedLine(calibPts[0].x, calibPts[0].y, calibPts[1].x, calibPts[1].y, C.amber, 1.5);
        const mx = (calibPts[0].x + calibPts[1].x) / 2;
        const my = (calibPts[0].y + calibPts[1].y) / 2 - 8;
        drawLabel(mx, my, `${document.getElementById('calib-dist').value} ${document.getElementById('calib-unit').value}`, C.amber);
    }
    if (calibPts.length === 1 && hoverPt && mode === 'calibrate') {
        drawDashedLine(calibPts[0].x, calibPts[0].y, hoverPt.x, hoverPt.y, C.amber, 0.8);
    }
    }

    // Runway end
    if (runwayEnd) {
    const { x, y } = runwayEnd;
    ctx.strokeStyle = C.blue; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x, y + 14); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = C.blue; ctx.fill();
    drawLabel(x + 12, y - 10, 'RWY end', C.blue);
    document.getElementById('btn-rwy').classList.remove('flash-bg');
    }

    // Obstacles
    obstacles.forEach(o => {
    if (showDims && runwayEnd) {
        drawDashedLine(runwayEnd.x, runwayEnd.y, o.x, runwayEnd.y, C.green, 0.8);
        drawDashedLine(o.x, runwayEnd.y, o.x, o.y, C.green, 0.8);
        if (showLabels && calibMpp) {
        const m = measure(o);
        drawLabel((runwayEnd.x + o.x) / 2, runwayEnd.y - 9, m.long + 'm', C.greenD);
        drawLabel(o.x + 5, (runwayEnd.y + o.y) / 2, m.lat + 'm', C.greenD);
        }
    }
    const r = 7;
    ctx.strokeStyle = C.red; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(o.x - r, o.y - r); ctx.lineTo(o.x + r, o.y + r); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(o.x + r, o.y - r); ctx.lineTo(o.x - r, o.y + r); ctx.stroke();
    if (showIds) drawBadge(o.x + 9, o.y - 9, String(o.id), C.red);
    if (o.elev) drawLabel(o.x + 9, o.y + 12, o.elev, C.redD);
    });

    // Hover preview line
    if (hoverPt && mode === 'obstacle' && runwayEnd) {
    ctx.strokeStyle = 'rgba(215,90,48,0.3)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(hoverPt.x, hoverPt.y, 9, 0, Math.PI * 2); ctx.stroke();
    if (showDims) {
        drawDashedLine(runwayEnd.x, runwayEnd.y, hoverPt.x, runwayEnd.y, 'rgba(29,158,117,0.35)', 0.6);
        drawDashedLine(hoverPt.x, runwayEnd.y, hoverPt.x, hoverPt.y, 'rgba(29,158,117,0.35)', 0.6);
    }
    }
}

function drawMarker(x, y, color, label, r) {
    ctx.strokeStyle = color; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = color; ctx.font = 'bold 11px system-ui';
    ctx.fillText(label, x + r + 3, y + 4);
}

function drawDashedLine(x1, y1, x2, y2, color, width) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
}

function drawLabel(x, y, text, color) {
    ctx.font = '11px system-ui';
    const w = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(x - 2, y - 11, w + 4, 14);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
}

function drawBadge(x, y, text, color) {
    ctx.font = 'bold 10px system-ui';
    const w = ctx.measureText(text).width + 8;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x, y - 10, w, 14, 4); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.fillText(text, x + 4, y + 1);
}

// ── Table ─────────────────────────────────────────────────────
function updateTable() {
    const tbody = document.getElementById('obs-tbody');
    const empty = document.getElementById('obs-empty');

    //console.log("tbody: ", tbody);
    //console.log("empty: ", empty);

    tbody.innerHTML = '';
    empty.style.display = obstacles.length ? 'none' : 'block';

    document.getElementById("elev-table-label").innerText = "Elev (" + document.getElementById("elev-label").value + ")";
    //console.log(document.getElementById("elev-table-label").innerText);

    console.log("obstacles: ", obstacles)

    //console.log("calibMpp", calibMpp)
    //console.log("runwayEnd", runwayEnd)

    obstacles.forEach(o => {
    const m = calibMpp && runwayEnd ? measure(o) : { long: '—', lat: '—', dist: '—' };
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td><input type="text" class="obs-id" value="${o.id}" oninput="obstacles.find(x=>x.uid==='${o.uid}').id=this.value;draw()"></span></td>
    <td>${m.long}${typeof m.long === 'number' ? '' : ''}</td>
    <td>${m.lat}${typeof m.lat === 'number' ? '' : ''}</td>
    <td><input type="text" value="${o.elev}" placeholder="Enter elev" oninput="obstacles.find(x=>x.uid==='${o.uid}').elev=this.value;draw()"></td>
    <td><button class="icon-btn" title="Delete" onclick="deleteObs('${o.uid}')" style="font-size:12px" aria-label="Delete">×</button></td>`;
    tbody.appendChild(tr);
    });
    console.log("tbody", tbody)
    //document.getElementById('s-count').textContent = obstacles.length;
}

function deleteObs(uid) {
    obstacles = obstacles.filter(o => o.uid !== uid);
    updateTable(); draw(); obsCount--;
}

function undoLast() {
    if (mode === 'calibrate' && calibPts.length > 0) {
    calibPts.pop(); draw(); return;
    }
    // Added obsCount-- to ensure IDs remain sequential after undoing, but this means IDs can be reused if you undo and add again. 
    // A more robust solution would be to generate unique IDs that aren't tied to count, but for simplicity we'll keep it as is.
    if (obstacles.length > 0) { obsCount--; obstacles.pop(); updateTable(); draw(); }
    else if (runwayEnd) { runwayEnd = null; draw(); }
}

// ── Export Data ───────────────────────────────────────────────
function exportData() {
    elev_unit = document.getElementById('elev-label').value;
    const icao = document.getElementById('icao-input').value.trim().toUpperCase();
    const rwy = document.getElementById('rwy-input').value.trim().toUpperCase();
    const eff_date_raw = document.getElementById('eff-date-input').value.trim();

    //console.log("eff_date_raw: ", eff_date_raw);

    const dateStr = new Date(eff_date_raw);

    //console.log("dateStr: ", dateStr);
    
    if (icao === '' || rwy === '') {
        alert("Please enter both ICAO code and runway number.");
        return;
    }

    if (isNaN(dateStr.getTime())) {
        alert("Please enter a valid effective date in the format YYYY-MM-DD.");
        return;
    }

    const eff_date = dateStr.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
    }).toUpperCase();
    
    //console.log("eff_date: ", eff_date);

    if (elev_unit == "m") {
        elev_ft = []
        obstacles.forEach(o => {
            o.elev_ft = (parseFloat(o.elev) / 0.3048).toFixed(2);
        });
        let csv = 'obstacle_id,DER_m,lateral_m,name,elevation_ft,elevation_' + elev_unit + '\n';
        obstacles.forEach(o => {
            const m = calibMpp && runwayEnd ? measure(o) : { long: '', lat: '', dist: '' };
            csv += `${o.id},${m.long},${m.lat},"Obst ${String(o.id)}, AOC RWY${rwy}, ${eff_date}","${o.elev_ft}","${o.elev}"\n`;
        });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));

        document.body.appendChild(a);
        a.download = `${icao}_RWY${rwy}_aoc_obstacles.csv`; a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);

        let txt = 'DER_m\tlateral_m\tname\televation_ft\n';
        obstacles.forEach(o => {
            const m = calibMpp && runwayEnd ? measure(o) : { long: '', lat: '', dist: '' };
            txt += `${m.long}\t${m.lat}\tObst ${String(o.id)}, AOC RWY${rwy}, ${eff_date}\t${o.elev_ft}\n`;
        });

        a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));

        document.body.appendChild(a);
        a.download = `${icao} RWY${rwy} - WEF ${eff_date}.txt`; a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);        
    }
    if (elev_unit == "ft") {
        let csv = 'obstacle_id,DER_m,lateral_m,name,elevation_' + elev_unit + '\n';
        obstacles.forEach(o => {
            const m = calibMpp && runwayEnd ? measure(o) : { long: '', lat: '', dist: '' };
            csv += `${o.id},${m.long},${m.lat},"Obst ${String(o.id)}, AOC RWY${rwy}, ${eff_date}","${o.elev}"\n`;
        });
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        
        document.body.appendChild(a);
        a.download = `${icao}_RWY${rwy}_aoc_obstacles.csv`; a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        
        let txt = 'DER_m\tlateral_m\tname\televation_ft\n';
        obstacles.forEach(o => {
            const m = calibMpp && runwayEnd ? measure(o) : { long: '', lat: '', dist: '' };
            txt += `${m.long}\t${m.lat}\tObst ${String(o.id)}, AOC RWY${rwy}, ${eff_date}\t${o.elev}\n`;
        });

        a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));

        console.log('txt: ', txt);

        document.body.appendChild(a);
        a.download = `${icao} RWY${rwy} - WEF ${eff_date}.txt`; a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
    }
}

// ── Export Image ──────────────────────────────────────────────
function exportCanvas() {

    document.getElementById('tog-dims').checked = false;
    document.getElementById('tog-labels').checked = false;
    document.getElementById('tog-ids').checked = true;

    canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    const icao = document.getElementById('icao-input').value.trim().toUpperCase(); 
    const rwy = document.getElementById('rwy-input').value.trim().toUpperCase();

    link.download = `${icao}_RWY${rwy}_aoc_obstacles.png`;
    link.href = url;
    link.click();

    URL.revokeObjectURL(url);
    }, 'image/png');
}

// ── Reset ─────────────────────────────────────────────────────
function resetAll() {
    if (!confirm('Reset all measurements? The chart image will be kept.')) return;
    calibPts = []; calibMpp = null; runwayEnd = null;
    obstacles = []; obsCount = 0;

    document.getElementById('calib-result').style.display = 'none';
    document.getElementById('scale-badge').style.display = 'none';
    document.getElementById('coord-bar').style.display = 'none';
    document.getElementById('obs-tbody').style.display = '';
    document.getElementById('obs-empty').style.display = 'No obstacles placed yet';

    document.getElementById('to-dir').disabled = false;
    document.getElementById('btn-confirm-dir').disabled = false;
    document.getElementById('btn-rwy').disabled = true;
    document.getElementById('btn-obs').disabled = true;
    document.getElementById('btn-export').disabled = true;
    document.getElementById('downloadBtn').disabled = true;
    document.getElementById('calib-dist').disabled = false
    document.getElementById('calib-unit').disabled = false

    document.getElementById('btn-confirm-dir').classList.add('flash-bg');
    document.getElementById('btn-rwy').classList.remove('flash-bg');
    document.getElementById('btn-obs').classList.remove('flash-bg');
    document.getElementById('btn-calib').classList.remove('flash-bg');

    document.getElementById('btn-calib').disabled = true
    document.getElementById('btn-upload').disabled = false
    document.getElementById('calib-dist').value = '1000'
    document.getElementById('calib-unit').value = 'm'
    document.getElementById('rwy-input').value = ''
    document.getElementById('elev-label').value = 'ft'
    document.getElementById('to-dir').value = 'left'
    document.getElementById('eff-date-input').value = ''

    document.getElementById('icao-input').classList.add('flash-bg');
    document.getElementById('rwy-input').classList.add('flash-bg');
    document.getElementById('eff-date-input').classList.add('flash-bg');

    document.getElementById('tog-dims').checked = true;
    document.getElementById('tog-labels').checked = true;
    document.getElementById('tog-ids').checked = true;

    //['s-long','s-lat','s-dist'].forEach(id => document.getElementById(id).textContent = '—');
    //document.getElementById('s-count').textContent = '0';
    //enableUpload()
    updateTable();
    //disableUI();
    //setMode('runway');
    if (img) { setMode('calibrate'); draw(); }
    else setHint('Upload a chart to begin');
}

// ── Hint ──────────────────────────────────────────────────────
function setHint(msg) { document.getElementById('hint-bar').textContent = msg; }

const icao = document.getElementById('icao-input');
const rwy = document.getElementById('rwy-input');
const effDate = document.getElementById('eff-date-input');

icao.addEventListener('input', () => {
    icao.classList.remove('flash-bg');
});

rwy.addEventListener('input', () => {
    rwy.classList.remove('flash-bg');
});

effDate.addEventListener('input', () => {
    effDate.classList.remove('flash-bg');
});

// Init
window.addEventListener('resize', () => { if (img) fitView(); });

window.addEventListener('pagehide', function () {
    navigator.sendBeacon('/shutdown');
});