const fetch = require("node-fetch");
const NodeCache = require("node-cache");
const {
  cronCache,
  getNextHour,
  MARKET_CAP_RANK_24H
} = require("../cron/marketCap24h");

const apiCache = new NodeCache({
  ttl: 30,
  deleteOnExpire: true
});

const COINGECKO_STATS = "coingecko_stats";

const getCoingeckoStats = async () => {
  let coingeckoStats = apiCache.get(COINGECKO_STATS);
  let marketCapRank24h = cronCache.get(`${MARKET_CAP_RANK_24H}-${getNextHour}`);

  if (!coingeckoStats) {
    try {
      const resBtcPrice = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum&vs_currencies=usd&include_24hr_change=true"
      );

      const {
        bitcoin: { usd: usdBtcCurrentPrice, usd_24h_change: usdBtc24hChange },
        ethereum: { usd: usdEthCurrentPrice, usd_24h_change: usdEth24hChange }
      } = await resBtcPrice.json();

      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true"
      );

      const {
        market_cap_rank: marketCapRank,
        market_data: {
          market_cap_change_percentage_24h: marketCapChangePercentage24h,
          market_cap: { usd: usdMarketCap },
          total_volume: { usd: usd24hVolume },
          current_price: { usd: usdCurrentPrice },
          price_change_percentage_24h: usd24hChange,
          total_supply: totalSupply,
          circulating_supply: circulatingSupply
        }
      } = await res.json();

      coingeckoStats = {
        marketCapRank,
        marketCapRank24h,
        usdMarketCap,
        marketCapChangePercentage24h,
        usd24hVolume,
        totalSupply,
        circulatingSupply,
        usdCurrentPrice,
        usd24hChange,
        usdBtcCurrentPrice,
        usdBtc24hChange,
        usdEthCurrentPrice,
        usdEth24hChange
      };

      apiCache.set(COINGECKO_STATS, coingeckoStats);
    } catch (e) {}
  }

  return { coingeckoStats };
};

module.exports = {
  getCoingeckoStats,
  COINGECKO_STATS,
  MARKET_CAP_RANK_24H
};
