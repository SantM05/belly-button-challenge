// Function to fetch data from the API
function fetchData() {
  return d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json")
      .then(data => {
          return data;
      })
      .catch(error => {
          console.error("Error fetching data: ", error);
      });
}

// Build the metadata panel function
function buildMetadata(sample, data) {
  let metadata = data.metadata;
  let info = metadata.filter(x => x.id.toString() === sample)[0];
  let panel = d3.select("#sample-metadata");
  panel.html(""); // Clear any existing metadata

  for (const [key, value] of Object.entries(info)) {
      let upperkey = key.toUpperCase();
      panel.append("h6").text(`${upperkey}: ${value}`);
  }
}

// Function to build both charts
function buildCharts(sample, data) {
  let sample_data = data.samples;
  let info = sample_data.filter(x => x.id === sample)[0];
  let otu_ids = info.otu_ids;
  let otu_labels = info.otu_labels;
  let sample_values = info.sample_values;

  // Build a Bubble Chart
  let bubble_trace = {
      x: otu_ids,
      y: sample_values,
      mode: "markers",
      marker: {
          color: otu_ids,
          size: sample_values,
          colorscale: "Portland"
      },
      text: otu_labels
  };
  let bubble_traces = [bubble_trace];
  let bubble_layout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: { title: "OTU ID" },
      yaxis: { title: "Number of Bacteria" }
  };
  Plotly.newPlot("bubble", bubble_traces, bubble_layout);

  // Build a Bar Chart
  let yticks = otu_ids.slice(0, 10).map(x => `OTU ${x}`);
  let trace_1 = {
      x: sample_values.slice(0, 10).reverse(),
      y: yticks.reverse(),
      type: "bar",
      marker: { colorscale: 'Magma', color: sample_values.slice(0, 10).reverse() },
      text: otu_labels.slice(0, 10).reverse(),
      orientation: "h"
  };
  let traces = [trace_1];
  let bar_layout = {
      title: "Top 10 Bacteria Cultures Found",
      xaxis: { title: "Number of Bacteria" }
  };
  Plotly.newPlot("bar", traces, bar_layout);
}

// Function to run on page load
function init() {
  fetchData().then(data => {
      let names = data.names;
      let dropdown = d3.select("#selDataset");

      for (let i = 0; i < names.length; i++) {
          let name = names[i];
          dropdown.append("option").text(name).property("value", name);
      }

      let default_name = names[0];
      buildCharts(default_name, data);
      buildMetadata(default_name, data);
  });
}

// Function for event listener
function optionChanged(newSample) {
  fetchData().then(data => {
      buildCharts(newSample, data);
      buildMetadata(newSample, data);
  });
}

// Initialize the dashboard
init();