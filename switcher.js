function switchTheme(e) {
    if (document.documentElement.getAttribute('data-theme') != 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark'); 
    } else {
      document.documentElement.setAttribute('data-theme', 'light'); 
    }
  }