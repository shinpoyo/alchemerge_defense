#!/usr/bin/env python3
"""
Alchemerge Defense — Offline External SFX Generator
Generates rich stereo mastered MP3 sound effects into sfx/*.mp3.
Any file in sfx/ can be replaced later with custom or third-party recordings.
"""
import math
import os
import subprocess
import tempfile
import wave
import numpy as np

SR = 44100
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "sfx")
os.makedirs(OUT_DIR, exist_ok=True)
RNG = np.random.default_rng(20261127)


def note(semi):
    return 440.0 * (2.0 ** (semi / 12.0))


def make_buf(dur):
    return np.zeros((2, int(SR * dur)), dtype=np.float64)


def add_mono(buf, sig, delay=0.0, gain=1.0, pan=0.0):
    s0 = int(delay * SR)
    if s0 >= buf.shape[1] or len(sig) == 0:
        return
    n = min(len(sig), buf.shape[1] - s0)
    ang = (pan + 1.0) * (math.pi / 4.0)
    buf[0, s0:s0 + n] += sig[:n] * (gain * math.cos(ang))
    buf[1, s0:s0 + n] += sig[:n] * (gain * math.sin(ang))


def env_ad(n, attack=0.005, curve=1.8):
    t = np.linspace(0.0, 1.0, n)
    a = max(1, int(attack * SR))
    e = np.empty(n, dtype=np.float64)
    if a < n:
        e[:a] = np.linspace(0.0, 1.0, a)
        rem = np.linspace(0.0, 1.0, n - a)
        e[a:] = (1.0 - rem) ** curve
    else:
        e[:] = np.linspace(0.0, 1.0, n)
    return e


