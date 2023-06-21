import { useState, useRef } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Panel } from "primereact/panel";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Slider } from "primereact/slider";
import { Checkbox } from "primereact/checkbox";
import { Accordion, AccordionTab } from "primereact/accordion";
import Plot from "react-plotly.js";

function Hero() {
  const [range, setRange] = useState(365);
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [allPortfolioData, setAllPortfolioData] = useState(null);
  const [rows, setRows] = useState(null);
  const [rowsAll, setRowsAll] = useState(null);
  const [includeAllAssets, setIncludeAllAssets] = useState(false);
  const toast = useRef(null);

  const load = async () => {
    if (!selectedCurrencies || selectedCurrencies.length < 2) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Please select at least 2 assets.",
        life: 3000,
      });
      return;
    }

    setLoading(true);
    toast.current.show({
      severity: "info",
      summary: "Info",
      detail: "Calculating optimised portfolio. This may take a while.",
      life: 3000,
    });
    const selected = selectedCurrencies.map((c) => c.code);
    setGraphData(null);

    await fetchGraph();
    setLoading(false);
    toast.current.show({
      severity: "success",
      summary: "Success",
      detail: "Your portfolio was successfully optimised.",
      life: 3000,
    }); //TODO: change that it only shows when the graph is loaded
  };

  const fetchGraph = async () => {
    try {
      const selected = selectedCurrencies.map((c) => c.code);
      const days = range;
      const response = await fetch(
        `http://127.0.0.1:5000/portfolio?assets=${selected
          .join(",")
          ?.toString()}&days=${days}&includeAllAssets=${includeAllAssets}`
      );
      const responseData = await response.json();
      setGraphData(JSON.parse(responseData.efficientFrontier));
      setPortfolioData(JSON.parse(responseData.portfolio));
      setAllPortfolioData(JSON.parse(responseData.allPortfolios));
      const rows = Object.values(JSON.parse(responseData.portfolio));
      const rowsAll = Object.values(JSON.parse(responseData.allPortfolios));
      setRows(rows);
      setRowsAll(rowsAll);
    } catch (error) {
      console.error("Error fetching graph:", error);
    }
  };

  const handleRangeChange = (e) => {
    setRange(e.target.value);
  };

  const [selectedCurrencies, setSelectedCurrencies] = useState(null);
  const currencies = [
    { name: "Bitcoin", code: "BTC-USD" },
    { name: "Ethereum", code: "ETH-USD" },
    { name: "Cardano", code: "ADA-USD" },
    { name: "Tether", code: "USDT-USD" },
    { name: "Binance Coin", code: "BNB-USD" },
    { name: "XRP", code: "XRP-USD" },
    { name: "Solana", code: "SOL-USD" },
    { name: "Dogecoin", code: "DOGE-USD" },
    { name: "USD Coin", code: "USDC-USD" },
    { name: "Avalanche", code: "AVAX-USD" },
    { name: "Chainlink", code: "LINK-USD" },
    { name: "Bitcoin Cash", code: "BCH-USD" },
    { name: "Algorand", code: "ALGO-USD" },
    { name: "Litecoin", code: "LTC-USD" },
  ];

  return (
    <div className="text-black bg-white pb-10">
      <Toast ref={toast} />

      <h1 className="ml-[10%] mt-3 text-3xl font-bold">Efficient Frontier</h1>
      <Panel
        className="m-auto w-[80%] mt-[10vh]"
        header="Select the historical time period and crypto assets:"
      >
        <div className="w-[80%] pl-10">
          <h2 className="text-lg font-bold">Time Period:</h2>

          <div className="">
            <label htmlFor="default-range" className="">
              Last {range} days
            </label>
            <Slider
              className="mt-2 mb-2"
              value={range}
              min={180}
              max={720}
              onChange={(e) => setRange(e.value)}
            />
          </div>

          <div className="flex align-items-center mt-4 mb-5">
            <Checkbox
              inputId="includeAllAssets"
              name="includeAllAssets"
              checked={includeAllAssets}
              onChange={(e) => setIncludeAllAssets(e.checked)}
            />
            <label htmlFor="includeAllAssets" className="ml-2">
              Include all assets
            </label>
          </div>

          <h2 className="text-lg font-bold mb-3">Crypto Assets:</h2>
          <MultiSelect
            value={selectedCurrencies}
            onChange={(e) => setSelectedCurrencies(e.value)}
            options={currencies}
            optionLabel="name"
            filter
            placeholder="Select Assets"
            maxSelectedLabels={10}
            className="w-full md:w-20rem mb-5"
            display="chip"
          />

          <Button
            label="Calculate Portfolio"
            loading={loading}
            onClick={load}
          />
        </div>

        <div className="w-[80%] pl-10"></div>
      </Panel>

      {graphData && (
        <Panel
          className="m-auto w-[80%] mt-[10vh]"
          header="Optimized Portfolio:"
        >
          <p className="">
            The portfolio is calculated using the selected assets and the
            historical data from the last {range} days.
          </p>
          <Plot
            className="w-[100%]"
            data={graphData.data}
            layout={graphData.layout}
          />

          <div className="">
            <DataTable value={rows} tableStyle={{ minWidth: "50rem" }}>
              {Object.keys(portfolioData[0]).map((key) => (
                <Column key={key} field={key} header={key} />
              ))}
            </DataTable>
          </div>

          <div className="mt-[30px]">
            <Accordion>
              <AccordionTab header="Show all optimized Portfolios">
                <DataTable
                  paginator
                  rows={10}
                  value={rowsAll}
                  tableStyle={{ minWidth: "50rem" }}
                >
                  {Object.keys(allPortfolioData[0]).map((key) => (
                    <Column key={key} field={key} header={key} sortable />
                  ))}
                </DataTable>
              </AccordionTab>
            </Accordion>
          </div>
        </Panel>
      )}
    </div>
  );
}
export default Hero;
