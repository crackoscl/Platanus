const fetch = require("node-fetch");

const GetUrl = "https://www.buda.com/api/v2/markets";
const time24hrs = Math.floor(new Date().getTime() - 24 * 60 * 60 * 1000);
const oldEntries = [];
const nowEntries = [];

// time24hrs >= item.trades.last_timestamp ? oldEntries.push({ "Old": item.trades }) : nowEntries.push({ "Now": item.trades })

const getMarktes = () => {
  fetch(GetUrl)
    .then((response) => response.json())
    .then((data) => {
      data.markets.forEach((item) => {
        fetch(GetUrl + "/" + item.id + "/trades?limit=100")
          .then((res) => res.json())
          .then((dataTrades) => {
            if (
              dataTrades ||
              dataTrades.trades.entries !== undefined ||
              dataTrades.trades.entries !== 0 ||
              dataTrades.trades.entries.length !== 0 ||
              data.trades.entries !== null
            ) {
              GetEntries(dataTrades);
            }
          })
          .catch(function (error) {
            console.log("Trades Limit 100", error);
          });
      });
    })
    .catch(function (error) {
      console.log("GetMarktes", error);
    });
};

function GetEntries(data) {
  if (time24hrs > data.trades.last_timestamp) {
    oldEntries.push({ Old: data.trades });
    DataFinal();
  } else if (data.trades.last_timestamp !== nowEntries.Now.last_timestamp) {
    nowEntries.push({ Now: data.trades });
    NewData();
  }
}

function NewData() {
  nowEntries.forEach((item) => {
    fetch(
      GetUrl +
        "/" +
        item.Now.market_id +
        "/trades?timestamp=" +
        item.Now.last_timestamp +
        "?limit=100"
    )
      .then((response) => response.json())
      .then((datatime) => {
        if (
          datatime ||
          datatime.trades.entries !== undefined ||
          datatime.trades.entries !== 0 ||
          datatime.trades.entries.length !== 0 ||
          datatime.trades.entries !== null
        ) {
          GetEntries(datatime);
        }
      })
      .catch(function (error) {
        console.log("Timestamp", error);
      });
  });
}

function DataFinal() {
  const FinalList = [];

  oldEntries.forEach((item) => {
    FinalList.push({
      Id: item.Old.market_id,
      Entries: item.Old.entries,
    });
  });

  nowEntries.forEach((item) => {
    FinalList.push({
      Id: item.Now.market_id,
      Entries: item.Now.entries,
    });
  });

  const entriesFilter = FinalList.map((item) => {
    const FilterEntries = item.Entries.filter((entry) => time24hrs <= entry[0]);
    return {
      Id: item.Id,
      Entries: FilterEntries,
    };
  });

  const MaxValue = entriesFilter.map((item) => {
    if (item.Entries.length > 0) {
      const MaxValue = Math.max(item.Entries[0][2]);
      return {
        Mercado: item.Id,
        CPL: MaxValue,
      };
    }
  });

  const unicos = MaxValue.filter((item) => item.Mercado);

  console.log(unicos);
}

getMarktes();
