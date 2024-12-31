// Function to load the ad script
function loadAdScript() {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//pl25418255.profitablecpmrate.com/93/93/27/93932799bb83ca32cab397e9f7902b9f.js';
    document.body.appendChild(script);
  }
  
  // Function to check and control ad display frequency
  function controlAdDisplay() {
    const lastAdDisplay = localStorage.getItem('lastAdDisplay');
    const now = new Date().getTime();
    const adDisplayInterval = 1 * 60 * 1 * 1000; // 1min in milliseconds
  
    if (!lastAdDisplay || now - lastAdDisplay > adDisplayInterval) {
      loadAdScript();
      localStorage.setItem('lastAdDisplay', now);
    }
  }
  // Call the function to control ad display
  // controlAdDisplay();