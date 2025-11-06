const panels = [
  { id: "PNL-01", name: "Roof A1", rated: 420 },
  { id: "PNL-02", name: "Roof A2", rated: 420 },
  { id: "PNL-03", name: "South B1", rated: 380 },
  { id: "PNL-04", name: "South B2", rated: 380 }
];

const panelContainer = document.getElementById("panelContainer");
const alertBox = document.getElementById("alertBox");
const fleetStats = document.getElementById("fleetStats");

let charts = {};

function syntheticValue(rated) {
  let irradiance = Math.max(0, Math.sin((Date.now() / 200000)) * 1);
  return Math.max(0, (rated * irradiance) + (Math.random() * 20 - 10));
}

panels.forEach(p => {
  const div = document.createElement("div");
  div.className = "panel-card";
  div.innerHTML = `
    <div class="panel-title">${p.name} (${p.id})</div>
    <canvas id="chart-${p.id}" height="120"></canvas>
    <div class="metric" id="out-${p.id}"></div>
    <div class="metric" id="eff-${p.id}"></div>
  `;
  panelContainer.appendChild(div);

  charts[p.id] = new Chart(document.getElementById(`chart-${p.id}`), {
    type: 'line',
    data: { labels: [], datasets: [{
      label: 'Output (W)',
      data: [],
      borderWidth: 2
    }]},
    options: { scales: { y: { beginAtZero: true } } }
  });
});

function update() {
  let fleetTotal = 0;
  let effValues = [];

  panels.forEach(p => {
    const watts = syntheticValue(p.rated);
    const eff = watts / p.rated;

    fleetTotal += watts;
    effValues.push(eff);

    const chart = charts[p.id];
    chart.data.labels.push("");
    chart.data.datasets[0].data.push(watts);
    if (chart.data.labels.length > 40) chart.data.labels.shift(), chart.data.datasets[0].data.shift();
    chart.update();

    document.getElementById(`out-${p.id}`).innerText = `Output: ${watts.toFixed(1)} W`;
    document.getElementById(`eff-${p.id}`).innerText = `Efficiency: ${(eff*100).toFixed(1)}%`;
  });

  let avgEff = (effValues.reduce((a,b)=>a+b)/effValues.length)*100;
  fleetStats.innerText = `Total Output: ${fleetTotal.toFixed(1)} W | Avg Efficiency: ${avgEff.toFixed(1)}%`;

  const lowPanels = panels.filter(p => {
    const watts = charts[p.id].data.datasets[0].data.slice(-1)[0];
    return watts < p.rated*0.6;
  });

  if (lowPanels.length > 0) {
    alertBox.style.display = "block";
    alertBox.innerText = "⚠ Underperforming Panels: " + lowPanels.map(p => p.id).join(", ");
  } else {
    alertBox.style.display = "none";
  }
}

setInterval(update, 1000);
