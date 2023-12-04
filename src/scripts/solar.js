const fs = require("fs");

function generateSolarPanelSavingsTable(
  initialCost,
  inflationRate,
  currentElectricityRate,
  solarEfficiencyDecreaseRate,
  solarPanelCapacitykW,
  lifespanYears,
  averageStockMarketReturn,
  averageFixedDepositReturn
) {
  let dynamicAnnualSavings = [];
  let averageMonthlyGenerated = [];
  let averageMonthlySavings = [];
  let averageMonthlyElectricityCost = [];
  let monthlyEnergyGeneratedkWh = solarPanelCapacitykW * 30;
  let currentPricePerkWh = currentElectricityRate;
  let efficiencyDecreasePerYear = solarEfficiencyDecreaseRate / 100;

  // Calculate and store the annual savings, average monthly electricity cost, and average monthly savings for each year
  let monthlyEnergyGenerated = monthlyEnergyGeneratedkWh;
  for (let year = 1; year <= lifespanYears; year++) {
    let yearlyEnergyGenerated = monthlyEnergyGenerated * 12;
    let yearlyEnergyValue = yearlyEnergyGenerated * currentPricePerkWh;
    dynamicAnnualSavings.push(yearlyEnergyValue);
    averageMonthlyGenerated.push(monthlyEnergyGenerated);
    averageMonthlySavings.push(yearlyEnergyValue / 12);
    averageMonthlyElectricityCost.push(currentPricePerkWh);
    monthlyEnergyGenerated *= 1 - efficiencyDecreasePerYear;
    currentPricePerkWh *= 1 + inflationRate;
  }

  let years = Array.from(Array(lifespanYears), (_, i) => i + 1);
  let stockMarketInvestmentGrowth = years.map(
    (year) => initialCost * Math.pow(1 + averageStockMarketReturn, year)
  );
  let fixedDepositInvestmentGrowth = years.map(
    (year) => initialCost * Math.pow(1 + averageFixedDepositReturn, year)
  );

  // Create the data object
  let data = {
    Year: years,
    "Annual Savings (Rs)": dynamicAnnualSavings,
    "Stock Market Investment (Rs)": stockMarketInvestmentGrowth,
    "Fixed Deposit Investment (Rs)": fixedDepositInvestmentGrowth,
    "Average Monthly Electricity Generated (kWh)": averageMonthlyGenerated,
    "Average Monthly Electricity Price (Rs/kWh)": Array(lifespanYears).fill(
      currentElectricityRate
    ),
    "Average Monthly Savings (Rs)": averageMonthlySavings,
    "Average Monthly Electricity Cost (Rs)": averageMonthlyElectricityCost,
  };

  // Write the data to a CSV file
  let csvData =
    "data:text/csv;charset=utf-8," +
    Object.keys(data).join(",") +
    "\n" +
    years
      .map((year, index) => {
        return [
          data["Year"][index],
          data["Annual Savings (Rs)"][index],
          data["Stock Market Investment (Rs)"][index],
          data["Fixed Deposit Investment (Rs)"][index],
          data["Average Monthly Electricity Generated (kWh)"][index],
          data["Average Monthly Electricity Price (Rs/kWh)"][index],
          data["Average Monthly Savings (Rs)"][index],
          data["Average Monthly Electricity Cost (Rs)"][index],
        ].join(",");
      })
      .join("\n");

  fs.writeFileSync("solar_panel_savings.csv", csvData);

  return "solar_panel_savings.csv";
}

// Example usage
let initialCost = 130000;
let inflationRate = 0.095;
let currentElectricityRate = 6.5;
let solarEfficiencyDecreaseRate = 0.5;
let solarPanelCapacitykW = 3;
let lifespanYears = 25;
let averageStockMarketReturn = 0.12;
let averageFixedDepositReturn = 0.06;

let csvFilePath = generateSolarPanelSavingsTable(
  initialCost,
  inflationRate,
  currentElectricityRate,
  solarEfficiencyDecreaseRate,
  solarPanelCapacitykW,
  lifespanYears,
  averageStockMarketReturn,
  averageFixedDepositReturn
);
csvFilePath;
