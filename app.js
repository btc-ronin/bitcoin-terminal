function formatBillions(value) {
  if (!value && value !== 0) return "--";
  return "$" + (value / 1_000_000_000).toFixed(2) + "B";
}

async function loadPrice() {
  try {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin";
    const res = await fetch(url, {
      headers: {
        "accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error("Error al cargar datos de mercado");
    }

    const data = await res.json();
    const btc = data[0];

    const usd = btc.current_price;
    const eurEstimate = usd * 0.875;
    const change = btc.price_change_percentage_24h ?? 0;
    const marketCap = btc.market_cap;

    const changeClass = change >= 0 ? "positive" : "negative";
    const changeText = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

    document.getElementById("priceBox").innerHTML =
      `BTC $${usd.toLocaleString()} · €${Math.round(eurEstimate).toLocaleString()} · <span class="${changeClass}">${changeText}</span>`;

    document.getElementById("metricPrice").textContent =
      "$" + usd.toLocaleString();

    document.getElementById("metricChange").innerHTML =
      `<span class="${changeClass}">${changeText}</span>`;

    document.getElementById("metricCap").textContent =
      formatBillions(marketCap);

    document.getElementById("metricEur").textContent =
      "€" + Math.round(eurEstimate).toLocaleString();

  } catch (error) {
    document.getElementById("priceBox").textContent = "No se pudo cargar el precio";
    document.getElementById("metricPrice").textContent = "--";
    document.getElementById("metricChange").textContent = "--";
    document.getElementById("metricCap").textContent = "--";
    document.getElementById("metricEur").textContent = "--";
  }
}

async function loadNews() {
  try {
    const res = await fetch("news.json?t=" + Date.now());
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
setInterval(loadNews, 300000);
