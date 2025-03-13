<!-- بسم الله الرحمن الرحيم-->
<script lang="ts" context="module">
  import { Application } from '@nativescript/core';
  import { onMount } from 'svelte';
  import { getBatteryLevel, addBatteryListener } from './modules/battery';
  import { getTemperature } from "./modules/temp";
  import { Talk, prompt } from "~/modules/talk";
  import { search } from "~/modules/search";

  declare const android: any;

  const talker = new Talk();
  let time = new Date().toLocaleTimeString();
  let date = new Date().toLocaleDateString();
  let temp = getTemperature();
  let batteryLevel: number | undefined;
  let error: string = '';

  setInterval(() => { time = new Date().toLocaleTimeString(); }, 1000);

  onMount(() => {
      batteryLevel = getBatteryLevel();
      addBatteryListener((level: number) => { batteryLevel = level; });

      return () => {
          if (Application.android) {
              const intentAction = android.content.Intent.ACTION_BATTERY_CHANGED;
              Application.android.unregisterBroadcastReceiver(intentAction);
          }
      };
  });

  function talk() {
    talker.start();
  }

  async function end() {
    try {
      talker.stop();
      const result = await search(prompt);
      // Handle the result as needed
    }
    catch(err) {
      error = err instanceof Error ? err.message : 'An error occurred';
    }
  }

  export { time, date, temp, batteryLevel, error };
</script>

<body>
  <div on:touchstart|preventDefault={talk} on:touchend={end}>
    <section>
      <header>
        <h5>{error}</h5>
        <h5 class="battery">{batteryLevel}</h5>
      </header>

      <main>
          <h1>{time}</h1>
          <h2>{date}</h2>
      </main>

      <footer>
        <h5>{temp}</h5>
      </footer>
    </section>
  </div>
</body>
