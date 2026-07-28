import { GridData, GridDevice } from '@/hooks/useGridData';

export interface MapNode {
  id: string;
  x: number;
  y: number;
  type: string;
}

export class MapEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  data: GridData | null = null;
  nodes: MapNode[] = [];
  animationFrameId: number = 0;
  
  // Particles for power flow
  particles: { x: number, y: number, targetX: number, targetY: number, progress: number, speed: number, color: string }[] = [];
  
  // Rain particles
  rain: { x: number, y: number, speed: number, length: number }[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.initNodes();
    this.initRain();
  }

  initNodes() {
    // We will initialize nodes dynamically when data arrives in updateData
    this.nodes = [];
  }

  initRain() {
    for(let i=0; i<100; i++) {
       this.rain.push({
         x: Math.random() * 800,
         y: Math.random() * 600,
         speed: 10 + Math.random() * 15,
         length: 10 + Math.random() * 20
       });
    }
  }

  updateData(data: GridData) {
    this.data = data;
    
    // Build nodes dynamically if not built yet
    if (this.nodes.length === 0 && data.grid.devices) {
       const centerX = 400;
       const centerY = 300;
       
       this.nodes.push({ id: "bus", x: centerX, y: centerY, type: "Substation" });
       
       let houseCount = 0;
       let solarCount = 0;
       let othersCount = 0;
       
       for (const [id, dev] of Object.entries(data.grid.devices)) {
           if (id.startsWith("house_")) {
               const angle = Math.PI * (0.2 + (houseCount / 10) * 0.6);
               this.nodes.push({ id, x: centerX + Math.cos(angle) * 200, y: centerY + Math.sin(angle) * 200, type: "House" });
               houseCount++;
           } else if (id.startsWith("roof_solar_")) {
               const angle = Math.PI * (0.2 + (solarCount / 10) * 0.6);
               this.nodes.push({ id, x: centerX + Math.cos(angle) * 230, y: centerY + Math.sin(angle) * 230, type: "HouseSolar" });
               solarCount++;
           } else if (id.startsWith("batt_")) {
               this.nodes.push({ id, x: centerX - 120, y: centerY + 50, type: "BatteryBank" });
           } else if (id.startsWith("ev_")) {
               this.nodes.push({ id, x: centerX - 150, y: centerY - 50, type: "EVChargingStation" });
           } else if (id.startsWith("hosp_")) {
               this.nodes.push({ id, x: centerX, y: centerY - 100, type: "Hospital" });
           } else if (id.startsWith("fact_")) {
               this.nodes.push({ id, x: centerX + 150, y: centerY - 50, type: "Factory" });
           } else if (id.startsWith("agri_")) {
               this.nodes.push({ id, x: centerX + 200, y: centerY + 50, type: "Agri" });
           } else if (id.startsWith("solar_")) {
               this.nodes.push({ id, x: centerX + 250, y: centerY + 150, type: "SolarFarm" });
           } else if (id.startsWith("thermal_") || id.startsWith("nuke_")) {
               this.nodes.push({ id, x: centerX - 250, y: centerY - 200, type: "HeavyGen" });
           } else {
               const angle = Math.PI * 2 * (othersCount / 5);
               this.nodes.push({ id, x: centerX + Math.cos(angle) * 150, y: centerY + Math.sin(angle) * 150, type: "Other" });
               othersCount++;
           }
       }
    }
  }

  spawnParticle(node: MapNode, deviceData: GridDevice) {
    const isGenerating = deviceData.power_generated > 0;
    const isConsuming = deviceData.power_consumed > 0;
    if (!isGenerating && !isConsuming) return;
    
    // Random chance to spawn based on power amount (visual scaling)
    const power = Math.max(deviceData.power_generated, deviceData.power_consumed);
    // e.g. Factory 200kW spawns a lot, House 2kW spawns few
    if (Math.random() > (power / 300) && Math.random() > 0.05) return;

    const bus = this.nodes[0]; // Center
    
    const startX = isGenerating ? node.x : bus.x;
    const startY = isGenerating ? node.y : bus.y;
    const targetX = isGenerating ? bus.x : node.x;
    const targetY = isGenerating ? bus.y : node.y;

    this.particles.push({
      x: startX,
      y: startY,
      targetX,
      targetY,
      progress: 0,
      speed: 0.01 + (Math.random() * 0.01),
      color: isGenerating ? '#10b981' : '#f59e0b' // emerald for gen, amber for cons
    });
  }

  render() {
    // Clear
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Weather background effects
    if (this.data) {
       const { weather } = this.data;
       // Night overlay
       if (weather.time_of_day < 6 || weather.time_of_day > 18) {
          this.ctx.fillStyle = 'rgba(2, 6, 23, 0.4)'; // darker at night
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
       }
    }

    const bus = this.nodes[0];

    // Draw lines
    this.ctx.lineWidth = 2;
    this.nodes.forEach(node => {
      if (node.id === 'bus') return;
      this.ctx.beginPath();
      this.ctx.moveTo(bus.x, bus.y);
      this.ctx.lineTo(node.x, node.y);
      
      // Color line based on offline/online
      let isOnline = true;
      if (this.data && this.data.grid.devices[node.id]) {
         isOnline = this.data.grid.devices[node.id].is_online;
      }
      this.ctx.strokeStyle = isOnline ? 'rgba(51, 65, 85, 0.8)' : 'rgba(239, 68, 68, 0.5)'; // slate-700 or red
      this.ctx.stroke();
    });

    // Draw particles
    if (this.data) {
       this.nodes.forEach(node => {
          if (node.id === 'bus') return;
          const deviceData = this.data!.grid.devices[node.id];
          if (deviceData && deviceData.is_online) {
             this.spawnParticle(node, deviceData);
          }
       });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
       const p = this.particles[i];
       p.progress += p.speed;
       if (p.progress >= 1) {
          this.particles.splice(i, 1);
          continue;
       }
       const currentX = p.x + (p.targetX - p.x) * p.progress;
       const currentY = p.y + (p.targetY - p.y) * p.progress;
       
       this.ctx.beginPath();
       this.ctx.arc(currentX, currentY, 3, 0, Math.PI * 2);
       this.ctx.fillStyle = p.color;
       this.ctx.shadowBlur = 10;
       this.ctx.shadowColor = p.color;
       this.ctx.fill();
       this.ctx.shadowBlur = 0; // reset
    }

    // Draw nodes
    this.nodes.forEach(node => {
       let color = '#94a3b8'; // default slate
       let radius = 10;
       let text = '';
       
       if (this.data && node.id !== 'bus') {
           const dev = this.data.grid.devices[node.id];
           if (!dev) return;

           if (!dev.is_online) {
               color = '#ef4444'; // red offline
           } else if (dev.power_generated > 0) {
               color = '#10b981'; // emerald
           } else if (dev.power_consumed > 0) {
               color = '#f59e0b'; // amber
           } else {
               color = '#3b82f6'; // blue idle
           }
           
           if (node.type === 'Hospital') { radius = 15; text = 'H'; }
           if (node.type === 'Factory') { radius = 14; text = 'F'; }
           if (node.type === 'SolarFarm') { radius = 18; text = '☀️'; }
           if (node.type === 'WindFarm') { radius = 18; text = '🌬️'; }
           if (node.type === 'HeavyGen') { radius = 20; text = '🏭'; }
           if (node.type === 'BatteryBank') { radius = 14; text = '🔋'; }
           if (node.type === 'EVChargingStation') { radius = 12; text = '⚡'; }
           if (node.type === 'House') { radius = 8; }
           if (node.type === 'HouseSolar') { radius = 10; text = '☀️'; }
           if (node.type === 'Agri') { radius = 12; text = '🌾'; }
       } else if (node.id === 'bus') {
           color = '#a855f7'; // purple substation
           radius = 20;
       }

       this.ctx.beginPath();
       this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
       this.ctx.fillStyle = color;
       this.ctx.fill();
       this.ctx.strokeStyle = '#1e293b'; // border
       this.ctx.lineWidth = 2;
       this.ctx.stroke();

       if (text) {
           this.ctx.fillStyle = '#ffffff';
           this.ctx.font = '12px Arial';
           this.ctx.textAlign = 'center';
           this.ctx.textBaseline = 'middle';
           this.ctx.fillText(text, node.x, node.y);
       }
    });

    // Draw rain if cyclone/storm/heavy rain
    if (this.data && ['Cyclone', 'Storm', 'Heavy Rain'].includes(this.data.weather.condition)) {
       this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
       this.ctx.lineWidth = 1;
       this.rain.forEach(r => {
           this.ctx.beginPath();
           this.ctx.moveTo(r.x, r.y);
           this.ctx.lineTo(r.x - 5, r.y + r.length);
           this.ctx.stroke();
           
           r.x -= 2;
           r.y += r.speed;
           if (r.y > 600) {
               r.y = -20;
               r.x = Math.random() * 800 + 100; // start a bit to the right to fall left
           }
       });
    }

    this.animationFrameId = requestAnimationFrame(() => this.render());
  }

  start() {
    this.render();
  }

  stop() {
    cancelAnimationFrame(this.animationFrameId);
  }
}
