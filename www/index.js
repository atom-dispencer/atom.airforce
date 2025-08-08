console.log("Loading atom.airforce JavaScript...");

var setup_complete = false;
var kute_script = document.createElement("script");

function lazy_setup()
{
  if (setup_complete)
  {
    console.log("Setup already finished, ignoring!");
    return;
  }
  setup_complete = true;
  console.log("Finishing setup...");

  // Start wave animation
  kute_script.src = "lib/kute.min.js";
  kute_script.onload = () => window.setInterval(blend_waves, 5000);
  document.head.appendChild(kute_script);
  blend_waves()
}

function blend_waves()
{
  console.log("Blending waves...");

  const next_wave_index = Math.floor(9.99 * Math.random());
  const path = `resources/wave-${next_wave_index}.svg?=${Math.random()}`;
  fetch(path)
    .then(resource => resource.text())
    .then(svg_text => {
      const svg = new DOMParser().parseFromString(svg_text, "image/svg+xml");
      const svg_darker = svg.getElementById('darker');
      const svg_lighter = svg.getElementById('lighter');
      const new_darker_path_data = svg_darker.getAttribute('d');
      const new_lighter_path_data = svg_lighter.getAttribute('d');

      var darker_tween = KUTE.fromTo(
        '#wave-path-darker', 
        { path: '#wave-path-darker' },
        { path: new_darker_path_data },
        { duration: 5000 }
      ).start();

      var lighter_tween = KUTE.fromTo(
        '#wave-path-lighter', 
        { path: '#wave-path-lighter' },
        { path: new_lighter_path_data },
        { duration: 5000 }
      ).start();
    });
}

document.addEventListener('DOMContentLoaded', lazy_setup, false);
