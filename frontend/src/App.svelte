<script>
  import { onMount } from "svelte";

  const params = new URLSearchParams(window.location.search);

  let ticket_id;
  let ticket_title;

  let repos = [];
  let branches = [];
  let urls = [];

  /*
   * Try to fetch repos. If we can't, just assume the user might not be authenticated and kick off the auth flow.
   */
  onMount(async () => {
    ticket_id = params.get('key');

    try {
      await fetch('http://localhost:8080/api/repos')
        .then(res => res.json())
        .then(data => {
          repos = data.map((repo) => {
            return { name: repo, selected: false };
          });
        });
    } catch (e) {
      window.open('http://localhost:8080/api/auth/login', '_self');
    }
  });

  /*
   * Generate a list of repositories based on the user's input.
   */
  const handleSubmit = () => {
    branches = repos.reduce((filtered, repo) => {
      if (repo.selected) {
        const id = ticket_id.toLowerCase();
        const title = ticket_title.toLowerCase().split(" ").join("-");
        filtered.push({
          'repo': repo.name,
          'name': `${id}-${title}`
        });
      }
      return filtered;
    }, []);
  };

  /*
   * Reset the form.
   */
  const handleReset = () => {
    repos.forEach((repo) => {
      repo.selected = false;
    });
    ticket_id = "";
    ticket_title = "";
    branches = [];
  };

  /*
   * Create branches.
   */
  const createBranch = async () => {
    await fetch('http://localhost:8080/api/create', {
      method: 'POST',
      accept: 'application/json',
      body: JSON.stringify(branches)
    })
    .then(res => res.json())
    .then(data => urls = data)
    .catch(e => console.log(e));
  }
</script>

<div
  title="We couldn't convince security to let us use the BigBrassBand Jira plugin so we wrote the next best thing ourselves."
>
  <h2>Little String Quartet</h2>
</div>

<p>This tool creates git branches using a specific naming format that will help us to automate some of our backend CI processes.</p>

<form id="branch-def" on:submit|preventDefault={handleSubmit}>
  <label for="branch-def">
    <b>Repositories</b>
    <i>Select all repositories required for this story</i>
    {#each repos as repo}
      <label for="{repo}-checkbox">
        {repo.name}
        <input id="{repo}-checkbox" type="checkbox" bind:checked={repo.selected} />
      </label>
    {/each}
  </label>

  <label>
    <b>Ticket Key</b>
    <input bind:value={ticket_id} />
  </label>

  <label>
    <b>Ticket Title</b>
    <input bind:value={ticket_title} />
  </label>

  <button
    disabled={branches == [] || !ticket_id || !ticket_title}
    type="submit"
  >
    Generate Branch Names
  </button>
</form>

<button on:click={handleReset}> Reset Form </button>

{#if urls.length > 0}
  <p>
    The following branches have been created:
  </p>
  <div class="hljs">
    <ul class="nobullet">
      {#each urls as url}
        <li><a href={url} target="_blank">{url}</a></li>
      {/each}
    </ul>
  </div>
{:else}
  {#if branches.length > 0}
    <p>
      The following branches will be created. If this looks correct, click Create to continue.
    </p>
    <div class="hljs">
      <ul class="nobullet">
        {#each branches as branch}
          <li>{branch.repo}/{branch.name}</li>
        {/each}
      </ul>
    </div>

    <button on:click={createBranch}> Create </button>
  {/if}
{/if}

<style>
  input {
    display: block;
    width: 500px;
    max-width: 100%;
  }

  li {
    overflow: hidden;
  }

  .hljs {
    display: block;
    overflow-x: auto;
    padding: 1em;
    background: #f5f2f0;
    color: #000;
    font-family: Consolas, Monaco, Andale Mono, Ubuntu Mono, monospace;
  }

  .nobullet {
    list-style-type: none;
  }
</style>
