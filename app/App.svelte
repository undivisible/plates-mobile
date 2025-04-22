<!-- بسم الله الرحمن الرحيم-->
<script context="module" lang="ts">
  declare const android: any;
</script>

<script lang="ts">
  import { Application } from '@nativescript/core';
  import { onMount, onDestroy } from 'svelte';
  import { Talk, prompt } from "./modules/talk";
  import { search } from "./modules/search";
  import Home from './pages/home.svelte';
  import Result from './pages/result.svelte';
  
  // Import CSS styles
  import "./app.css";

  const talker = new Talk();
  let currentPage: 'home' | 'result' = 'home';
  let searchResult: string = '';
  let searchTitle: string = '';
  let isSearching: boolean = false;
  let error: string = '';
  
  // Handle voice recording start
  function startRecording() {
    talker.start();
    // Listen for transcription updates
    talker.on('transcription', (args: any) => {
      console.log('Transcription:', args.transcription);
    });
  }

  // Handle voice recording end and search
  async function endRecordingAndSearch() {
    try {
      isSearching = true;
      talker.stop();
      
      // Extract a title from the prompt
      searchTitle = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt;
      
      // Perform search
      searchResult = await search(prompt);
      
      // Navigate to result page
      currentPage = 'result';
      isSearching = false;
    }
    catch(err) {
      isSearching = false;
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Search error:', error);
    }
  }

  // Handle navigation back to home
  function navigateToHome() {
    currentPage = 'home';
  }

  onMount(() => {
    // Initialize any app-level resources here
    console.log('App mounted');
  });
  
  onDestroy(() => {
    // Clean up any app-level resources here
    console.log('App destroyed');
  });
</script>

<style>
  /* App-level styles */
  .loading-indicator {
    color: #ffffff;
    font-size: 24;
    text-align: center;
    margin-top: 20;
  }
  
  .error-message {
    color: #ff5252;
    font-size: 18;
    text-align: center;
    margin: 20;
  }
</style>

<page>
  <actionBar visibility="collapsed"></actionBar>
  
  {#if error}
    <gridLayout rows="*" columns="*" backgroundColor="#000000">
      <label row={0} col={0} class="error-message" text={error} textWrap="true" />
    </gridLayout>
  {:else if isSearching}
    <gridLayout rows="*" columns="*" backgroundColor="#000000">
      <label row={0} col={0} class="loading-indicator" text="Searching..." />
    </gridLayout>
  {:else if currentPage === 'home'}
    <Home 
      on:startRecording={startRecording}
      on:endRecording={endRecordingAndSearch}
    />
  {:else}
    <Result 
      title={searchTitle}
      text={searchResult}
      on:navigate={navigateToHome}
    />
  {/if}
</page>
