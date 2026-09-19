import { useState, useCallback, useRef, useEffect } from 'react';

export interface LogEntry {
  time: string;
  message: string;
  type: 'rx' | 'tx' | 'err' | 'info';
}

export interface TouchState {
  leftDouble: number;
  leftTriple: number;
  rightDouble: number;
  rightTriple: number;
}

export interface DeviceState {
  connected: boolean;
  loading: boolean;
  reconnecting: boolean;
  ancMode: number; // 1=Normal, 8=ANC, 2=Transparency
  eqPreset: number; // 0=Original, 1=DeepBass, 2=Serenade, 3=ClearBass
  features: Record<number, number>;
  bassIntensity: number;
  customEQ: number[]; // 6 bands
  touch: TouchState;
  volEnhancer: boolean; // Volume Enhancer toggle state
  battery: { left: number; right: number; case: number };
  charging: { left: number; right: number; case: number };
}

const initialState: DeviceState = {
  connected: false,
  loading: false,
  reconnecting: false,
  ancMode: 1,
  eqPreset: 0,
  features: {
    0x00: 0, 0x01: 0, 0x02: 0, 0x04: 0, 0x05: 0, 0x06: 0,
    0x08: 0, 0x09: 0, 0x0B: 0, 0x0C: 0, 0x0D: 0, 0x10: 0,
    0x11: 0, 0x18: 0, 0x1A: 0, 0x1B: 0, 0x1D: 0,
  },
  bassIntensity: 0,
  customEQ: [0, 0, 0, 0, 0, 0],
  touch: { leftDouble: 0, leftTriple: 0, rightDouble: 0, rightTriple: 0 },
  volEnhancer: false,
  battery: { left: -1, right: -1, case: -1 },
  charging: { left: -1, right: -1, case: -1 },
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export function useSerial() {
  const [state, setState] = useState<DeviceState>(initialState);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const portRef = useRef<any>(null);
  const seqRef = useRef(0);
  const rxBufferRef = useRef<number[]>([]);
  const stateRef = useRef(initialState);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isReconnectingRef = useRef(false);

  const updateState = useCallback((partial: Partial<DeviceState>) => {
    setState(prev => {
      const next = { ...prev, ...partial };
      stateRef.current = next;
      return next;
    });
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-200), { time, message, type }]);
  }, []);

  const sendRaw = useCallback(async (cat: number, sub: number, data: number[]) => {
    const port = portRef.current;
    if (!port || !port.writable) return;
    const dLen = data.length;
    const pkt = new Uint8Array(dLen + 9);
    pkt[0] = 0xAA;
    pkt[1] = dLen + 7;
    pkt[2] = 0x00;
    pkt[3] = 0x00;
    pkt[4] = cat;
    pkt[5] = sub;
    pkt[6] = seqRef.current++ & 0xFF;
    pkt[7] = dLen & 0xFF;
    pkt[8] = (dLen >> 8) & 0xFF;
    data.forEach((b, i) => pkt[i + 9] = b);
    const writer = port.writable.getWriter();
    await writer.write(pkt);
    writer.releaseLock();
    addLog('TX: ' + Array.from(pkt).map(b => b.toString(16).padStart(2, '0')).join(' '), 'tx');
  }, [addLog]);

  const send = useCallback(async (cat: number, sub: number, data: number[]) => {
    if (!portRef.current || !portRef.current.writable) {
      addLog('ERR: Connect first!', 'err');
      return;
    }
    await sendRaw(cat, sub, data);
  }, [sendRaw, addLog]);

  const handlePacket = useCallback((b: number[]) => {
    if (b.length < 9) return;
    const src = b[4], cmd = b[5];
    const payload = b.slice(9);
    const hex = b.map(x => x.toString(16).padStart(2, '0')).join(' ');
    addLog('RX: ' + hex, 'rx');

    if ((cmd & 0xF0) !== 0x80) return;

    switch (src) {
      case 0x00: { // Battery
        if (cmd === 0x81 && payload.length >= 5) {
          const left = payload[2];
          const right = payload[3];
          const caseLevel = payload[4];
          if (left <= 100 && right <= 100 && caseLevel <= 100) {
            updateState({ battery: { left, right, case: caseLevel } });
            addLog(`STATE: Battery L=${left}% R=${right}% Case=${caseLevel}%`, 'info');
          }
        }
        break;
      }
      case 0x0c: { // ANC
        if (payload.length >= 4) {
          const ancVal = payload[3];
          updateState({ ancMode: ancVal });
          const nameMap: Record<number, string> = { 0x01: 'Normal', 0x08: 'ANC On', 0x02: 'Transparency' };
          addLog(`STATE: ANC mode = ${nameMap[ancVal] ?? ancVal}`, 'info');
        }
        break;
      }
      case 0x0f: { // EQ
        if (payload.length >= 2) {
          const eqVal = payload[1];
          updateState({ eqPreset: eqVal });
          const names: Record<number, string> = { 0: 'Original', 1: 'Deep Bass', 2: 'Serenade', 3: 'Clear Bass' };
          addLog(`STATE: EQ preset = ${names[eqVal] ?? eqVal}`, 'info');
        }
        break;
      }
      case 0x10: { // Volume Enhancer
        if (payload.length >= 2) {
          const volVal = payload[1];
          updateState({ volEnhancer: volVal === 0x01 });
          addLog(`STATE: Volume Enhancer = ${volVal === 0x01 ? 'On' : 'Off'}`, 'info');
        }
        break;
      }
      case 0x0d: {
        if (payload.length < 4) break;
        const count = payload[1];
        const newFeatures = { ...stateRef.current.features };
        for (let i = 0; i < count; i++) {
          const fid = payload[2 + i * 2];
          const fval = payload[3 + i * 2];
          if (fid === 0x00) continue;
          newFeatures[fid] = fval;
        }
        updateState({ features: newFeatures });
        addLog(`STATE: Feature map loaded (${count} features)`, 'info');
        break;
      }
      case 0x22: {
        if (payload.length >= 33) {
          const offsets = [17, 20, 23, 26, 29, 32];
          const s8 = (x: number) => x < 128 ? x : x - 256;
          const bands = offsets.map(o => s8(payload[o]));
          updateState({ customEQ: bands });
          addLog(`STATE: Custom EQ = [${bands.map(v => (v >= 0 ? '+' : '') + v).join(', ')}] dB`, 'info');
        }
        break;
      }
      case 0x08: {
        if (payload.length < 4) break;
        const count = payload[1];
        const entries = payload.slice(2);
        const touchMap: Record<string, number> = {};
        for (let i = 0; i < count; i++) {
          const e = entries.slice(i * 4, i * 4 + 4);
          if (e.length < 4) break;
          const side = e[0];
          const taps = e[2];
          const action = e[3];
          touchMap[`${side}-${taps}`] = action;
        }
        updateState({
          touch: {
            leftDouble: touchMap['1-2'] ?? 0,
            leftTriple: touchMap['1-3'] ?? 0,
            rightDouble: touchMap['2-2'] ?? 0,
            rightTriple: touchMap['2-3'] ?? 0,
          }
        });
        addLog('STATE: Touch controls loaded', 'info');
        break;
      }
      case 0x24: {
        if (payload.length >= 4) {
          let val = payload[3];
          val = val > 127 ? val - 256 : val;
          updateState({ bassIntensity: val });
          addLog(`STATE: Dynamic Bass intensity = ${val}`, 'info');
        }
        break;
      }
      case 0x09: {
        if (payload.length >= 2) {
          const count = payload[1];
          const newCharging = { ...stateRef.current.charging };
          for (let i = 0; i < count; i++) {
            const key = payload[2 + i * 2];
            const val = payload[3 + i * 2];
            if (key === 0x01) newCharging.left = val;
            else if (key === 0x02) newCharging.right = val;
            else if (key === 0x03) newCharging.case = val;
          }
          updateState({ charging: newCharging });
          addLog(`STATE: Charging L=${newCharging.left} R=${newCharging.right} Case=${newCharging.case}`, 'info');
        }
        break;
      }
    }
  }, [addLog, updateState]);

  const processRxBuffer = useCallback(() => {
    const buf = rxBufferRef.current;
    while (buf.length >= 9) {
      if (buf[0] !== 0xAA) { buf.shift(); continue; }
      const totalLen = buf[1] + 2;
      if (buf.length < totalLen) break;
      const pkt = buf.splice(0, totalLen);
      handlePacket(pkt);
    }
  }, [handlePacket]);

  const readLoop = useCallback(async () => {
    const port = portRef.current;
    while (port && port.readable) {
      const reader = port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          for (const byte of value) rxBufferRef.current.push(byte);
          processRxBuffer();
        }
      } catch (e: any) {
        addLog('RX error: ' + e.message, 'err');
      } finally {
        reader.releaseLock();
      }
    }
    // Port became unreadable — if we were connected, trigger auto-reconnect
    if (stateRef.current.connected && !isReconnectingRef.current) {
      addLog('Connection lost. Will attempt to reconnect…', 'info');
      handleDisconnect();
    }
  }, [processRxBuffer, addLog]); // eslint-disable-line react-hooks/exhaustive-deps

  const requestAllState = useCallback(async () => {
    updateState({ loading: true });
    await sleep(100);

    const queries: [number, number[]][] = [
      [0x00, []],                // Battery
      [0x0c, [0x01, 0x01]],      // True ANC
      [0x0f, []],                // True EQ
      [0x10, []],                // True Vol Enhancer
      [0x09, []],                // Charging state
      [0x0d, [0x10, 0x07, 0x06, 0x04, 0x05, 0x0B, 0x08, 0x11, 0x13, 0x18, 0x09, 0x1A, 0x0C, 0x1D, 0x1B, 0x36, 0x26]],
      [0x22, []],
      [0x08, [0x0E, 0x01, 0x03, 0x04, 0x05, 0x06, 0x0B, 0x0C, 0x08, 0x0D, 0x11, 0x1F, 0x1A, 0x1B, 0x00]],
      [0x24, []],
      [0x0d, [0x01, 0x06]],
    ];

    for (const [src, payload] of queries) {
      await sendRaw(src, 0x01, payload);
      await sleep(80);
    }

    await sleep(300);
    updateState({ loading: false });
    addLog('Device state loaded.', 'info');
  }, [sendRaw, updateState, addLog]);

  // Close the current port safely
  const closePort = useCallback(async () => {
    const port = portRef.current;
    if (!port) return;
    try {
      if (port.readable) {
        const reader = port.readable.getReader();
        await reader.cancel();
        reader.releaseLock();
      }
    } catch { /* already closed */ }
    try {
      if (port.writable) {
        const writer = port.writable.getWriter();
        await writer.close();
        writer.releaseLock();
      }
    } catch { /* already closed */ }
    try { await port.close(); } catch { /* already closed */ }
  }, []);

  // Attempt to reopen the same port after device restarts (e.g. HD Sound toggle)
  const attemptReconnect = useCallback(async () => {
    const port = portRef.current;
    if (!port) return;
    isReconnectingRef.current = true;
    updateState({ reconnecting: true, connected: false });
    addLog('Attempting to reconnect…', 'info');

    // Close whatever is left open on the port
    await closePort();

    const MAX_ATTEMPTS = 15;
    const INTERVAL_MS = 2000;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      await sleep(INTERVAL_MS);
      try {
        await port.open({ baudRate: 115200 });
        // Success!
        isReconnectingRef.current = false;
        rxBufferRef.current = [];
        updateState({ connected: true, reconnecting: false });
        addLog(`Reconnected on attempt ${attempt}!`, 'info');
        readLoop();
        await requestAllState();
        return;
      } catch {
        addLog(`Reconnect attempt ${attempt}/${MAX_ATTEMPTS} – device not ready`, 'info');
      }
    }

    // All attempts exhausted
    isReconnectingRef.current = false;
    updateState({ reconnecting: false, connected: false });
    addLog('Reconnection failed after all attempts.', 'err');
  }, [closePort, readLoop, requestAllState, updateState, addLog]);

  // Called when the connection drops unexpectedly
  const handleDisconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    updateState({ connected: false });
    // Give the device a moment to reboot before trying
    reconnectTimerRef.current = setTimeout(() => {
      attemptReconnect();
    }, 3000);
  }, [attemptReconnect, updateState]);

  const connect = useCallback(async () => {
    try {
      const p = await (navigator as any).serial.requestPort();
      await p.open({ baudRate: 115200 });
      portRef.current = p;
      rxBufferRef.current = [];
      updateState({ connected: true, reconnecting: false });
      addLog('Port opened. Reading device state…', 'info');
      readLoop();
      await requestAllState();
      return true;
    } catch (e: any) {
      addLog('CONNECTION ERROR: ' + e.message, 'err');
      return false;
    }
  }, [readLoop, requestAllState, updateState, addLog]);

  // Cleanup reconnect timer on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  const setANC = useCallback(async (val: number) => {
    updateState({ ancMode: val });
    await send(0x04, 0x04, [0x01, 0x01, val]);
  }, [send, updateState]);

  const setEQ = useCallback(async (val: number) => {
    updateState({ eqPreset: val });
    await send(0x06, 0x04, [val]);
  }, [send, updateState]);

  const setVolEnhancer = useCallback(async (val: number) => {
    // Track state properly so the toggle can turn on AND off
    updateState({ volEnhancer: val === 1 });
    await send(0x07, 0x04, [val]);
  }, [send, updateState]);

  const setSys = useCallback(async (id: number, val: number) => {
    const newFeatures = { ...stateRef.current.features, [id]: val };
    updateState({ features: newFeatures });
    await send(0x03, 0x04, [id, val]);
    const keys = [0x00, 0x01, 0x02, 0x04, 0x05, 0x06, 0x08, 0x09, 0x0B, 0x0C, 0x0D, 0x10, 0x11, 0x18, 0x1A, 0x1B, 0x1D];
    const syncPayload: number[] = [17];
    for (const k of keys) {
      syncPayload.push(k);
      syncPayload.push(newFeatures[k] || 0);
    }
    setTimeout(() => send(0x03, 0x05, syncPayload), 50);
  }, [send, updateState]);

  const setDynamicBassIntensity = useCallback(async (val: number) => {
    updateState({ bassIntensity: val });
    const hexVal = val < 0 ? 256 + val : val;
    await send(0x08, 0x05, [0xFB, 0x05, hexVal]);
    setTimeout(() => send(0x1B, 0x04, [0xFB, 0x05, hexVal]), 50);
  }, [send, updateState]);

  const setCustomEQ = useCallback(async (bands: number[]) => {
    updateState({ customEQ: bands });
    const toHex = (v: number) => v < 0 ? 256 + v : v;
    const payload = [
      0x02, 0xFA, 0x06, 0x04, 0x07,
      0x43, 0x75, 0x73, 0x74, 0x6f, 0x6d, 0x31,
      0x06, 0x64, 0x00,
      toHex(bands[0]), 0xAA, 0x00,
      toHex(bands[1]), 0x90, 0x01,
      toHex(bands[2]), 0xCC, 0x10,
      toHex(bands[3]), 0x1C, 0x25,
      toHex(bands[4]), 0xE0, 0x2E,
      toHex(bands[5])
    ];
    await send(0x18, 0x04, payload);
  }, [send, updateState]);

  const applyTouch = useCallback(async (side: 1 | 2, doubleVal: number, tripleVal: number) => {
    await send(0x01, 0x04, [0x01, side, 0x01, 0x02, doubleVal]);
    await sleep(40);
    await send(0x01, 0x04, [0x01, side, 0x01, 0x03, tripleVal]);
    const sideLabel = side === 1 ? 'Left' : 'Right';
    addLog(`Applied ${sideLabel} ear: double=0x${doubleVal.toString(16)}, triple=0x${tripleVal.toString(16)}`, 'info');
  }, [send, addLog]);

  return {
    state,
    logs,
    connect,
    setANC,
    setEQ,
    setVolEnhancer,
    setSys,
    setDynamicBassIntensity,
    setCustomEQ,
    applyTouch,
  };
}
