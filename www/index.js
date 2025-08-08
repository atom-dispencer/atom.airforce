console.log("Loading atom.airforce JavaScript...");

const title_text = "atom.airforce"

var setup_complete = false;
var kute_script = document.createElement("script");
var typing_index = 0;
var title_element = null;

var typing_interval = null;
var intervals_since_flash = 0;
var is_flashed = false;
var title_current_text = "";
var has_typo = 0;
var typo_cooldown = 0;
var animation_finished_at_least_once = false;

function lazy_setup()
{
  if (setup_complete)
  {
    console.log("Setup already finished, ignoring!");
    return;
  }
  setup_complete = true;
  console.log("Finishing setup...");

  // Start typing
  title_element = document.getElementById("title");
  typing_interval = window.setInterval(typing_effect, 100);

  // Start wave animation
  kute_script.src = "lib/kute.min.js";
  kute_script.onload = () => {
    blend_waves();
    window.setInterval(blend_waves, 5000);
  }
  document.head.appendChild(kute_script);
}

function typing_effect()
{
  if (title_element.innerHTML.length == 0)
  {
    title_element.innerHTML = "_";
  }

  // Update flashing
  if (intervals_since_flash++ > 5)
  {
    is_flashed = !is_flashed;
    intervals_since_flash = 0;
  }

  // Handle typing / typos
  var r = Math.random();
  if (title_current_text.length < title_text.length || has_typo || typo_cooldown > 0)
  {
    // The typist is confused!
    if (typo_cooldown > 0)
    {
      typo_cooldown--;
    }
    // Add a character
    else if (r < 0.7 || has_typo)
    {
      if (has_typo)
      {
        title_current_text = title_current_text.substring(0, title_current_text.length - 1);
        has_typo = false;
        typo_cooldown = 0;
      }
      else
      {
        title_current_text += title_text.charAt(typing_index++);
      }
    }
    // Add a typo
    else if (r < 0.8 && title_current_text.length < title_text.length)
    {
      const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const index = Math.floor(Math.random() * characters.length);
      title_current_text += characters.charAt(index);
      has_typo = true;
      typo_cooldown = Math.floor(5 * Math.random()) + 2;
    }
    // Pause 
    else
    {
      // Do nothing: the typist has paused for thought.
    }
  }
  else 
  {
    if (!animation_finished_at_least_once)
    {
      document.getElementById('click-to-replay').classList.add('fade-in');
    }

    animation_finished_at_least_once = true;
  }

  // Set text
  if (is_flashed)
  {
    title_element.innerHTML = title_current_text + "_";
  }
  else
  {
    title_element.innerHTML = title_current_text + " ";
  }
}

function reset_title_text()
{
  console.log("Resetting title text!");
  title_current_text = "";
  typing_index = 0;
}

function blend_waves()
{
  console.log("Blending waves...");

  // Pick a random wave from 1-9
  // Little bit of fiddling to get floor to work properly:
  //   [0,1) -> 0
  //   [1,2) -> 1
  //   [9,9.99] -> 9
  const next_wave_index = Math.floor(9.99 * Math.random()) + 1;
  const path = `resources/wave-${next_wave_index}.svg`;

  // We don't need a smarter caching system because the JS engine should cache the SVG files on
  // the disk for us. Hence, we spread out the bandwidth requirement but still get cool waves!
  fetch(path)
    .then(resource => resource.text())
    .then(svg_text => {
      const svg = new DOMParser().parseFromString(svg_text, "image/svg+xml");
      const svg_darker = svg.getElementById('darker');
      const svg_lighter = svg.getElementById('lighter');

      if (svg_darker == null || svg_lighter == null)
      {
        console.log("uh oh why is that null?");
      }

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
