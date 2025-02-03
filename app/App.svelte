<script lang="ts">
  import { Application } from '@nativescript/core';
  import { onMount } from 'svelte';
  import { getBatteryLevel, addBatteryListener } from './modules/battery';
  import { Talk } from './modules/talk';
  import { getTemperature } from "./modules/temp";

  declare const android: any;

  const talker = new Talk();
  let time = new Date().toLocaleTimeString();
  let date = new Date().toLocaleDateString();
  let temp = getTemperature();
  let batteryLevel: number | undefined;

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

</script>

<style>
  @font-face {
    font-family: 'Onest';
    src: url('fonts/Onest-Variable.ttf') format('truetype');
    font-weight: 100 900;
    font-style: normal;
  }

  body, section {
    margin: 0;
    padding: 0;
    font-family: 'Onest', sans-serif;
    background-color: #000000;
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
  }

  header {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1rem;
  }

  main {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-left: 2rem;
  }

  h1, h2, h5 {
    margin: 0;
    color: #fff;
  }

  h1 {font-size: 4rem;}
  h2, h5 {font-size: 2rem;}
  h5 {opacity: 0.5;}

  footer {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 1rem;
  }
</style>

<body>
  <a onclick="talk()">
    <section>
      <header>
        <h5>{batteryLevel}</h5>
      </header>

      <main>
          <h1>{time}</h1>
          <h2>{date}</h2>
      </main>

      <footer>
        <h5>{temp}</h5>
      </footer>
    </section>
  </a>
</body>