def env_exp(n, attack=0.004, tau=0.25):
    t = np.arange(n, dtype=np.float64) / SR
    e = np.exp(-t / max(1e-4, tau))
    a = min(n, max(1, int(attack * SR)))
    e[:a] *= np.linspace(0.0, 1.0, a)
    # smooth tail fade
    tail = min(n // 4, int(0.02 * SR))
    if tail > 1:
        e[-tail:] *= np.linspace(1.0, 0.0, tail)
    return e


def lp1(sig, cutoff):
    """Simple 1-pole lowpass (cutoff can be scalar or array)."""
    out = np.empty_like(sig)
    if np.ndim(cutoff) == 0:
        a = 1.0 - math.exp(-2.0 * math.pi * float(cutoff) / SR)
        y = 0.0
        for i in range(len(sig)):
            y += a * (sig[i] - y)
            out[i] = y
    else:
        a = 1.0 - np.exp(-2.0 * math.pi * np.clip(cutoff, 30.0, SR * 0.45) / SR)
        y = 0.0
        for i in range(len(sig)):
            y += a[i] * (sig[i] - y)
            out[i] = y
    return out


def hp1(sig, cutoff):
    return sig - lp1(sig, cutoff)


def bp_noise(dur, f_start, f_end=None, attack=0.004, tau=None, q_passes=2):
    n = max(16, int(dur * SR))
    x = RNG.standard_normal(n)
    f1 = f_start if f_end is None else f_end
    fc = np.geomspace(max(40.0, f_start), max(40.0, f1), n)
    y = x
    for _ in range(q_passes):
        y = lp1(y, fc * 1.35)
        y = hp1(y, fc * 0.55)
    # Normalize filtered noise energy
    rms = np.sqrt(np.mean(y * y) + 1e-12)
    y = y / max(rms, 1e-4) * 0.25
    e = env_exp(n, attack, tau or (dur * 0.35))
    return y * e


def modal_bell(freq, dur, partials=None, attack=0.003, bright=1.0):
    """Realistic glass/bronze modal bell with inharmonic partials & fast upper decay."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float64) / SR
    if partials is None:
        # (ratio, amp, decay_scale)
        partials = [
            (1.000, 1.00, 1.00),
            (2.003, 0.48 * bright, 0.68),
            (2.997, 0.26 * bright, 0.48),
            (4.160, 0.16 * bright, 0.32),
            (5.430, 0.10 * bright, 0.22),
            (6.810, 0.06 * bright, 0.14),
        ]
    sig = np.zeros(n, dtype=np.float64)
    for ratio, amp, ds in partials:
        f = freq * ratio
        if f > SR * 0.45:
            continue
        # Subtle beating pair for shimmer
        phase = 2.0 * math.pi * f * t
        s = np.sin(phase) * 0.65 + np.sin(phase * 1.0012 + 0.4) * 0.35
        sig += s * amp * np.exp(-t / max(0.01, dur * 0.36 * ds))
    a = min(n, max(1, int(attack * SR)))
    sig[:a] *= np.linspace(0.0, 1.0, a)
    tail = min(n // 5, int(0.03 * SR))
    if tail > 1:
        sig[-tail:] *= np.linspace(1.0, 0.0, tail)
    return sig


def crystal_ping(freq, dur, attack=0.002):
    partials = [
        (1.000, 1.00, 1.00),
        (2.756, 0.45, 0.55),
        (5.404, 0.22, 0.30),
        (8.930, 0.09, 0.16),
    ]
    return modal_bell(freq, dur, partials=partials, attack=attack)


def sine_sweep(f0, f1, dur, attack=0.003, tau=None):
    n = max(16, int(dur * SR))
    f = np.geomspace(max(20.0, f0), max(20.0, f1), n)
    ph = np.cumsum(2.0 * math.pi * f / SR)
    return np.sin(ph) * env_exp(n, attack, tau or (dur * 0.35))


def brass_note(freq, dur, detune_cents=9.0, lp0=None, lp1_f=None, attack=0.045, vib=4.8):
    """Rich multi-voice detuned sawtooth brass with filter swell & vibrato."""
    n = max(16, int(dur * SR))
    t = np.arange(n, dtype=np.float64) / SR
    sig = np.zeros(n, dtype=np.float64)
    vib_mod = 1.0 + 0.006 * np.sin(2.0 * math.pi * vib * t) * np.clip(t / 0.25, 0.0, 1.0)
    for c in (-detune_cents, -detune_cents * 0.35, detune_cents * 0.35, detune_cents):
        fi = freq * (2.0 ** (c / 1200.0)) * vib_mod
        ph = np.cumsum(fi / SR)
        # Band-limited-ish soft saw via 10 harmonics
        v = np.zeros(n, dtype=np.float64)
        for h in range(1, 11):
            if freq * h > SR * 0.44:
                break
            v += np.sin(2.0 * math.pi * h * ph) / h
        sig += v * 0.25
    fc = np.geomspace(lp0 or freq * 1.8, lp1_f or min(SR * 0.4, freq * 6.5), n)
    sig = lp1(sig, fc)
    # Envelope with sustain & release
    e = np.ones(n, dtype=np.float64)
    a = min(n, max(1, int(attack * SR)))
    rel = min(n - a, max(1, int(dur * 0.38 * SR)))
    e[:a] = np.linspace(0.0, 1.0, a) ** 0.8
    if rel > 1:
        e[-rel:] = np.linspace(1.0, 0.0, rel) ** 1.7
    return sig * e


def taiko(dur=0.55, f0=110.0, f1=42.0):
    """Deep taiko / timpani hit with skin slap transient."""
    n = max(16, int(dur * SR))
    body = sine_sweep(f0, f1, dur, attack=0.002, tau=dur * 0.32)
    harm = sine_sweep(f0 * 1.52, f1 * 1.45, dur * 0.45, attack=0.002, tau=dur * 0.14)
    slap = bp_noise(0.14, 900, 220, attack=0.001, tau=0.035)
    out = np.zeros(n, dtype=np.float64)
    out[:len(body)] += body * 0.9
    out[:len(harm)] += harm * 0.32
    out[:len(slap)] += slap * 0.45
    return out


def hall_reverb(buf, wet=0.28, decay=0.62):
    """Lush dark stereo reverb (multi-tap early reflections + stereo feedback delays)."""
    if wet <= 0.0:
        return buf
    n = buf.shape[1]
    out = np.zeros_like(buf)
    # Early reflections
    taps_l = [(0.019, 0.42), (0.037, 0.32), (0.061, 0.24), (0.089, 0.18), (0.127, 0.13)]
    taps_r = [(0.023, 0.42), (0.043, 0.31), (0.067, 0.23), (0.097, 0.17), (0.139, 0.12)]
    for ch, taps in ((0, taps_l), (1, taps_r)):
        src = buf[ch] * 0.7 + buf[1 - ch] * 0.3
        # Darken reverb send
        dark = lp1(src, 3400.0)
        acc = np.zeros(n, dtype=np.float64)
        for dt, g in taps:
            d = int(dt * SR)
            if d < n:
                acc[d:] += dark[:n - d] * g
        # Two stereo comb loops with damping
        for dl_s, g0 in ((0.073 + ch * 0.007, decay * 0.72), (0.113 + ch * 0.011, decay * 0.64)):
            d = int(dl_s * SR)
            c = acc.copy()
            # Vectorized chunked feedback
            pos = d
            while pos < n:
                end = min(n, pos + d)
                c[pos:end] += c[pos - d:end - d] * g0
                pos = end
            acc += lp1(c, 2600.0) * 0.45
        out[ch] = buf[ch] * (1.0 - wet * 0.35) + acc * wet
    return out


def master_and_save(name, buf, wet=0.24, decay=0.58, target_db=-1.5):
    b = hall_reverb(buf, wet=wet, decay=decay)
    # Gentle warm soft-clipping
    b = np.tanh(b * 1.15) / math.tanh(1.15)
    # DC removal
    b[0] -= np.mean(b[0])
    b[1] -= np.mean(b[1])
    peak = np.max(np.abs(b))
    if peak > 1e-6:
        target = 10.0 ** (target_db / 20.0)
        b = b * (target / peak)
    # Short fade-out to avoid clicks
    fade = min(b.shape[1] // 8, int(0.015 * SR))
    if fade > 1:
        b[:, -fade:] *= np.linspace(1.0, 0.0, fade)
    pcm = np.clip(b * 32767.0, -32768, 32767).astype(np.int16)
    interleaved = np.empty(pcm.shape[1] * 2, dtype=np.int16)
    interleaved[0::2] = pcm[0]
    interleaved[1::2] = pcm[1]

    out_mp3 = os.path.join(OUT_DIR, f"{name}.mp3")
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tf:
        wav_path = tf.name
    try:
        with wave.open(wav_path, "wb") as wf:
            wf.setnchannels(2)
            wf.setsampwidth(2)
            wf.setframerate(SR)
            wf.writeframes(interleaved.tobytes())
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-codec:a", "libmp3lame", "-q:a", "4", out_mp3],
            check=True,
        )
    finally:
        if os.path.exists(wav_path):
            os.remove(wav_path)
    kb = os.path.getsize(out_mp3) / 1024.0
    print(f"  {name}.mp3  ({buf.shape[1]/SR:.2f}s, {kb:.1f} KB)")


# ======================== SFX RECIPES ========================

def gen_ui():
    b = make_buf(0.14)
    add_mono(b, crystal_ping(1180, 0.11), 0.0, 0.8)
    add_mono(b, bp_noise(0.025, 5800, 3200, tau=0.008), 0.0, 0.3)
    master_and_save("ui", b, wet=0.14, decay=0.35, target_db=-3.0)


def gen_pick():
    b = make_buf(0.18)
    add_mono(b, sine_sweep(540, 960, 0.11, tau=0.04), 0.0, 0.65)
    add_mono(b, crystal_ping(1320, 0.14), 0.01, 0.55, pan=0.12)
    add_mono(b, bp_noise(0.04, 4800, 7200, tau=0.015), 0.0, 0.25)
    master_and_save("pick", b, wet=0.18, decay=0.4, target_db=-2.5)


def gen_drop():
    b = make_buf(0.28)
    add_mono(b, taiko(0.22, 195, 72), 0.0, 0.9)
    add_mono(b, crystal_ping(660, 0.20), 0.005, 0.35, pan=-0.1)
    add_mono(b, bp_noise(0.07, 900, 350, tau=0.025), 0.0, 0.35)
    master_and_save("drop", b, wet=0.20, decay=0.42, target_db=-2.0)


def gen_spawn():
    b = make_buf(0.55)
    add_mono(b, sine_sweep(260, 520, 0.16, tau=0.06), 0.0, 0.55)
    add_mono(b, modal_bell(note(2), 0.50, bright=1.1), 0.015, 0.85, pan=-0.15)
    add_mono(b, crystal_ping(note(14), 0.42), 0.045, 0.45, pan=0.18)
    master_and_save("spawn", b, wet=0.30, decay=0.55, target_db=-2.0)


def gen_fail():
    b = make_buf(0.32)
    add_mono(b, sine_sweep(190, 125, 0.14, tau=0.06), 0.0, 0.75)
    add_mono(b, sine_sweep(148, 92, 0.18, tau=0.08), 0.10, 0.70)
    add_mono(b, bp_noise(0.08, 520, 260, tau=0.03), 0.0, 0.3)
    master_and_save("fail", b, wet=0.12, decay=0.3, target_db=-2.5)


def gen_merge(tier):
    # tier 1 (low), 2 (mid), 3 (high)
    dur = 1.05 + tier * 0.35
    b = make_buf(dur)
    # Magical intake whoosh
    add_mono(b, bp_noise(0.22, 500, 5400, attack=0.14, tau=0.09), 0.0, 0.55)
    # Alchemy impact thump
    add_mono(b, taiko(0.36, 135 - tier * 10, 44), 0.03, 0.85 + tier * 0.08)
    # Expanding harmonic bell chord
    chord = [0, 4, 7, 12, 16, 19][:3 + tier]
    base = tier * 2 - 10
    for i, n_semi in enumerate(chord):
        pan = ((i % 2) * 2 - 1) * min(0.45, 0.12 + i * 0.07)
        add_mono(b, modal_bell(note(n_semi + base), 0.85 + tier * 0.22, bright=1.05), 0.05 + i * 0.048, 0.65 / (1 + i * 0.1), pan=pan)
    if tier >= 2:
        add_mono(b, brass_note(note(base - 12), 0.95 + tier * 0.2, lp0=260, lp1_f=950, attack=0.16), 0.06, 0.32)
    if tier >= 3:
        add_mono(b, bp_noise(0.7, 6500, 9500, attack=0.18, tau=0.25), 0.18, 0.22)
    master_and_save(f"merge_{tier}", b, wet=0.32 + tier * 0.04, decay=0.62, target_db=-1.5)


def gen_disc():
    b = make_buf(2.45)
    # Warm shimmering chord swell
    for i, n_semi in enumerate([-10, -3, 2, 6]):
        add_mono(b, brass_note(note(n_semi), 2.1, lp0=480, lp1_f=2400, attack=0.26), 0.02, 0.24, pan=(i - 1.5) * 0.22)
    add_mono(b, taiko(0.55, 86, 44), 0.0, 0.72)
    # Sparkling ascending chime arpeggio
    for i, n_semi in enumerate([0, 4, 7, 11, 14, 19, 23, 26]):
        pan = math.sin(i * 0.9) * 0.45
        add_mono(b, crystal_ping(note(n_semi - 5), 1.35), 0.07 + i * 0.072, 0.55, pan=pan)
    add_mono(b, bp_noise(1.3, 7000, 10500, attack=0.35, tau=0.45), 0.25, 0.20)
    master_and_save("disc", b, wet=0.40, decay=0.70, target_db=-1.5)


def gen_moon_open():
    b = make_buf(2.6)
    for i, n_semi in enumerate([-15, -8, -3]):
        add_mono(b, brass_note(note(n_semi), 2.3, lp0=220, lp1_f=720, attack=0.55), 0.0, 0.25, pan=(i - 1) * 0.3)
    for i, n_semi in enumerate([19, 16, 12, 7, 4]):
        add_mono(b, modal_bell(note(n_semi), 1.55, bright=1.15), 0.14 + i * 0.125, 0.52, pan=(i - 2) * 0.22)
    add_mono(b, bp_noise(1.4, 7500, 9500, attack=0.45, tau=0.45), 0.12, 0.14)
    master_and_save("moon_open", b, wet=0.44, decay=0.72, target_db=-2.0)


def gen_moon_pick():
    b = make_buf(1.9)
    add_mono(b, bp_noise(0.28, 520, 6200, attack=0.18, tau=0.09), 0.0, 0.45)
    add_mono(b, taiko(0.45, 115, 42), 0.22, 0.78)
    for i, n_semi in enumerate([0, 4, 7, 11, 16]):
        add_mono(b, modal_bell(note(n_semi - 3), 1.45, bright=1.1), 0.26 + i * 0.055, 0.55, pan=(i - 2) * 0.22)
    for n_semi in (-10, -3, 2):
        add_mono(b, brass_note(note(n_semi), 1.5, lp0=650, lp1_f=2200, attack=0.18), 0.26, 0.20)
    master_and_save("moon_pick", b, wet=0.38, decay=0.66, target_db=-1.5)


def gen_kill():
    b = make_buf(0.18)
    add_mono(b, crystal_ping(820, 0.14), 0.0, 0.72)
    add_mono(b, sine_sweep(680, 240, 0.09, tau=0.03), 0.0, 0.55)
    add_mono(b, bp_noise(0.05, 4200, 1800, tau=0.016), 0.0, 0.35)
    master_and_save("kill", b, wet=0.18, decay=0.38, target_db=-2.0)


def gen_thud():
    b = make_buf(0.38)
    add_mono(b, taiko(0.34, 128, 38), 0.0, 1.0)
    add_mono(b, bp_noise(0.14, 1100, 260, tau=0.045), 0.0, 0.55)
    add_mono(b, crystal_ping(480, 0.15), 0.01, 0.28)
    master_and_save("thud", b, wet=0.22, decay=0.45, target_db=-1.5)


def gen_boom():
    b = make_buf(2.1)
    add_mono(b, taiko(0.95, 86, 26), 0.0, 1.05)
    add_mono(b, sine_sweep(58, 22, 1.05, attack=0.01, tau=0.38), 0.04, 0.85)
    add_mono(b, bp_noise(0.85, 1600, 140, attack=0.004, tau=0.26), 0.0, 0.85)
    add_mono(b, modal_bell(note(-19), 1.9, bright=0.75), 0.08, 0.58)
    master_and_save("boom", b, wet=0.38, decay=0.68, target_db=-1.0)


def gen_warn():
    b = make_buf(1.55)
    for i in range(3):
        t0 = i * 0.44
        add_mono(b, brass_note(note(-17), 0.34, lp0=420, lp1_f=1100, attack=0.03), t0, 0.65)
        add_mono(b, taiko(0.32, 76, 40), t0, 0.85)
    master_and_save("warn", b, wet=0.26, decay=0.52, target_db=-1.5)


def gen_king_intro():
    # Exact sync with 4.65s Night King cut-in timeline:
    # 0.00 / 0.42 / 0.84s: 3-pulse DANGER alarm
    # 1.32s: deep ominous rumble (silhouette phase)
    # 2.15s: massive flash reveal impact + dark brass chord + cathedral bells
    b = make_buf(4.65)
    for i in range(3):
        t0 = i * 0.42
        add_mono(b, brass_note(note(-17), 0.32, lp0=480, lp1_f=1400, attack=0.025), t0, 0.62, pan=(-0.15 if i % 2 else 0.15))
        add_mono(b, sine_sweep(note(-17), note(-12), 0.28, attack=0.02, tau=0.14), t0, 0.32)
        add_mono(b, taiko(0.32, 74, 38), t0, 0.82)
    # Phase 2: silhouette rumble (1.32s -> 2.15s)
    add_mono(b, sine_sweep(58, 32, 0.85, attack=0.06, tau=0.42), 1.32, 0.90)
    add_mono(b, bp_noise(0.82, 220, 680, attack=0.22, tau=0.38), 1.32, 0.55)
    add_mono(b, taiko(0.55, 68, 32), 1.35, 0.85)
    # Phase 3: 2.15s reveal boom + dark royal brass chord + cathedral bell
    add_mono(b, taiko(1.15, 72, 24), 2.15, 1.15)
    add_mono(b, taiko(0.85, 58, 22), 2.38, 0.85)
    add_mono(b, bp_noise(1.05, 1900, 150, attack=0.003, tau=0.34), 2.15, 0.88)
    for i, n_semi in enumerate([-26, -19, -14, -11]):
        add_mono(b, brass_note(note(n_semi), 2.25, detune_cents=12, lp0=320, lp1_f=1650, attack=0.06), 2.18 + i * 0.045, 0.44 - i * 0.04, pan=(i - 1.5) * 0.25)
    add_mono(b, modal_bell(note(-14), 2.35, bright=0.85), 2.20, 0.68, pan=-0.18)
    add_mono(b, modal_bell(note(-2), 2.10, bright=1.05), 2.38, 0.42, pan=0.22)
    master_and_save("king_intro", b, wet=0.40, decay=0.70, target_db=-1.0)


def gen_wave(boss=False):
    b = make_buf(1.95 if boss else 1.55)
    sh = -5 if boss else 0
    add_mono(b, brass_note(note(-31 + sh), 1.45, lp0=260, lp1_f=1100, attack=0.05), 0.0, 0.58, pan=-0.18)
    add_mono(b, brass_note(note(-24 + sh), 1.45, lp0=300, lp1_f=1300, attack=0.05), 0.14, 0.50, pan=0.18)
    if boss:
        add_mono(b, brass_note(note(-19 + sh), 1.55, lp0=320, lp1_f=1500, attack=0.06), 0.30, 0.44)
    add_mono(b, taiko(0.45, 96, 42), 0.0, 0.85)
    add_mono(b, taiko(0.40, 88, 40), 0.42, 0.72)
    if boss:
        add_mono(b, taiko(0.50, 78, 34), 0.84, 0.88)
        add_mono(b, taiko(0.55, 68, 30), 1.05, 0.92)
    master_and_save("wave_boss" if boss else "wave", b, wet=0.34, decay=0.60, target_db=-1.5)


def gen_wave_end():
    b = make_buf(1.45)
    add_mono(b, sine_sweep(note(-21), note(-21), 0.9, attack=0.03, tau=0.35), 0.0, 0.45)
    for i, n_semi in enumerate([0, 7, 12, 16]):
        add_mono(b, modal_bell(note(n_semi - 9), 1.1, bright=1.0), i * 0.085, 0.55, pan=(i - 1.5) * 0.2)
    master_and_save("wave_end", b, wet=0.36, decay=0.62, target_db=-2.0)


def gen_clear():
    b = make_buf(3.6)
    fanfare = [(-7, 0.0, 0.22), (-3, 0.20, 0.22), (0, 0.40, 0.22), (5, 0.60, 0.48), (2, 1.05, 0.22), (5, 1.25, 1.85)]
    for n_semi, t0, d in fanfare:
        add_mono(b, brass_note(note(n_semi), d, lp0=520, lp1_f=2600, attack=0.03), t0, 0.52, pan=-0.12)
        add_mono(b, brass_note(note(n_semi - 12), d, lp0=320, lp1_f=1400, attack=0.035), t0, 0.36, pan=0.12)
    for i, n_semi in enumerate([-19, -12, -7, -3]):
        add_mono(b, brass_note(note(n_semi), 2.2, lp0=420, lp1_f=2100, attack=0.25), 1.25, 0.22, pan=(i - 1.5) * 0.25)
    for i, n_semi in enumerate([5, 9, 12, 17, 21, 24, 29]):
        add_mono(b, crystal_ping(note(n_semi), 1.45), 1.30 + i * 0.085, 0.48, pan=math.sin(i * 0.85) * 0.45)
    add_mono(b, taiko(0.45, 98, 44), 0.0, 0.78)
    add_mono(b, taiko(0.45, 92, 42), 0.60, 0.78)
    add_mono(b, taiko(0.75, 80, 36), 1.25, 0.92)
    master_and_save("clear", b, wet=0.40, decay=0.68, target_db=-1.2)


def gen_over():
    b = make_buf(3.5)
    for i, n_semi in enumerate([0, -1, -5, -12]):
        add_mono(b, brass_note(note(n_semi - 19), 0.95, lp0=260, lp1_f=950, attack=0.06), i * 0.34, 0.48, pan=(i - 1.5) * 0.15)
    add_mono(b, modal_bell(note(-31), 2.1, bright=0.65), 1.30, 0.82)
    add_mono(b, taiko(0.85, 72, 28), 1.30, 0.90)
    master_and_save("over", b, wet=0.44, decay=0.72, target_db=-1.5)


def gen_ach():
    b = make_buf(1.55)
    for i, n_semi in enumerate([2, 9, 14]):
        add_mono(b, modal_bell(note(n_semi), 1.15, bright=1.1), i * 0.13, 0.58, pan=(i - 1) * 0.25)
    master_and_save("ach", b, wet=0.38, decay=0.64, target_db=-2.2)


def gen_leak():
    b = make_buf(1.65)
    add_mono(b, taiko(0.85, 84, 28), 0.0, 0.95)
    add_mono(b, bp_noise(0.55, 680, 140, attack=0.005, tau=0.22), 0.0, 0.62)
    add_mono(b, modal_bell(note(-22), 1.55, bright=0.75), 0.05, 0.62)
    master_and_save("leak", b, wet=0.38, decay=0.66, target_db=-1.5)


if __name__ == "__main__":
    print(f"Generating external SFX into {OUT_DIR} ...")
    gen_ui()
    gen_pick()
    gen_drop()
    gen_spawn()
    gen_fail()
    gen_merge(1)
    gen_merge(2)
    gen_merge(3)
    gen_disc()
    gen_moon_open()
    gen_moon_pick()
    gen_kill()
    gen_thud()
    gen_boom()
    gen_warn()
    gen_king_intro()
    gen_wave(False)
    gen_wave(True)
    gen_wave_end()
    gen_clear()
    gen_over()
    gen_ach()
    gen_leak()
    print("Done!")
