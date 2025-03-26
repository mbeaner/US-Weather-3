document.addEventListener('DOMContentLoaded', function () {
  // Show loading message
  const loadingMessage = document.createElement('div');
  loadingMessage.className = 'loading-message';
  loadingMessage.textContent = 'Loading your saved map...';
  document.body.appendChild(loadingMessage);
  loadingMessage.style.display = 'block';

  // Set default date to today
  const datePicker = document.getElementById('date-picker');
  const today = new Date();
  datePicker.valueAsDate = today;

  // Print button functionality
  document.getElementById('print-btn').addEventListener('click', function () {
    window.print();
  });

  // Debugging button to clear storage
  document
    .getElementById('clear-storage')
    .addEventListener('click', function () {
      localStorage.removeItem('stateColors');
      alert('Saved colors cleared! Refresh the page.');
    });

  // Map dimensions
  const width = window.innerWidth;
  const height =
    window.innerHeight - document.querySelector('header').offsetHeight;

  // Create SVG container
  const svg = d3.select('#us-map').attr('width', width).attr('height', height);

  // Projection and path
  const projection = d3
    .geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(width);

  const path = d3.geoPath().projection(projection);

  // State abbreviations
  const stateAbbreviations = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
  };

  // Color sequence
  const colors = ['#f0f0f0', '#3498db', '#e74c3c'];

  // Load saved state colors from localStorage
  const loadStateColors = () => {
    try {
      const savedColors = localStorage.getItem('stateColors');
      return savedColors ? JSON.parse(savedColors) : {};
    } catch (e) {
      console.error('Error loading saved colors:', e);
      return {};
    }
  };

  // Save state colors to localStorage
  const saveStateColors = (stateColors) => {
    try {
      localStorage.setItem('stateColors', JSON.stringify(stateColors));
    } catch (e) {
      console.error('Error saving colors:', e);
    }
  };

  // Initialize state colors
  let stateColors = loadStateColors();

  // Load and draw the US map
  d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
    .then(function (us) {
      const states = topojson.feature(us, us.objects.states).features;

      // Draw states with saved colors
      svg
        .selectAll('.state')
        .data(states)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('fill', function (d) {
          return stateColors[d.properties.name] || colors[0];
        })
        .attr('data-color-index', function (d) {
          const savedColor = stateColors[d.properties.name];
          if (!savedColor) return 0;
          return savedColor === colors[1]
            ? 1
            : savedColor === colors[2]
            ? 2
            : 0;
        })
        .on('click', function (event, d) {
          const currentIndex = +d3.select(this).attr('data-color-index');
          const nextIndex = (currentIndex + 1) % colors.length;
          const newColor = colors[nextIndex];

          // Update the display
          d3.select(this)
            .attr('fill', newColor)
            .attr('data-color-index', nextIndex);

          // Update and save state colors
          stateColors[d.properties.name] = newColor;
          saveStateColors(stateColors);
        });

      // Add state abbreviations
      svg
        .selectAll('.state-abbr')
        .data(states)
        .enter()
        .append('text')
        .attr('class', 'state-abbr')
        .attr('transform', function (d) {
          const centroid = path.centroid(d);
          return 'translate(' + [centroid[0], centroid[1] + 1.5] + ')';
        })
        .attr('dy', '.35em')
        .text(function (d) {
          const stateName = d.properties.name;
          for (const abbr in stateAbbreviations) {
            if (stateAbbreviations[abbr] === stateName) {
              return abbr;
            }
          }
          return '';
        });

      // Hide loading message
      loadingMessage.style.display = 'none';
    })
    .catch((error) => {
      console.error('Error loading map data:', error);
      loadingMessage.textContent = 'Error loading map. Please refresh.';
    });

  // Handle window resize
  window.addEventListener('resize', function () {
    const newWidth = window.innerWidth;
    const newHeight =
      window.innerHeight - document.querySelector('header').offsetHeight;

    svg.attr('width', newWidth).attr('height', newHeight);

    projection.translate([newWidth / 2, newHeight / 2]).scale(newWidth);

    svg.selectAll('.state').attr('d', path);

    svg.selectAll('.state-abbr').attr('transform', function (d) {
      const centroid = path.centroid(d);
      return 'translate(' + [centroid[0], centroid[1] + 1.5] + ')';
    });
  });
});
