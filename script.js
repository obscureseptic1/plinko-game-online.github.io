(() => {
  const TABS = [
    'resources', 'infrastructure', 'conversions', 'research', 'expansion',
    'anomalies', 'automation', 'prestige', 'codex', 'achievements', 'stats'
  ];

  const RESOURCE_ORDER = [
    'energy','plasma','antimatter','darkMatter','quantumParticles','exoticMatter','spacetimeFlux','singularityCores','vacuumEssence','multiversalFragments',
    'credits','alloys','data','heat','researchPoints','stellarMaterials','stabilizers','entropy','civilizationMarks','realityShards'
  ];

  const GAME = {
    version: 1,
    startedAt: Date.now(),
    lastTick: Date.now(),
    lastSave: Date.now(),
    discoveries: {},
    stats: { ticks: 0, totalClicks: 0, anomaliesSeen: 0, ascensions: 0, collapses: 0, transcends: 0 },
    resources: {
      energy:{a:20,cap:500,unlocked:true}, plasma:{a:0,cap:250,unlocked:false}, antimatter:{a:0,cap:120,unlocked:false}, darkMatter:{a:0,cap:80,unlocked:false}, quantumParticles:{a:0,cap:80,unlocked:false},
      exoticMatter:{a:0,cap:60,unlocked:false}, spacetimeFlux:{a:0,cap:50,unlocked:false}, singularityCores:{a:0,cap:30,unlocked:false}, vacuumEssence:{a:0,cap:20,unlocked:false}, multiversalFragments:{a:0,cap:10,unlocked:false},
      credits:{a:35,cap:5e4,unlocked:true}, alloys:{a:0,cap:5e3,unlocked:true}, data:{a:0,cap:5e3,unlocked:true}, heat:{a:0,cap:2e3,unlocked:true}, researchPoints:{a:0,cap:1e4,unlocked:true},
      stellarMaterials:{a:0,cap:2e4,unlocked:false}, stabilizers:{a:0,cap:2e3,unlocked:false}, entropy:{a:0,cap:999,unlocked:false}, civilizationMarks:{a:0,cap:1e6,unlocked:true}, realityShards:{a:0,cap:1e6,unlocked:true}
    },
    stabilities: { antimatter:0, darkDrift:0, decoherence:0, vacuumInstability:0, temporalStress:0, entropyPressure:0 },
    multipliers: { global:1, time:1, conversion:1, research:1 },
    buildings: {},
    conversions: {},
    research: {},
    researchQueue: [],
    regions: {},
    anomalies: { active:[], cooldown:0, pattern:0, falseVacuumStage:0 },
    automation: { unlocked:false, rules:{ manual:false, autoBuy:false, keepEnergy:100, plasmaThreshold:100, safeAnomaly:true, autoResearch:false } },
    prestige: { ascensionUpgrades:{}, collapseUpgrades:{}, transcendUpgrades:{} },
    codex: [],
    achievements: {}
  };

  const BUILDINGS = [
    ['solarArray','Solar Arrays','early',{credits:15},1.15,{energy:1,heat:0.08},'Produces stable baseline power.'],
    ['thermalWell','Thermal Wells','early',{credits:60,alloys:15},1.18,{energy:2.8,heat:0.5},'Harvests geothermal pressure and entropy noise.'],
    ['gridBattery','Grid Batteries','early',{credits:45,alloys:10},1.17,{capEnergy:60},'Expands local storage envelope.'],
    ['orbitalCollector','Orbital Collectors','early',{credits:200,alloys:60,data:20},1.21,{energy:8,data:1},'Collects uninterrupted orbital photons.'],
    ['fusionReactor','Fusion Reactors','early',{credits:450,alloys:120,heat:60},1.24,{energy:24,heat:2},'First engineered stars in steel cages.'],
    ['plasmaForge','Plasma Forges','mid',{energy:250,alloys:180,heat:120},1.26,{plasma:0.9,heat:1.4},'Refines starfire into industrial plasma.'],
    ['antimatterCondenser','Antimatter Condensers','mid',{energy:1200,plasma:120,data:80},1.3,{antimatter:0.22,instability:0.015},'Creates mirrored particles at risk of rupture.'],
    ['neutrinoScoop','Neutrino Scoops','mid',{credits:2500,alloys:400,data:200},1.27,{researchPoints:3,energy:6},'Pulls signal from what should be invisible.'],
    ['stellarRefinery','Stellar Refineries','mid',{plasma:300,alloys:500,heat:300},1.28,{stellarMaterials:2,alloys:2},'Turns stars into logistics.'],
    ['dysonNode','Dyson Swarm Nodes','mid',{stellarMaterials:120,alloys:700,energy:2400},1.33,{energy:130,data:9},'Modular shell around sunlight.'],
    ['asteroidSmelter','Asteroid Smelters','mid',{credits:5000,energy:1500},1.27,{alloys:8,stellarMaterials:1.5},'Raw belt matter into strategic alloy.'],
    ['researchArk','Research Arks','mid',{alloys:900,data:500,energy:2600},1.3,{researchPoints:18,data:8},'Distributed academies in vacuum.'],
    ['deepTelescope','Deep Field Telescopes','mid',{data:900,alloys:800,energy:3200},1.29,{darkMatter:0.08,darkDrift:-0.01},'Observes what refuses observation.'],
    ['darkLens','Dark Matter Lenses','advanced',{darkMatter:25,stabilizers:20,energy:8000},1.34,{darkMatter:0.35,globalBoost:0.01},'Bends hidden mass into labor.'],
    ['quantumCollider','Quantum Colliders','advanced',{energy:12000,antimatter:80,darkMatter:30},1.36,{quantumParticles:0.22,decoherence:0.02},'Harvests probability shrapnel.'],
    ['probabilityEngine','Probability Engines','advanced',{quantumParticles:40,data:2200,stabilizers:60},1.35,{conversionBoost:0.015,researchBoost:0.02},'Weights reality toward useful branches.'],
    ['vacuumLab','Vacuum Laboratories','advanced',{quantumParticles:60,energy:22000,stabilizers:120},1.37,{vacuumEssence:0.05,vacuumInstability:0.02},'Experiments in almost-nothing.'],
    ['temporalRelay','Temporal Relays','advanced',{spacetimeFlux:10,quantumParticles:40,energy:26000},1.38,{spacetimeFlux:0.12,timeBoost:0.01,temporalStress:0.02},'Routes instructions through near-futures.'],
    ['riftAnchor','Rift Anchors','advanced',{exoticMatter:20,darkMatter:90,stabilizers:180},1.4,{stabilizers:3,vacuumInstability:-0.03},'Pins impossible geometries in place.'],
    ['gravitonMill','Graviton Mills','advanced',{darkMatter:120,stellarMaterials:900,energy:46000},1.4,{singularityCores:0.04,entropy:0.2},'Crushes gradients into dense seeds.'],
    ['singularityCrucible','advanced','advanced',{singularityCores:8,exoticMatter:35,energy:88000},1.42,{singularityCores:0.09,globalBoost:0.03},'Manufactures obedient horizons.'],
    ['eventFoundry','late',{singularityCores:20,vacuumEssence:6,energy:180000},1.45,{exoticMatter:0.3,entropy:0.6},'Forged matter from edge conditions.'],
    ['realityLoom','late',{vacuumEssence:14,spacetimeFlux:18,quantumParticles:150},1.45,{vacuumEssence:0.11,researchBoost:0.06},'Weaves causality as if textile.'],
    ['vacuumSiphon','late',{vacuumEssence:20,stabilizers:420,energy:260000},1.48,{vacuumEssence:0.18,vacuumInstability:0.05},'Taps metastable vacuum seams.'],
    ['censusTower','late',{data:12000,quantumParticles:240,darkMatter:260},1.5,{multiversalFragments:0.01,data:30},'Counts worlds that should not fit.'],
    ['multiversalTap','late',{multiversalFragments:2,vacuumEssence:25,singularityCores:35},1.55,{multiversalFragments:0.04,globalBoost:0.08},'Draws power from adjacent timelines.'],
    ['causalityEngine','late',{spacetimeFlux:45,singularityCores:55,exoticMatter:60},1.55,{timeBoost:0.03,conversionBoost:0.04},'Runs closed loops as infrastructure.'],
    ['precursorArchive','late',{data:25000,researchPoints:20000,vacuumEssence:30},1.57,{hiddenChance:0.015,researchBoost:0.08},'Recovered manuals from unknown operators.'],
    ['omegaLattice','late',{multiversalFragments:12,vacuumEssence:55,singularityCores:80},1.6,{multiversalFragments:0.1,globalBoost:0.2},'A frame for reality itself.']
  ].map((b, idx) => ({
    id:b[0], name:b[1], tier:b[2], baseCost:b[3], scale:b[4], effects:b[5], desc:b[6]||'-', unlock: idx===0 ? ()=>true : ()=>true
  }));

  const CONVERSIONS = [
    {id:'e_to_plasma',name:'Energy -> Plasma Loop',in:{energy:60,heat:20},out:{plasma:4},rate:1,desc:'Compresses power into unstable fuel.'},
    {id:'plasma_data_to_antimatter',name:'Plasma + Data -> Antimatter',in:{plasma:8,data:15,energy:120},out:{antimatter:1},rate:0.5,desc:'Antimatter synthesis under supervision.'},
    {id:'antimatter_scan',name:'Antimatter Scan Charge',in:{antimatter:1,energy:180},out:{darkMatter:0.6,data:20},rate:0.4,desc:'Uses annihilation signatures for dark lock-on.'},
    {id:'dark_stabilizer',name:'Dark Matter + Alloys -> Stabilizers',in:{darkMatter:1.2,alloys:10},out:{stabilizers:2},rate:0.6,desc:'Builds deep-spectrum anchoring hardware.'},
    {id:'quantum_burst',name:'Quantum Burst',in:{quantumParticles:1,researchPoints:25},out:{data:80,exoticMatter:0.25},rate:0.45,desc:'Research collapse into improbable artifacts.'},
    {id:'dark_quantum_to_exotic',name:'Dark + Quantum -> Exotic',in:{darkMatter:0.8,quantumParticles:0.6,energy:500},out:{exoticMatter:0.22},rate:0.6,desc:'Cross-channel materialization.'},
    {id:'exotic_to_flux',name:'Exotic Catalysis -> Spacetime Flux',in:{exoticMatter:0.4,energy:800,stabilizers:1},out:{spacetimeFlux:0.24},rate:0.7,desc:'Generates temporal gradients.'},
    {id:'flux_to_time',name:'Flux Compression',in:{spacetimeFlux:1.2,entropy:4},out:{},rate:0.5,desc:'Converts flux to temporary time acceleration.', special:(x)=>GAME.multipliers.time += 0.008*x},
    {id:'singularity_forge',name:'Core Compression',in:{exoticMatter:0.5,spacetimeFlux:0.4,energy:2400},out:{singularityCores:0.08},rate:0.45,desc:'Crushes exotic media into singular cores.'},
    {id:'vacuum_distill',name:'Vacuum Distillation',in:{singularityCores:0.06,stabilizers:2,energy:5000},out:{vacuumEssence:0.04,entropy:0.8},rate:0.35,desc:'Extracts essence from vacuum tears.'},
    {id:'essence_edit',name:'Reality Edit',in:{vacuumEssence:0.08,quantumParticles:0.8},out:{},rate:0.25,desc:'Permanent conversion ratio tuning.', special:(x)=>GAME.multipliers.conversion += 0.0015*x},
    {id:'multiversal_extract',name:'Multiversal Extraction',in:{vacuumEssence:0.1,singularityCores:0.1,spacetimeFlux:0.5},out:{multiversalFragments:0.03},rate:0.2,desc:'Extracts fragments across collapsed branches.'}
  ];

  const RESEARCH = [
    ['power_grid','Power Systems','Grid Harmonization',{researchPoints:30,data:20},8,['solarArray'],()=>{},'Linear power control.'],
    ['plasma_intro','Plasma Engineering','Plasma Containment',{researchPoints:120,data:90,energy:800},20,['plasmaForge'],()=>unlockRes('plasma'),'Unlock plasma era.'],
    ['particle_lattice','Particle Physics','Particle Lattice',{researchPoints:350,data:260,plasma:90},30,['antimatterCondenser'],()=>unlockRes('antimatter'),'Controlled antiparticle synthesis.'],
    ['orbital_industry','Deep Space Industry','Orbital Industry',{researchPoints:220,alloys:220},18,['orbitalCollector','asteroidSmelter'],()=>{},'Distributed offworld build.'],
    ['dark_protocols','Dark Observation','Dark Protocols',{researchPoints:900,data:1200,antimatter:20},45,['deepTelescope','darkLens'],()=>unlockRes('darkMatter'),'Observe hidden mass.'],
    ['quantum_methods','Quantum Mechanics','Quantum Methods',{researchPoints:2200,darkMatter:35,stabilizers:70},60,['quantumCollider','probabilityEngine'],()=>unlockRes('quantumParticles'),'Probabilistic engineering.'],
    ['temporal_ops','Temporal Science','Temporal Operations',{researchPoints:4500,quantumParticles:70,exoticMatter:15},75,['temporalRelay'],()=>unlockRes('spacetimeFlux'),'Applied chronology.'],
    ['singularity_arch','Singularity Architecture','Singularity Architecture',{researchPoints:9800,spacetimeFlux:20,exoticMatter:30},90,['gravitonMill','singularityCrucible'],()=>unlockRes('singularityCores'),'Dense horizon engineering.'],
    ['vacuum_theory','Vacuum Theory','Vacuum Topology',{researchPoints:18000,singularityCores:8,stabilizers:240},110,['vacuumLab','vacuumSiphon'],()=>unlockRes('vacuumEssence'),'False vacuum analysis.'],
    ['dimensional_chart','Dimensional Cartography','Dimensional Cartography',{researchPoints:33000,vacuumEssence:12,spacetimeFlux:15},130,['censusTower','multiversalTap'],()=>unlockRes('multiversalFragments'),'Map branching continua.'],
    ['auto_core','Automation','Autonomous Supervisors',{researchPoints:400,data:500,alloys:240},25,[],()=>{GAME.automation.unlocked=true;},'Unlock automation panel.'],
    ['governance','Civilization Governance','Distributed Governance',{researchPoints:1400,data:800,credits:10000},40,[],()=>{},'Increases prestige yield by 20%.'],
    ['forbidden_1','Vacuum Theory','Forbidden Recursion',{researchPoints:50000,vacuumEssence:30,multiversalFragments:4},160,['omegaLattice'],()=>{addCodex('Forbidden','The equations request an operator signature older than the universe.');},'???',()=>GAME.anomalies.falseVacuumStage>=2]
  ].map(r => ({id:r[0],cat:r[1],name:r[2],cost:r[3],time:r[4],unlocks:r[5],onDone:r[6],desc:r[7],hiddenReq:r[8]}));

  const REGIONS = [
    ['earthGrid','Earth Surface Grid',{credits:0},'Initial terrestrial infrastructure.',{energy:1.05}],
    ['earthOrbit','Earth Orbit',{credits:400,alloys:80},'Continuous sunlight and low-latency relays.',{energy:1.1,data:1.1}],
    ['lunarFoundry','Lunar Foundry',{credits:1200,alloys:220,energy:1200},'Regolith industry and vacuum metallurgy.',{alloys:1.2}],
    ['marsColony','Mars Colony',{credits:3500,alloys:480,data:220},'Independent colonial logistics.',{research:1.12}],
    ['asteroidOps','Asteroid Belt Operations',{credits:8000,energy:5000},'Massive material feedstock.',{stellarMaterials:1.25}],
    ['jovianRing','Jovian Harvest Ring',{energy:16000,alloys:1300,plasma:120},'Gas giant skimming arrays.',{plasma:1.2}],
    ['saturnLabs','Saturn Cryo Labs',{credits:15000,data:2000,plasma:240},'Low-noise physics labs.',{stability:0.9}],
    ['kuiperRelay','Kuiper Relay',{energy:30000,stellarMaterials:3000},'Far-edge computation nodes.',{data:1.22}],
    ['solarPolar','Solar Polar Array',{energy:52000,alloys:3500,plasma:300},'Untapped magnetic flux lines.',{energy:1.25}],
    ['dysonZone','Dyson Construction Zone',{stellarMaterials:6500,alloys:5000,energy:85000},'Swarm-scale engineering.',{energy:1.35}],
    ['listeningPost','Interstellar Listening Post',{data:8000,researchPoints:7000},'Signals from nonhuman architectures.',{anomaly:1.35}],
    ['darkObservatory','Dark Sector Observatory',{darkMatter:35,stabilizers:80,energy:120000},'Detects hidden cosmological scaffolding.',{darkMatter:1.3}],
    ['quantumRift','Quantum Rift',{quantumParticles:60,darkMatter:45},'Locality can no longer be assumed.',{quantumParticles:1.3}],
    ['collapsedStar','Collapsed Star Remnant',{singularityCores:8,spacetimeFlux:8,energy:240000},'Dense residue from a failed god-engine.',{singularityCores:1.25}],
    ['eventPerimeter','Event Horizon Perimeter',{singularityCores:20,stabilizers:420},'Causality shear used as power grid.',{exoticMatter:1.28}],
    ['voidBreach','Void Breach',{vacuumEssence:8,spacetimeFlux:20},'An opening where metric tensors disagree.',{vacuumEssence:1.35}],
    ['fracturedContinuum','Fractured Continuum',{vacuumEssence:25,multiversalFragments:2},'Parallel branches exchange weather.',{time:1.15}],
    ['surveyPlane','Multiversal Survey Plane',{multiversalFragments:8,vacuumEssence:40,singularityCores:30},'The universe appears as layered firmware.',{multiversalFragments:1.5}]
  ].map((r, idx)=>({id:r[0],name:r[1],cost:r[2],lore:r[3],bonus:r[4],req:()=>idx===0 || Object.values(GAME.regions).filter(v=>v).length>=idx}));

  const ANOMALIES = [
    ['solarFlare','Solar Flare Cascade','Boosts energy +40% for 60s.',()=>tempBoost('energy',1.4,60)],
    ['plasmaBloom','Plasma Bloom','Plasma conversion output doubled for 45s.',()=>tempBoost('conversion',2,45)],
    ['containment','Antimatter Containment Breach','Lose antimatter unless stabilized.',()=>{const loss=Math.min(GAME.resources.antimatter.a, 5+GAME.stabilities.antimatter*8); GAME.resources.antimatter.a-=loss; addFeed(`Containment breach consumed ${fmt(loss)} antimatter.`);} ],
    ['darkStorm','Dark Matter Storm','Dark production +80%, drift rises.',()=>{tempBoost('darkMatter',1.8,60); GAME.stabilities.darkDrift+=0.08;}],
    ['quantumRes','Quantum Resonance','Instant +data +research burst.',()=>{gain('data',300); gain('researchPoints',220);} ],
    ['temporalEcho','Temporal Echo','Time speed boosted for 30s.',()=>tempBoost('time',1.5,30)],
    ['gravityShear','Gravity Shear','Singularity output +100% for 25s.',()=>tempBoost('singularityCores',2,25)],
    ['vacuumWhisper','Vacuum Whisper','Unlocks hidden codex fragments.',()=>{if (Math.random()<0.35) addCodex('Whisper','The vacuum speaks in maintenance instructions.'); GAME.anomalies.falseVacuumStage++;}],
    ['falseVacuum','False Vacuum Shiver','Risk event; entropy pressure surges.',()=>{GAME.stabilities.entropyPressure += 0.15; gain('entropy', 15);} ],
    ['fractureWindow','Fracture Window','Multiversal extraction efficiency +150% for 20s.',()=>tempBoost('multiversalFragments',2.5,20)]
  ].map(a=>({id:a[0],name:a[1],desc:a[2],effect:a[3]}));

  const ACH = [
    ['a1','Ignition','Reach 1K energy',()=>GAME.resources.energy.a>=1e3],['a2','Grid Keeper','Own 10 Solar Arrays',()=>count('solarArray')>=10],['a3','First Plasma','Unlock Plasma',()=>GAME.resources.plasma.unlocked],['a4','Containment','Own an Antimatter Condenser',()=>count('antimatterCondenser')>=1],['a5','Midnight Lens','Unlock Dark Matter',()=>GAME.resources.darkMatter.unlocked],
    ['a6','Probability Bleed','Unlock Quantum Particles',()=>GAME.resources.quantumParticles.unlocked],['a7','Broken Rules','Unlock Exotic Matter',()=>GAME.resources.exoticMatter.unlocked],['a8','Timewright','Unlock Spacetime Flux',()=>GAME.resources.spacetimeFlux.unlocked],['a9','Crucible','Unlock Singularity Cores',()=>GAME.resources.singularityCores.unlocked],['a10','Vacuum Cartographer','Unlock Vacuum Essence',()=>GAME.resources.vacuumEssence.unlocked],
    ['a11','Beyond One Universe','Unlock Multiversal Fragments',()=>GAME.resources.multiversalFragments.unlocked],['a12','Orbital Nation','Unlock Earth Orbit',()=>GAME.regions.earthOrbit],['a13','Red Dust Charter','Unlock Mars Colony',()=>GAME.regions.marsColony],['a14','Dyson Foreman','Unlock Dyson Zone',()=>GAME.regions.dysonZone],['a15','Event Diver','Unlock Event Horizon Perimeter',()=>GAME.regions.eventPerimeter],
    ['a16','Automata','Unlock automation',()=>GAME.automation.unlocked],['a17','Scholar','Complete 5 research nodes',()=>doneResearch().length>=5],['a18','Grand Theory','Complete 12 research nodes',()=>doneResearch().length>=12],['a19','Stormwatch','See 10 anomalies',()=>GAME.stats.anomaliesSeen>=10],['a20','Codex I','10 codex entries',()=>GAME.codex.length>=10],
    ['a21','Codex II','25 codex entries',()=>GAME.codex.length>=25],['a22','Ascendant','Perform Civilization Ascension',()=>GAME.stats.ascensions>=1],['a23','Collapsed','Perform Reality Collapse',()=>GAME.stats.collapses>=1],['a24','Transcendent','Perform Multiversal Transcendence',()=>GAME.stats.transcends>=1],['a25','Infrastructure','Own 100 total buildings',()=>Object.values(GAME.buildings).reduce((a,b)=>a+b,0)>=100],
    ['a26','Heat Death Postponed','Keep entropy under 100 while having antimatter',()=>GAME.resources.antimatter.a>0&&GAME.resources.entropy.a<100],['a27','Hand of Dawn','Manual clicks 100',()=>GAME.stats.totalClicks>=100],['a28','Unknown Pattern','False vacuum stage >=3',()=>GAME.anomalies.falseVacuumStage>=3],['a29','Elsewhere','Unlock Fractured Continuum',()=>GAME.regions.fracturedContinuum],['a30','Machine with Missing Parts','Unlock survey plane',()=>GAME.regions.surveyPlane]
  ].map(a=>({id:a[0],name:a[1],desc:a[2],done:a[3]}));

  let temporaryBoosts = [];

  function initData() {
    BUILDINGS.forEach(b=>GAME.buildings[b.id]=0);
    CONVERSIONS.forEach(c=>GAME.conversions[c.id]={enabled:false,throttle:1});
    RESEARCH.forEach(r=>GAME.research[r.id]={done:false,progress:0});
    REGIONS.forEach((r,idx)=>GAME.regions[r.id]=idx===0);
    ACH.forEach(a=>GAME.achievements[a.id]=false);
    addCodex('Initialization','We began with copper, sunlight, and confidence.');
    renderTabs(); bindButtons(); loadGame();
  }

  function unlockRes(id){
    if (!GAME.resources[id].unlocked) {
      GAME.resources[id].unlocked = true;
      addCodex('Resource Unlock', `${pretty(id)} entered controlled supply.`);
      addFeed(`New resource unlocked: ${pretty(id)}.`);
    }
  }
  function doneResearch(){ return Object.entries(GAME.research).filter(([,v])=>v.done).map(([k])=>k); }
  function count(id){ return GAME.buildings[id]||0; }
  function gain(id,v){ const r=GAME.resources[id]; if(!r||v===0) return; r.a = clamp(r.a + v, 0, r.cap); }
  function spend(cost){ for (const k in cost){ if ((GAME.resources[k]?.a||0)<cost[k]) return false; } for (const k in cost) GAME.resources[k].a-=cost[k]; return true; }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  const pretty = s => s.replace(/([A-Z])/g,' $1').replace(/^./,m=>m.toUpperCase());

  function fmt(v){
    if (v<1000) return v.toFixed(v<10?2:v<100?1:0);
    const units=['K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
    let i=-1; while(v>=1000&&i<units.length-1){v/=1000;i++;}
    return `${v.toFixed(2)}${units[i]}`;
  }

  function buildingCost(b){
    const n=GAME.buildings[b.id]; const mult=Math.pow(b.scale,n);
    const out={}; for(const k in b.baseCost) out[k]=b.baseCost[k]*mult*(1-((GAME.prestige.ascensionUpgrades.cost||0)*0.02));
    return out;
  }

  function purchaseBuilding(id){
    const b=BUILDINGS.find(x=>x.id===id); if(!b) return;
    const cost=buildingCost(b); if(!spend(cost)) return;
    GAME.buildings[id]++; addFeed(`Built ${b.name} #${GAME.buildings[id]}.`);
  }

  function updateProduction(dt){
    GAME.multipliers.time = 1 + (GAME.prestige.collapseUpgrades.time||0)*0.02;
    GAME.multipliers.global = 1 + (GAME.prestige.ascensionUpgrades.power||0)*0.04;
    GAME.multipliers.conversion = 1 + (GAME.prestige.ascensionUpgrades.convert||0)*0.03 + (GAME.prestige.transcendUpgrades.metaConvert||0)*0.04;
    GAME.multipliers.research = 1 + (GAME.prestige.collapseUpgrades.research||0)*0.05;

    temporaryBoosts = temporaryBoosts.filter(t => t.expires > Date.now());
    const localBoost = key => temporaryBoosts.filter(t=>t.key===key).reduce((a,b)=>a*b.mult,1);
    const regionMult = key => Object.entries(GAME.regions).filter(([,v])=>v).reduce((acc,[id])=>acc * (REGIONS.find(r=>r.id===id).bonus[key]||1),1);

    const eff = GAME.multipliers.global * localBoost('global');
    let eGain=0, pGain=0, aGain=0, dGain=0, qGain=0, xGain=0, fGain=0, sGain=0, vGain=0, mGain=0;

    BUILDINGS.forEach(b=>{
      const n=GAME.buildings[b.id]; if(!n) return;
      const e=b.effects;
      if(e.energy) eGain += e.energy*n;
      if(e.plasma) pGain += e.plasma*n;
      if(e.antimatter) { aGain += e.antimatter*n; GAME.stabilities.antimatter += (e.instability||0)*n*dt; }
      if(e.darkMatter) dGain += e.darkMatter*n;
      if(e.quantumParticles) { qGain += e.quantumParticles*n; GAME.stabilities.decoherence += (e.decoherence||0)*n*dt; }
      if(e.exoticMatter) xGain += e.exoticMatter*n;
      if(e.spacetimeFlux) { fGain += e.spacetimeFlux*n; GAME.stabilities.temporalStress += (e.temporalStress||0)*n*dt; }
      if(e.singularityCores) sGain += e.singularityCores*n;
      if(e.vacuumEssence) { vGain += e.vacuumEssence*n; GAME.stabilities.vacuumInstability += (e.vacuumInstability||0)*n*dt; }
      if(e.multiversalFragments) mGain += e.multiversalFragments*n;
      if(e.credits) gain('credits',e.credits*n*dt);
      if(e.data) gain('data',e.data*n*dt*regionMult('data'));
      if(e.heat) gain('heat',e.heat*n*dt);
      if(e.alloys) gain('alloys',e.alloys*n*dt);
      if(e.stellarMaterials) gain('stellarMaterials',e.stellarMaterials*n*dt*regionMult('stellarMaterials'));
      if(e.researchPoints) gain('researchPoints',e.researchPoints*n*dt*GAME.multipliers.research*regionMult('research')*localBoost('research'));
      if(e.stabilizers) gain('stabilizers',e.stabilizers*n*dt);
      if(e.entropy) gain('entropy',e.entropy*n*dt);
      if(e.capEnergy) GAME.resources.energy.cap += e.capEnergy*n*0.01*dt;
      if(e.globalBoost) GAME.multipliers.global += e.globalBoost*n;
      if(e.conversionBoost) GAME.multipliers.conversion += e.conversionBoost*n;
      if(e.researchBoost) GAME.multipliers.research += e.researchBoost*n;
      if(e.timeBoost) GAME.multipliers.time += e.timeBoost*n;
    });

    if (GAME.regions.saturnLabs) {
      GAME.stabilities.antimatter*=0.996;
      GAME.stabilities.decoherence*=0.997;
      GAME.stabilities.vacuumInstability*=0.998;
    }

    const instabPenalty = 1 / (1 + GAME.stabilities.antimatter + GAME.stabilities.decoherence + GAME.stabilities.vacuumInstability + GAME.stabilities.temporalStress*0.5);
    const t = dt * GAME.multipliers.time * localBoost('time') * regionMult('time');

    gain('energy', eGain*t*eff*regionMult('energy'));
    gain('plasma', pGain*t*eff*instabPenalty*regionMult('plasma'));
    gain('antimatter', aGain*t*eff*instabPenalty);
    gain('darkMatter', dGain*t*eff*instabPenalty*regionMult('darkMatter'));
    gain('quantumParticles', qGain*t*eff*instabPenalty*regionMult('quantumParticles'));
    gain('exoticMatter', xGain*t*eff*instabPenalty*regionMult('exoticMatter'));
    gain('spacetimeFlux', fGain*t*eff*instabPenalty);
    gain('singularityCores', sGain*t*eff*instabPenalty*regionMult('singularityCores'));
    gain('vacuumEssence', vGain*t*eff*instabPenalty*regionMult('vacuumEssence'));
    gain('multiversalFragments', mGain*t*eff*instabPenalty*regionMult('multiversalFragments'));

    gain('credits', (2+count('solarArray')*0.2+count('orbitalCollector')*0.6)*t);
    gain('entropy', Math.max(0,(GAME.stabilities.antimatter*0.7 + GAME.stabilities.vacuumInstability*0.9 + GAME.stabilities.temporalStress*0.5)-count('riftAnchor')*0.06)*t);

    if (GAME.resources.darkMatter.a>5 && !GAME.resources.exoticMatter.unlocked) unlockRes('exoticMatter');
    if (GAME.resources.stellarMaterials.a>2 && !GAME.resources.stellarMaterials.unlocked) unlockRes('stellarMaterials');
    if (GAME.resources.stabilizers.a>1 && !GAME.resources.stabilizers.unlocked) unlockRes('stabilizers');
    if (GAME.resources.entropy.a>1 && !GAME.resources.entropy.unlocked) unlockRes('entropy');
  }

  function processConversions(dt){
    for (const c of CONVERSIONS){
      const state=GAME.conversions[c.id]; if(!state.enabled) continue;
      const x=dt*c.rate*state.throttle*GAME.multipliers.conversion;
      let can=true;
      for(const k in c.in){ if((GAME.resources[k]?.a||0) < c.in[k]*x){ can=false; break; } }
      if(!can) continue;
      for(const k in c.in) GAME.resources[k].a -= c.in[k]*x;
      for(const k in c.out) gain(k, c.out[k]*x);
      if(c.special) c.special(x);
    }
  }

  function processResearch(dt){
    if (!GAME.researchQueue.length) return;
    const id = GAME.researchQueue[0]; const node=RESEARCH.find(r=>r.id===id);
    const rs=GAME.research[id]; if(!node||rs.done){GAME.researchQueue.shift(); return;}
    rs.progress += dt*GAME.multipliers.research*(1+(GAME.prestige.ascensionUpgrades.research||0)*0.1);
    if (rs.progress >= node.time){
      rs.done=true; rs.progress=node.time; GAME.researchQueue.shift(); node.onDone();
      node.unlocks.forEach(u=>addCodex('Blueprint',`${pretty(u)} blueprint recovered.`));
      addFeed(`Research complete: ${node.name}.`);
      addCodex('Research', `${node.name}: ${node.desc}`);
    }
  }

  function canStartResearch(n){ return !GAME.research[n.id].done && !GAME.researchQueue.includes(n.id) && (!n.hiddenReq || n.hiddenReq()); }
  function startResearch(id){
    const n=RESEARCH.find(x=>x.id===id); if(!n||!canStartResearch(n)) return;
    if(!spend(n.cost)) return;
    GAME.researchQueue.push(id); addFeed(`Research queued: ${n.name}.`);
  }

  function unlockRegion(id){
    const r=REGIONS.find(x=>x.id===id); if(!r || GAME.regions[id]) return;
    if(!r.req()) return;
    if(!spend(r.cost)) return;
    GAME.regions[id]=true; addFeed(`Region unlocked: ${r.name}.`); addCodex('Expansion', `${r.name}: ${r.lore}`);
  }

  function runAnomalies(dt){
    GAME.anomalies.cooldown -= dt;
    const chanceBase = 0.008 * (GAME.regions.listeningPost?1.35:1) * (GAME.regions.darkObservatory?1.25:1);
    if(GAME.anomalies.cooldown<=0 && Math.random()<chanceBase*dt){
      const pool=ANOMALIES.filter(a => {
        if(a.id==='fractureWindow' && !GAME.resources.multiversalFragments.unlocked) return false;
        if(a.id==='falseVacuum' && !GAME.resources.vacuumEssence.unlocked) return false;
        return true;
      });
      const ev=pool[(Math.random()*pool.length)|0];
      ev.effect();
      GAME.stats.anomaliesSeen++;
      GAME.anomalies.cooldown = 20 + Math.random()*35;
      addFeed(`Anomaly: ${ev.name} — ${ev.desc}`);
      if(!GAME.discoveries[`anomaly_${ev.id}`]) {
        GAME.discoveries[`anomaly_${ev.id}`]=true;
        addCodex('Anomaly', `${ev.name}: ${ev.desc}`);
      }
    }
  }

  function tempBoost(key,mult,sec){ temporaryBoosts.push({key,mult,expires:Date.now()+sec*1000}); }

  function applyAutomation(){
    if(!GAME.automation.unlocked) return;
    const r=GAME.automation.rules;
    if(r.manual){ manualAction('solar'); manualAction('scan'); }
    if(r.autoBuy){
      const affordable = BUILDINGS.filter(b=>isUnlockedBuilding(b) && canAfford(buildingCost(b)) && GAME.resources.energy.a>r.keepEnergy).sort((a,b)=>totalCost(buildingCost(a))-totalCost(buildingCost(b)));
      if(affordable[0]) purchaseBuilding(affordable[0].id);
    }
    if(GAME.resources.plasma.a>r.plasmaThreshold) GAME.conversions.e_to_plasma.enabled=true;
    if(r.autoResearch && !GAME.researchQueue.length){ const next=RESEARCH.find(n=>canStartResearch(n)&&canAfford(n.cost)); if(next) startResearch(next.id); }
  }

  function manualAction(type){
    GAME.stats.totalClicks++;
    const m = 1+(GAME.prestige.ascensionUpgrades.manual||0)*0.35;
    if(type==='solar') { gain('energy', 12*m); gain('heat', 2*m); gain('credits', 4*m); }
    if(type==='plasma') { if(spend({energy:45,heat:15})) gain('plasma', 3*m); }
    if(type==='particle') { if(spend({plasma:6,data:8})) { gain('antimatter', 0.5*m); GAME.stabilities.antimatter += 0.02; } }
    if(type==='scan') { gain('data', 18*m); gain('researchPoints', 6*m); if(Math.random()<0.06*m) { gain('darkMatter',0.4); addFeed('Manual scan detected hidden mass echoes.'); } }
  }

  function canAfford(cost){ for(const k in cost) if((GAME.resources[k]?.a||0)<cost[k]) return false; return true; }
  function totalCost(cost){ return Object.values(cost).reduce((a,b)=>a+b,0); }

  function isUnlockedBuilding(b){
    if(b.tier==='early') return true;
    if(b.tier==='mid') return GAME.resources.plasma.unlocked;
    if(b.tier==='advanced') return GAME.resources.darkMatter.unlocked;
    if(b.tier==='late') return GAME.resources.singularityCores.unlocked;
    return true;
  }

  function prestigeGain(type){
    if(type==='ascend') return Math.floor(Math.pow((GAME.resources.energy.a + GAME.resources.plasma.a*50 + GAME.resources.antimatter.a*300)/50000,0.62) * (GAME.research.governance?.done?1.2:1));
    if(type==='collapse') return Math.floor(Math.pow((GAME.resources.darkMatter.a*300 + GAME.resources.quantumParticles.a*260 + GAME.resources.exoticMatter.a*420)/120000,0.65));
    return Math.floor(Math.pow((GAME.resources.vacuumEssence.a*900 + GAME.resources.multiversalFragments.a*1800 + GAME.resources.singularityCores.a*500)/600000,0.67));
  }

  function doPrestige(type){
    if(type==='ascend'){
      const g=prestigeGain('ascend'); if(g<1) return;
      GAME.resources.civilizationMarks.a += g; GAME.stats.ascensions++; addCodex('Ascension',`Civilization ascended; gained ${g} Civilization Marks.`);
      partialReset(1);
    }
    if(type==='collapse'){
      const g=prestigeGain('collapse'); if(g<1) return;
      GAME.resources.realityShards.a += g; GAME.stats.collapses++; addCodex('Reality Collapse',`Branch collapse yielded ${g} Reality Shards.`);
      partialReset(2);
    }
    if(type==='transcend'){
      const g=prestigeGain('transcend'); if(g<1) return;
      GAME.resources.multiversalFragments.a += g; GAME.stats.transcends++; addCodex('Transcendence',`Continuity fractured; ${g} fragments integrated.`);
      partialReset(3);
    }
  }

  function partialReset(level){
    const keepResearch = level>=2 || (GAME.prestige.ascensionUpgrades.keepResearch||0)>0;
    RESOURCE_ORDER.forEach(r=>{
      if(['civilizationMarks','realityShards'].includes(r)) return;
      if(level===3 && r==='multiversalFragments') return;
      GAME.resources[r].a = ['energy','credits'].includes(r) ? 20*(1+(GAME.prestige.ascensionUpgrades.rebuild||0)*0.5) : 0;
      GAME.resources[r].unlocked = ['energy','credits','alloys','data','heat','researchPoints','civilizationMarks','realityShards'].includes(r);
    });
    Object.keys(GAME.buildings).forEach(k=>GAME.buildings[k]=0);
    Object.keys(GAME.conversions).forEach(k=>GAME.conversions[k].enabled=false);
    GAME.regions = {}; REGIONS.forEach((r,i)=>GAME.regions[r.id]=i===0);
    GAME.stabilities = { antimatter:0,darkDrift:0,decoherence:0,vacuumInstability:0,temporalStress:0,entropyPressure:0 };
    if(!keepResearch) Object.keys(GAME.research).forEach(k=>GAME.research[k]={done:false,progress:0});
    GAME.researchQueue=[];
  }

  function buyMeta(tree,key,cost){
    const cur=GAME.prestige[tree][key]||0;
    const price = Math.floor(cost*Math.pow(1.75,cur));
    const currency = tree==='ascensionUpgrades'?'civilizationMarks':tree==='collapseUpgrades'?'realityShards':'multiversalFragments';
    if(GAME.resources[currency].a < price) return;
    GAME.resources[currency].a -= price;
    GAME.prestige[tree][key]=cur+1;
  }

  function checkAchievements(){
    ACH.forEach(a=>{
      if(!GAME.achievements[a.id] && a.done()) { GAME.achievements[a.id]=true; addFeed(`Achievement unlocked: ${a.name}`); }
    });
  }

  function addCodex(title,text){
    GAME.codex.unshift({t:Date.now(),title,text});
    if(GAME.codex.length>200) GAME.codex.length=200;
  }
  function addFeed(text){
    const log = document.getElementById('feedLog');
    const div=document.createElement('div'); div.className='log-entry'; div.textContent=`[${new Date().toLocaleTimeString()}] ${text}`;
    log.prepend(div); while(log.children.length>120) log.removeChild(log.lastChild);
  }

  function runTick(){
    const now=Date.now(); const dt=Math.min(1.5,(now-GAME.lastTick)/1000); GAME.lastTick=now;
    updateProduction(dt); processConversions(dt); processResearch(dt); runAnomalies(dt); applyAutomation(); checkAchievements(); render();
    if(now-GAME.lastSave>10000){ saveGame(); GAME.lastSave=now; }
    GAME.stats.ticks++;
  }

  function renderTabs(){
    const tabs = document.getElementById('tabs');
    tabs.innerHTML = TABS.map((t,i)=>`<button class="tab ${i===0?'active':''}" data-tab="${t}">${pretty(t)}</button>`).join('');
    tabs.onclick = e => {
      const b=e.target.closest('.tab'); if(!b) return;
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); b.classList.add('active');
      document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
      document.getElementById(`panel-${b.dataset.tab}`).classList.add('active');
    };
  }

  function render(){
    renderResources(); renderInfrastructure(); renderConversions(); renderResearch(); renderExpansion(); renderAnomalies(); renderAutomation(); renderPrestige(); renderCodex(); renderAchievements(); renderStats();
    const era = !GAME.resources.plasma.unlocked?'Solar Ignition':!GAME.resources.darkMatter.unlocked?'Orbital Furnace':!GAME.resources.spacetimeFlux.unlocked?'Hidden Matter Era':!GAME.resources.vacuumEssence.unlocked?'Chronal Dominion':'Pre-Physical Cartography';
    document.getElementById('eraLabel').textContent = `Era: ${era}`;
  }

  function renderResources(){
    const el=document.getElementById('panel-resources');
    const manual = `<div class='card'><h4>Manual Operations</h4><div class='row'><button data-act='solar'>Channel Solar Energy</button><button data-act='plasma'>Calibrate Plasma Array</button><button data-act='particle'>Run Particle Burst</button><button data-act='scan'>Scan Anomaly</button></div><p class='small'>Manual actions are amplified by automation, marks, and temporal effects.</p></div>`;
    const list = RESOURCE_ORDER.filter(r=>GAME.resources[r].unlocked).map(r=>{
      const x=GAME.resources[r];
      return `<div class='card'><h4>${pretty(r)}</h4><div class='resource-line'><span>${fmt(x.a)}</span><span class='mini'>Cap ${fmt(x.cap)}</span></div><div class='progress'><span style='width:${Math.min(100,x.a/x.cap*100)}%'></span></div></div>`;
    }).join('');
    const stability = `<div class='card'><h4>Stability Matrix</h4>
      <div class='resource-line'><span>Antimatter Instability</span><span>${GAME.stabilities.antimatter.toFixed(2)}</span></div>
      <div class='resource-line'><span>Dark Observation Drift</span><span>${GAME.stabilities.darkDrift.toFixed(2)}</span></div>
      <div class='resource-line'><span>Quantum Decoherence</span><span>${GAME.stabilities.decoherence.toFixed(2)}</span></div>
      <div class='resource-line'><span>Vacuum Instability</span><span>${GAME.stabilities.vacuumInstability.toFixed(2)}</span></div>
      <div class='resource-line'><span>Temporal Stress</span><span>${GAME.stabilities.temporalStress.toFixed(2)}</span></div>
      <div class='resource-line'><span>Entropy Pressure</span><span>${GAME.stabilities.entropyPressure.toFixed(2)}</span></div>
    </div>`;
    el.innerHTML = `<div class='grid'>${manual}<div class='grid two'>${list}</div>${stability}</div>`;
    el.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>manualAction(b.dataset.act));
  }

  function renderInfrastructure(){
    const el=document.getElementById('panel-infrastructure');
    el.innerHTML = `<div class='grid two'>${BUILDINGS.map(b=>{
      const unlocked=isUnlockedBuilding(b); const cost=buildingCost(b);
      return `<div class='card ${unlocked?'':'locked'}'><h4>${b.name} <span class='badge'>${b.tier}</span></h4>
        <p class='small'>${b.desc}</p><p class='small'>Owned: ${GAME.buildings[b.id]}</p>
        <p class='small'>Cost: ${Object.entries(cost).map(([k,v])=>`${pretty(k)} ${fmt(v)}`).join(', ')}</p>
        <button ${unlocked?'':'disabled'} data-buy='${b.id}'>Construct</button></div>`;
    }).join('')}</div>`;
    el.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>purchaseBuilding(b.dataset.buy));
  }

  function renderConversions(){
    const el=document.getElementById('panel-conversions');
    el.innerHTML = `<div class='list'>${CONVERSIONS.map(c=>{
      const s=GAME.conversions[c.id];
      return `<div class='card'><h4>${c.name}</h4><p class='small'>${c.desc}</p>
      <p class='small'>Input: ${Object.entries(c.in).map(([k,v])=>`${fmt(v)}/${pretty(k)}`).join(' • ')}</p>
      <p class='small'>Output: ${Object.entries(c.out).map(([k,v])=>`${fmt(v)}/${pretty(k)}`).join(' • ')||'Special effect'}</p>
      <div class='row'><button data-conv='${c.id}'>${s.enabled?'Disable':'Enable'}</button>
      <label class='small'>Throttle <input data-throttle='${c.id}' type='range' min='0.1' max='2' step='0.1' value='${s.throttle}'/></label></div></div>`;
    }).join('')}</div>`;
    el.querySelectorAll('[data-conv]').forEach(b=>b.onclick=()=>GAME.conversions[b.dataset.conv].enabled=!GAME.conversions[b.dataset.conv].enabled);
    el.querySelectorAll('[data-throttle]').forEach(i=>i.oninput=()=>GAME.conversions[i.dataset.throttle].throttle=+i.value);
  }

  function renderResearch(){
    const el=document.getElementById('panel-research');
    el.innerHTML = `<div class='card'><h4>Research Queue</h4><p>${GAME.researchQueue.map(id=>RESEARCH.find(r=>r.id===id).name).join(' → ')||'No queued research'}</p></div>
    <div class='grid two'>${RESEARCH.filter(r=>!r.hiddenReq||r.hiddenReq()).map(r=>{
      const st=GAME.research[r.id];
      return `<div class='card ${st.done?'achievement done':''}'><h4>[${r.cat}] ${r.name}</h4><p class='small'>${r.desc}</p>
      <p class='small'>Cost: ${Object.entries(r.cost).map(([k,v])=>`${pretty(k)} ${fmt(v)}`).join(', ')}</p>
      <div class='progress'><span style='width:${st.progress/r.time*100}%'></span></div>
      <div class='row'><span class='small'>${st.done?'Completed':`Time ${st.progress.toFixed(1)} / ${r.time}s`}</span><button ${st.done?'disabled':''} data-r='${r.id}'>${GAME.researchQueue.includes(r.id)?'Queued':'Start'}</button></div></div>`;
    }).join('')}</div>`;
    el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>startResearch(b.dataset.r));
  }

  function renderExpansion(){
    const el=document.getElementById('panel-expansion');
    el.innerHTML = `<div class='grid two'>${REGIONS.map(r=>{
      const unlocked=GAME.regions[r.id];
      const can=r.req();
      return `<div class='card ${can?'':'locked'}'><h4>${r.name}</h4><p class='small'>${r.lore}</p>
      <p class='small'>Bonus: ${Object.entries(r.bonus).map(([k,v])=>`${pretty(k)} x${v}`).join(', ')}</p>
      <p class='small'>Cost: ${Object.entries(r.cost).map(([k,v])=>`${pretty(k)} ${fmt(v)}`).join(', ')||'None'}</p>
      <button ${unlocked||!can?'disabled':''} data-zone='${r.id}'>${unlocked?'Unlocked':'Unlock Region'}</button></div>`;
    }).join('')}</div>`;
    el.querySelectorAll('[data-zone]').forEach(b=>b.onclick=()=>unlockRegion(b.dataset.zone));
  }

  function renderAnomalies(){
    const el=document.getElementById('panel-anomalies');
    el.innerHTML = `<div class='card'><h4>Anomaly Engine</h4><p class='small'>Cooldown: ${Math.max(0,GAME.anomalies.cooldown).toFixed(1)}s</p>
    <p class='small'>Known anomalies: ${Object.keys(GAME.discoveries).filter(k=>k.startsWith('anomaly_')).length}/${ANOMALIES.length}</p>
    <button id='forceAnomaly'>Manual Deep Scan (cost: Data 200)</button></div>
    <div class='grid two'>${ANOMALIES.map(a=>`<div class='card ${GAME.discoveries[`anomaly_${a.id}`]?'':'locked'}'><h4>${a.name}</h4><p class='small'>${a.desc}</p></div>`).join('')}</div>`;
    el.querySelector('#forceAnomaly').onclick=()=>{ if(spend({data:200})) GAME.anomalies.cooldown=0; };
  }

  function renderAutomation(){
    const el=document.getElementById('panel-automation');
    const r=GAME.automation.rules;
    el.innerHTML = `<div class='card ${GAME.automation.unlocked?'':'locked'}'><h4>Autonomous Governance</h4>
      <p class='small'>${GAME.automation.unlocked?'Configure directives.':'Unlock via Automation research.'}</p>
      <div class='row'><label><input type='checkbox' id='autoManual' ${r.manual?'checked':''}/> Auto manual actions</label>
      <label><input type='checkbox' id='autoBuy' ${r.autoBuy?'checked':''}/> Auto-buy cheapest</label></div>
      <div class='row'><label><input type='checkbox' id='autoResearch' ${r.autoResearch?'checked':''}/> Auto research queue</label>
      <label class='small'>Energy reserve <input id='keepEnergy' type='number' value='${r.keepEnergy}'/></label></div>
      <div class='row'><label class='small'>Plasma threshold <input id='plasmaThreshold' type='number' value='${r.plasmaThreshold}'/></label></div></div>`;
    if(!GAME.automation.unlocked) return;
    ['autoManual','autoBuy','autoResearch'].forEach(id=>el.querySelector(`#${id}`).onchange=e=>{
      const map={autoManual:'manual',autoBuy:'autoBuy',autoResearch:'autoResearch'}; r[map[id]]=e.target.checked;
    });
    el.querySelector('#keepEnergy').onchange=e=>r.keepEnergy=+e.target.value;
    el.querySelector('#plasmaThreshold').onchange=e=>r.plasmaThreshold=+e.target.value;
  }

  function renderPrestige(){
    const el=document.getElementById('panel-prestige');
    const g1=prestigeGain('ascend'), g2=prestigeGain('collapse'), g3=prestigeGain('transcend');
    el.innerHTML = `<div class='grid two'>
      <div class='card'><h4>Civilization Ascension</h4><p class='small'>Resets infrastructure and regions. Retains permanent marks.</p><p>Gain: ${g1} Civilization Marks</p><button id='ascendBtn' ${g1<1?'disabled':''}>Ascend</button></div>
      <div class='card'><h4>Reality Collapse</h4><p class='small'>Deeper reset, grants shards, unlocks stronger permanence.</p><p>Gain: ${g2} Reality Shards</p><button id='collapseBtn' ${g2<1?'disabled':''}>Collapse</button></div>
      <div class='card'><h4>Multiversal Transcendence</h4><p class='small'>Late reset retaining select continuity structures.</p><p>Gain: ${g3} Multiversal Fragments</p><button id='transBtn' ${g3<1?'disabled':''}>Transcend</button></div>
    </div>
    <div class='grid two'>
      <div class='card'><h4>Marks Tree</h4><button data-meta='ascensionUpgrades:power:3'>Power Doctrine</button><button data-meta='ascensionUpgrades:convert:3'>Conversion Doctrine</button><button data-meta='ascensionUpgrades:manual:2'>Manual Doctrine</button><button data-meta='ascensionUpgrades:rebuild:3'>Rapid Rebuild</button><button data-meta='ascensionUpgrades:keepResearch:8'>Research Retention</button></div>
      <div class='card'><h4>Shards Tree</h4><button data-meta='collapseUpgrades:time:4'>Temporal Compression</button><button data-meta='collapseUpgrades:research:4'>Cognitive Acceleration</button></div>
      <div class='card'><h4>Continuity Tree</h4><button data-meta='transcendUpgrades:metaConvert:6'>Interbranch Conversion</button></div>
    </div>`;
    el.querySelector('#ascendBtn').onclick=()=>doPrestige('ascend');
    el.querySelector('#collapseBtn').onclick=()=>doPrestige('collapse');
    el.querySelector('#transBtn').onclick=()=>doPrestige('transcend');
    el.querySelectorAll('[data-meta]').forEach(b=>b.onclick=()=>{ const [tree,key,c]=b.dataset.meta.split(':'); buyMeta(tree,key,+c); });
  }

  function renderCodex(){
    document.getElementById('panel-codex').innerHTML = `<div class='list'>${GAME.codex.map(c=>`<div class='card'><h4>${c.title}</h4><p class='small'>${new Date(c.t).toLocaleString()}</p><p>${c.text}</p></div>`).join('')}</div>`;
  }

  function renderAchievements(){
    document.getElementById('panel-achievements').innerHTML = `<div class='grid two'>${ACH.map(a=>`<div class='card achievement ${GAME.achievements[a.id]?'done':''}'><h4>${a.name}</h4><p class='small'>${a.desc}</p><p>${GAME.achievements[a.id]?'Unlocked':'Locked'}</p></div>`).join('')}</div>`;
  }

  function renderStats(){
    document.getElementById('panel-stats').innerHTML = `<div class='card'><h4>Run Statistics</h4>
      <div class='resource-line'><span>Uptime</span><span>${fmt((Date.now()-GAME.startedAt)/1000)}s</span></div>
      <div class='resource-line'><span>Ticks</span><span>${fmt(GAME.stats.ticks)}</span></div>
      <div class='resource-line'><span>Manual Operations</span><span>${fmt(GAME.stats.totalClicks)}</span></div>
      <div class='resource-line'><span>Anomalies Seen</span><span>${fmt(GAME.stats.anomaliesSeen)}</span></div>
      <div class='resource-line'><span>Ascensions / Collapses / Transcendence</span><span>${GAME.stats.ascensions} / ${GAME.stats.collapses} / ${GAME.stats.transcends}</span></div>
    </div>`;
  }

  function bindButtons(){
    document.getElementById('saveBtn').onclick=()=>{saveGame(); addFeed('Manual save complete.');};
    document.getElementById('exportBtn').onclick=()=>navigator.clipboard.writeText(btoa(JSON.stringify(GAME))).then(()=>addFeed('Save string copied to clipboard.'));
    document.getElementById('importBtn').onclick=()=>{const s=prompt('Paste save string'); if(!s) return; try{Object.assign(GAME,JSON.parse(atob(s))); addFeed('Save imported.');}catch{addFeed('Import failed.');}};
    document.getElementById('resetBtn').onclick=()=>openConfirm('Hard Reset','Erase all progress permanently?',()=>{localStorage.removeItem('axiom_save_v1'); location.reload();});
  }

  function openConfirm(title,body,onConfirm){
    const m=document.getElementById('modal'); document.getElementById('modalTitle').textContent=title; document.getElementById('modalBody').textContent=body; m.showModal();
    document.getElementById('modalCancel').onclick=()=>m.close();
    document.getElementById('modalConfirm').onclick=()=>{m.close(); onConfirm();};
  }

  function saveGame(){
    localStorage.setItem('axiom_save_v1', JSON.stringify({ ...GAME, lastSeen: Date.now() }));
  }

  function loadGame(){
    try {
      const raw=localStorage.getItem('axiom_save_v1'); if(!raw) return;
      const parsed=JSON.parse(raw);
      mergeDeep(GAME, parsed);
      if(parsed.lastSeen){ applyOfflineProgress((Date.now()-parsed.lastSeen)/1000); }
      addFeed('Save loaded.');
    } catch { addFeed('No valid save found.'); }
  }

  function applyOfflineProgress(sec){
    const capped=Math.min(sec, 60*60*8);
    const eff=0.55 + (GAME.prestige.collapseUpgrades.time||0)*0.03;
    const chunk=0.5;
    let t=capped*eff;
    while(t>0){ const dt=Math.min(chunk,t); updateProduction(dt); processConversions(dt); processResearch(dt); t-=dt; }
    addFeed(`Offline progress simulated for ${Math.floor(capped)}s at ${Math.floor(eff*100)}% efficiency.`);
  }

  function mergeDeep(target, source){
    for (const key in source){
      if(source[key] && typeof source[key]==='object' && !Array.isArray(source[key])){ target[key] ??= {}; mergeDeep(target[key],source[key]); }
      else target[key]=source[key];
    }
  }

  initData(); render();
  setInterval(runTick, 200);
})();
