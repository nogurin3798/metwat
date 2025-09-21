
function calculate() {
  const age = parseInt(document.getElementById("age").value || 0);
  const weight = parseFloat(document.getElementById("weight").value || 0);
  const distance = parseFloat(document.getElementById("distance").value || 0);
  const timeMin = parseFloat(document.getElementById("time").value || 0);
  const calories = parseFloat(document.getElementById("calories").value || 0);
  const avgHR = parseFloat(document.getElementById("avgHR").value || 0);

  const timeH = timeMin / 60;
  const maxHR = 208 - 0.7 * age;
  const restingHR = 60;
  const HRR = maxHR - restingHR;
  const zoneLow = Math.round(restingHR + 0.4 * HRR);
  const zoneHigh = Math.round(restingHR + 0.6 * HRR);

  const met = (calories / (weight * timeH)).toFixed(2);
  const wat = ((met * weight / 6) / 3.5).toFixed(2);
  const vo2 = (met * 3.5).toFixed(1);

  const weeklyMets = (met * timeH).toFixed(1);

  document.getElementById("maxHR").textContent = Math.round(maxHR);
  document.getElementById("met").textContent = met;
  document.getElementById("wat").textContent = wat;
  document.getElementById("vo2").textContent = vo2;
  document.getElementById("zone").textContent = `${zoneLow}–${zoneHigh}`;
  document.getElementById("weeklyMets").textContent = weeklyMets;
}
