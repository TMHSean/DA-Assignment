<script>
  export let popupMessage = '';
  export let popupType = 'success'; // 'success' or 'error'
  export let visible = false;

  const close = () => {
    visible = false;
  };
</script>

{#if visible}
  <div class={`popup ${popupType}`}>
    <span class="message">{popupMessage}</span>
    <button class="close-button" on:click={close}>Close</button>
  </div>
{/if}

<style>
  .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 1.5rem; /* Increased padding */
    min-width: 250px; /* Set a minimum width */
    border-radius: 8px; /* Slightly larger border-radius for a rounded look */
    color: white;
    font-weight: bold;
    z-index: 1000;
    background-color: #4CAF50; /* Default to green, can be overridden */
    text-align: center;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }

  .popup.success {
    background-color: #4CAF50; /* Light green */
  }

  .popup.error {
    background-color: #F44336; /* Bright red */
  }

  .message {
    display: block;
    margin-bottom: 1rem;
  }

  .close-button {
    background: none;
    border: none;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  .close-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
</style>
