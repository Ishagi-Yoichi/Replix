
export interface MetricsSnapshot {
    status: "UP" | "DOWN";
    slotLagBytes: number | null;
    eventsTotal: number;
    eventsPerSecond: number;
    dlqSize: number;
    lastLsn: string | null;
    uptimeMs: number;
  }
  
  export class Metrics {
    private eventsTotal = 0;
    private lastSecondCount = 0;
    private eventsPerSecond = 0;
    private lastLsn: string | null = null;
    private slotLagBytes: number | null = null;
    private dlqSize = 0;
    private startTime = Date.now();
    private status: "UP" | "DOWN" = "UP";
  
    incrementEvents(lsn: string) {
      this.eventsTotal++;
      this.lastSecondCount++;
      this.lastLsn = lsn;
    }
  
    updateSlotLag(bytes: number) {
      this.slotLagBytes = bytes;
    }
  
    updateDlqSize(size: number) {
      this.dlqSize = size;
    }
  
    setStatus(status: "UP" | "DOWN") {
      this.status = status;
    }
  
    tickRate() {
      this.eventsPerSecond = this.lastSecondCount;
      this.lastSecondCount = 0;
    }
  
    snapshot(): MetricsSnapshot {
      return {
        status: this.status,
        slotLagBytes: this.slotLagBytes,
        eventsTotal: this.eventsTotal,
        eventsPerSecond: this.eventsPerSecond,
        dlqSize: this.dlqSize,
        lastLsn: this.lastLsn,
        uptimeMs: Date.now() - this.startTime,
      };
    }
  }
  