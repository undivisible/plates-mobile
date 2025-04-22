<!-- Android Launcher Home Screen -->
<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { getBatteryLevel, addBatteryListener } from '../modules/battery';
  import { getTemperature } from '../modules/temp';
  
  // Event dispatcher for communication with parent
  const dispatch = createEventDispatcher();
  
  // Time and date
  let time = '';
  let date = '';
  let temp = '';
  let batteryLevel: number | undefined;
  let cleanupBatteryListener: (() => void) | undefined;
  let isRecording = false;
  
  // Format time as HH:MM
  function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    time = `${hours}:${minutes}`;
    
    // Format date as DD.MM
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    date = `${day}.${month}`;
  }
  
  // Update temperature
  async function updateTemperature() {
    try {
      const tempData = await getTemperature();
      if (tempData) {
        // Extract just the number and degree symbol from the temperature string
        const tempMatch = tempData.match(/([\d.]+)°/);
        if (tempMatch && tempMatch[1]) {
          temp = `${tempMatch[1]}°`;
        } else {
          temp = tempData;
        }
      }
    } catch (error) {
      console.error('Error getting temperature:', error);
      temp = '--°';
    }
  }
  
  // Update battery level
  function updateBatteryLevel() {
    batteryLevel = getBatteryLevel();
  }
  
  let timeInterval: number;
  
  onMount(async () => {
    // Initial updates
    updateTime();
    updateBatteryLevel();
    await updateTemperature();
    
    // Set up intervals for updates
    timeInterval = setInterval(updateTime, 1000) as unknown as number;
    
    // Set up battery listener
    cleanupBatteryListener = addBatteryListener((level: number) => {
      batteryLevel = level;
    });
  });
  
  onDestroy(() => {
    // Clean up intervals and listeners
    if (timeInterval) clearInterval(timeInterval);
    if (cleanupBatteryListener) cleanupBatteryListener();
  });
</script>

<style>
  .launcher-container {
    background-color: #000000;
    width: 100%;
    height: 100%;
    padding: 20;
  }
  
  .time {
    font-size: 96;
    color: #ffffff;
    font-weight: 500;
    margin-top: 40%;
    horizontal-align: left;
  }
  
  .info-row {
    margin-top: 10;
  }
  
  .date, .temperature {
    font-size: 36;
    color: #888888;
    margin-right: 20;
  }
  
  .weather-icon {
    color: #888888;
    font-size: 36;
  }
  
  .battery {
    font-size: 36;
    color: #ffffff;
    vertical-align: bottom;
    margin-bottom: 20;
    margin-left: 20;
  }
  
  .voice-button {
    background-color: #1e88e5;
    color: #ffffff;
    font-size: 18;
    font-weight: bold;
    border-radius: 30;
    padding: 15;
    margin-top: 40;
    width: 80%;
    horizontal-align: center;
  }
  
  .recording {
    background-color: #e53935;
    animation-name: pulse;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
</style>

<page>
  <actionBar visibility="collapsed"></actionBar>
  <gridLayout rows="auto, *, auto" columns="*" class="launcher-container">
    <!-- Empty top row for spacing -->
    <label row="0" col="0" text="" />
    
    <!-- Main content -->
    <stackLayout row="1" col="0">
      <label class="time" text="{time}"></label>
      <gridLayout rows="auto" columns="auto, auto, auto" class="info-row">
        <label col="0" class="date" text="{date}"></label>
        <label col="1" class="temperature" text="{temp}"></label>
        <label col="2" class="weather-icon fas" text="&#xf185;"></label>
      </gridLayout>
      
      <!-- Voice search button -->
      <button 
        text="{isRecording ? 'Stop Recording' : 'Start Voice Search'}"
        class="voice-button {isRecording ? 'recording' : ''}"
        on:tap="{() => {
          if (isRecording) {
            isRecording = false;
            dispatch('endRecording');
          } else {
            isRecording = true;
            dispatch('startRecording');
          }
        }}"
      />
    </stackLayout>
    
    <!-- Battery at bottom -->
    <label row="2" col="0" class="battery" text="{batteryLevel}%"></label>
  </gridLayout>
</page>