<script lang="ts">
  import { onMount } from 'svelte';

  type Upgrade = {
    id: string;
    name: string;
    baseCost: number;
    costMultiplier: number;
    baseCps: number;
    owned: number;
  };

  const STORAGE_KEY = 'idle_clicker_save_v1';

  const formatNumber = (value: number) =>
    Intl.NumberFormat('en-US', {
      minimumFractionDigits: value >= 1000 ? 0 : 1,
      maximumFractionDigits: value >= 1000 ? 0 : 1
    }).format(value);

  const createUpgrades = (): Upgrade[] => [
    {
      id: 'intern',
      name: 'Intern',
      baseCost: 15,
      costMultiplier: 1.16,
      baseCps: 0.5,
      owned: 0
    },
    {
      id: 'bot',
      name: 'Click Bot',
      baseCost: 100,
      costMultiplier: 1.2,
      baseCps: 3,
      owned: 0
    },
    {
      id: 'factory',
      name: 'Factory',
      baseCost: 750,
      costMultiplier: 1.24,
      baseCps: 20,
      owned: 0
    },
    {
      id: 'lab',
      name: 'AI Lab',
      baseCost: 4000,
      costMultiplier: 1.28,
      baseCps: 110,
      owned: 0
    }
  ];

  let points = 0;
  let totalClicks = 0;
  let clickPower = 1;
  let upgrades: Upgrade[] = createUpgrades();
  let status = 'Tap the core to start your idle empire.';

  $: pointsPerSecond = upgrades.reduce((sum, upgrade) => sum + upgrade.baseCps * upgrade.owned, 0);

  const getUpgradeCost = (upgrade: Upgrade) => Math.round(upgrade.baseCost * upgrade.costMultiplier ** upgrade.owned);

  const canAfford = (cost: number) => points >= cost;

  const clickCore = () => {
    points += clickPower;
    totalClicks += 1;
  };

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find((item) => item.id === upgradeId);
    if (!upgrade) return;

    const cost = getUpgradeCost(upgrade);
    if (!canAfford(cost)) {
      status = `Need ${formatNumber(cost - points)} more energy to buy ${upgrade.name}.`;
      return;
    }

    points -= cost;
    upgrade.owned += 1;
    upgrades = [...upgrades];
    status = `${upgrade.name} purchased! Automation increased.`;
  };

  const buyClickPower = () => {
    const cost = Math.round(50 * 1.8 ** (clickPower - 1));
    if (!canAfford(cost)) {
      status = `Need ${formatNumber(cost - points)} more energy to boost your click power.`;
      return;
    }

    points -= cost;
    clickPower += 1;
    status = `Click power upgraded to ${clickPower}!`;
  };

  const saveGame = () => {
    const payload = {
      points,
      totalClicks,
      clickPower,
      upgrades
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const loadGame = () => {
    const save = localStorage.getItem(STORAGE_KEY);
    if (!save) return;

    try {
      const parsed = JSON.parse(save) as {
        points: number;
        totalClicks: number;
        clickPower: number;
        upgrades: Upgrade[];
      };

      points = Number.isFinite(parsed.points) ? parsed.points : 0;
      totalClicks = Number.isFinite(parsed.totalClicks) ? parsed.totalClicks : 0;
      clickPower = Number.isFinite(parsed.clickPower) && parsed.clickPower > 0 ? parsed.clickPower : 1;

      const defaults = createUpgrades();
      upgrades = defaults.map((baseUpgrade) => {
        const savedUpgrade = parsed.upgrades?.find((item) => item.id === baseUpgrade.id);
        return {
          ...baseUpgrade,
          owned: savedUpgrade?.owned && savedUpgrade.owned > 0 ? Math.floor(savedUpgrade.owned) : 0
        };
      });
      status = 'Save loaded. Welcome back, boss.';
    } catch {
      status = 'Save data was invalid, starting fresh.';
    }
  };

  const resetGame = () => {
    points = 0;
    totalClicks = 0;
    clickPower = 1;
    upgrades = createUpgrades();
    status = 'Game reset. Fresh run started.';
    localStorage.removeItem(STORAGE_KEY);
  };

  onMount(() => {
    loadGame();

    const tick = setInterval(() => {
      points += pointsPerSecond / 10;
    }, 100);

    const autosave = setInterval(saveGame, 5000);

    return () => {
      clearInterval(tick);
      clearInterval(autosave);
      saveGame();
    };
  });
</script>

<svelte:window on:beforeunload={saveGame} />

<div class="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-4 py-8 text-slate-100">
  <header class="rounded-2xl bg-slate-900/80 p-6 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-400/30">
    <h1 class="text-3xl font-bold tracking-tight">Idle Reactor</h1>
    <p class="mt-2 text-slate-300">Click to generate energy. Buy automation. Grow forever.</p>
  </header>

  <section class="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
    <article class="rounded-2xl bg-slate-900/80 p-6 shadow-lg ring-1 ring-slate-700">
      <div class="grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
        <p><span class="font-semibold text-white">Energy:</span> {formatNumber(points)}</p>
        <p><span class="font-semibold text-white">Per second:</span> {formatNumber(pointsPerSecond)}</p>
        <p><span class="font-semibold text-white">Total clicks:</span> {formatNumber(totalClicks)}</p>
      </div>

      <button
        class="mt-6 w-full rounded-2xl bg-cyan-500 px-6 py-12 text-2xl font-bold text-slate-900 transition hover:bg-cyan-400 active:scale-[0.99]"
        on:click={clickCore}
        aria-label="Generate energy"
      >
        ⚡ Generate +{clickPower}
      </button>

      <div class="mt-4 flex flex-wrap gap-3">
        <button
          class="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400"
          on:click={buyClickPower}
        >
          Upgrade Click ({formatNumber(Math.round(50 * 1.8 ** (clickPower - 1)))})
        </button>
        <button
          class="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white transition hover:bg-rose-500"
          on:click={resetGame}
        >
          Reset
        </button>
      </div>

      <p class="mt-4 text-sm text-cyan-200">{status}</p>
    </article>

    <aside class="rounded-2xl bg-slate-900/80 p-6 shadow-lg ring-1 ring-slate-700">
      <h2 class="text-xl font-semibold">Automation Shop</h2>
      <ul class="mt-4 space-y-3">
        {#each upgrades as upgrade}
          <li class="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="font-semibold">{upgrade.name} <span class="text-slate-400">x{upgrade.owned}</span></p>
                <p class="text-sm text-slate-300">+{formatNumber(upgrade.baseCps)} / sec each</p>
              </div>
              <button
                class="rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 {canAfford(
                  getUpgradeCost(upgrade)
                )
                  ? 'bg-emerald-500 text-slate-900 hover:bg-emerald-400'
                  : 'bg-slate-700 text-slate-400'}"
                on:click={() => buyUpgrade(upgrade.id)}
                disabled={!canAfford(getUpgradeCost(upgrade))}
              >
                Buy ({formatNumber(getUpgradeCost(upgrade))})
              </button>
            </div>
          </li>
        {/each}
      </ul>
    </aside>
  </section>
</div>

<style>
  :global(body) {
    @apply bg-slate-950;
  }
</style>
