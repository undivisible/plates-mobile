<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  // Props
  export let title: string = '';
  export let text: string = '';
  
  // Event dispatcher for navigation
  const dispatch = createEventDispatcher();
  
  function goBack() {
    dispatch('navigate');
  }
</script>

<style>
  .result-container {
    background-color: #000000;
    width: 100%;
    height: 100%;
    padding: 20;
  }
  
  .header {
    margin-top: 20;
    margin-bottom: 20;
  }
  
  .title {
    color: #ffffff;
    font-size: 24;
    font-weight: bold;
    margin-bottom: 10;
  }
  
  .back-button {
    color: #1e88e5;
    font-size: 18;
    margin-bottom: 20;
  }
  
  .content {
    color: #dddddd;
    font-size: 16;
    text-wrap: true;
  }
  
  .footer {
    color: #888888;
    font-size: 14;
    text-align: center;
    margin-top: 20;
  }
</style>

<page>
  <actionBar visibility="collapsed"></actionBar>
  <scrollView orientation="vertical" class="result-container">
    <stackLayout>
      <stackLayout class="header">
        <label text="&#xf060; Back" class="back-button fas" on:tap={goBack} />
        <label text={title} class="title" textWrap="true" />
      </stackLayout>
      
      <label text={text} class="content" textWrap="true" />
      
      <label text="Scroll for more" class="footer" />
    </stackLayout>
  </scrollView>
</page>
