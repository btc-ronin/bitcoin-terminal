function formatBillions(value) {
  if (!value && value !== 0) return "--";
  return "$" + (value / 1_000_000_000).toFixed(2) + "B";
}

function formatSupply(value) {
  if (!value && value !== 0) return "--";
  return (value / 1_000_000).toFixed(2) + "M BTC";
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || div.innerText || "";
}

function truncateText(text, maxLength = 160) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

function formatFlow(flow) {
  const n = Number(flow);
  if (Number.isNaN(n)) return "--";
  const cls = n >= 0 ? "positive" : "negative";
  const sign = n >= 0 ? "+" : "";
  return `<span class="${cls}">${sign}$${Math.abs(n).toFixed(1)}M</span>`;
}

async function loadPrice() {
  try {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin";
    const res = await fetch(url, {
      headers: { "accept": "application/json" }
    });

    if (!res.ok) throw new Error("Error al cargar mercado BTC");

    const data = await res.json();
    const btc = data[0];

    const usd = btc.current_price;
    const eurEstimate = usd * 0.875;
    const change = btc.price_change_percentage_24h ?? 0;
    const marketCap = btc.market_cap;
    const ath = btc.ath;
    const athChange = btc.ath_change_percentage;
    const volume = btc.total_volume;
    const supply = btc.circulating_supply;

    const changeClass = change >= 0 ? "positive" : "negative";
    const changeText = `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;

    const athClass = athChange >= 0 ? "positive" : "negative";
    const athText = `${athChange.toFixed(2)}%`;

    document.getElementById("priceBox").innerHTML =
      `BTC $${usd.toLocaleString()} · €${Math.round(eurEstimate).toLocaleString()} · <span class="${changeClass}">${changeText}</span>`;

    document.getElementById("metricPrice").innerHTML =
      `<span class="big">$${usd.toLocaleString()}</span>`;

    document.getElementById("metricChange").innerHTML =
      `<span class="big ${changeClass}">${changeText}</span>`;

    document.getElementById("metricCap").innerHTML =
      `<span class="big">${formatBillions(marketCap)}</span>`;

    document.getElementById("metricEur").innerHTML =
      `<span class="big">€${Math.round(eurEstimate).toLocaleString()}</span>`;

    document.getElementById("metricAth").innerHTML =
      `<span>$${ath.toLocaleString()}</span>`;

    document.getElementById("metricVolume").innerHTML =
      `<span>${formatBillions(volume)}</span>`;

    document.getElementById("metricSupply").innerHTML =
      `<span>${formatSupply(supply)}</span>`;

    document.getElementById("metricAthChange").innerHTML =
      `<span class="${athClass}">${athText}</span>`;

  } catch (error) {
    document.getElementById("priceBox").textContent = "No se pudo cargar el precio";

    [
      "metricPrice",
      "metricChange",
      "metricCap",
      "metricEur",
      "metricAth",
      "metricVolume",
      "metricSupply",
      "metricAthChange"
    ].forEach(id => {
      document.getElementById(id).textContent = "--";
    });
  }
}

async function loadNews() {
  try {
    const res = await fetch("news.json?t=" + Date.now());
    const items = await res.json();

    const html = items.map(item => {
      const excerpt = truncateText(
        stripHtml(item.summary || item.description || item.title),
        150
      );

      const imageHtml = item.image
        ? `
          <div class="news-image-wrap">
            <img class="news-image" src="${item.image}" alt="${item.title}">
          </div>
        `
        : "";

      return `
        <article class="news-card">
          ${imageHtml}
          <div class="news-content">
            <div class="news-top">
              <div class="news-source">
                <span class="news-source-dot"></span>
                <span>${item.source}</span>
              </div>
              <div class="news-badge">Latest</div>
            </div>

            <a class="news-link" href="${item.link}" target="_blank" rel="noopener noreferrer">
              <h3 class="news-title">${item.title}</h3>
            </a>

            <p class="news-excerpt">${excerpt}</p>

            <div class="news-footer">
              <div class="news-read">Abrir noticia</div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    document.getElementById("newsList").innerHTML = html || "No hay noticias todavía";
  } catch (error) {
    document.getElementById("newsList").textContent = "No se pudieron cargar las noticias";
  }
}

async function loadEtfs() {
  try {
    const res = await fetch("etf.json?t=" + Date.now());
    const data = await res.json();

    document.getElementById("etfTotalFlow").innerHTML = formatFlow(data.total_flow_musd);
    document.getElementById("etfDate").textContent = data.date || "--";

    const html = (data.funds || []).map(fund => {
      return `
        <div class="etf-row">
          <div class="etf-ticker">${fund.ticker}</div>
          <div class="etf-name">${fund.name}</div>
          <div class="etf-flow">${formatFlow(fund.flow_musd)}</div>
        </div>
      `;
    }).join("");

    document.getElementById("etfList").innerHTML = html || "No se pudieron cargar los ETF flows";
  } catch (error) {
    document.getElementById("etfTotalFlow").textContent = "--";
    document.getElementById("etfDate").textContent = "--";
    document.getElementById("etfList").textContent = "No se pudieron cargar los ETF flows";
  }
}

loadPrice();
loadNews();
loadEtfs();

setInterval(loadPrice, 60000);
setInterval(loadNews, 300000);
setInterval(loadEtfs, 600000);
