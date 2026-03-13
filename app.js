async function loadPrice() {
  try {
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur&include_24hr_change=true";
    const res = await fetch(url);
    const data = await res.json();

    const usd = data.bitcoin.usd;
    const eur = data.bitcoin.eur;
    const change = data.bitcoin.usd_24h_change ?? 0;

    const changeClass = change >= 0 ? "positive" : "negative";
    const changeText = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

    document.getElementById("priceBox").innerHTML =
      `BTC $${usd.toLocaleString()} · €${eur.toLocaleString()} · <span class="${changeClass}">${changeText}</span>`;
  } catch (error) {
    document.getElementById("priceBox").textContent = "No se pudo cargar el precio";
  }
}

async function loadNews() {
  try {
    const res = await fetch("news.json");
    const items = await res.json();

    const html = items.map(item => `
      <div class="news-item">
        <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
        <div class="news-meta">${item.source}</div>
      </div>
    `).join("");

    document.getElementById("newsList").innerHTML = html || "No hay noticias todavía";
  } catch (error) {
    document.getElementById("newsList").textContent = "No se pudieron cargar las noticias";
  }
}

loadPrice();
loadNews();
setInterval(loadPrice, 60000);
