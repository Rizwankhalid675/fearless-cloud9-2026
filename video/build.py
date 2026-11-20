#!/usr/bin/env python3
"""
build.py — cut video/frames + video/audio into the demo video.

    python3 video/build.py

Reads video/shots.json (written by capture.mjs), which carries both the frame
list and the beat timing. The audio for each beat is laid at that beat's own
start time plus the head pad, so the voice always lands on the shot it
describes without anything being synced by hand.

Outputs video/fearless-demo.mp4 and video/fearless-demo.srt.
"""

import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
VIDEO = ROOT / "video"
OUT = VIDEO / "fearless-demo.mp4"
SRT = VIDEO / "fearless-demo.srt"
FPS = 30


def run(args, **kw):
    return subprocess.run(args, check=True, capture_output=True, text=True, **kw)


def srt_time(ms):
    h, ms = divmod(int(ms), 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def wrap(text, width=42):
    """Two short lines read better than one long one at the bottom of a video."""
    words, lines, cur = text.split(), [], ""
    for w in words:
        if len(cur) + len(w) + 1 > width and cur:
            lines.append(cur)
            cur = w
        else:
            cur = f"{cur} {w}".strip()
    if cur:
        lines.append(cur)
    # at most two lines per cue; longer blocks are split into several cues
    return lines


def main():
    manifest = json.loads((VIDEO / "shots.json").read_text())
    shots, beats = manifest["shots"], manifest["beats"]
    blocks = [b.strip() for b in (VIDEO / "narration-script.txt").read_text().split("\n\n") if b.strip()]
    if len(blocks) != len(beats):
        sys.exit(f"{len(blocks)} narration blocks but {len(beats)} beats")

    # ---- the picture: a concat list with one entry per frame
    concat = VIDEO / "concat.txt"
    lines = []
    for s in shots:
        path = (ROOT / s["file"]).resolve()
        lines.append(f"file '{path}'")
        lines.append(f"duration {s['ms'] / 1000:.3f}")
    lines.append(f"file '{(ROOT / shots[-1]['file']).resolve()}'")  # concat needs the last file twice
    concat.write_text("\n".join(lines) + "\n")

    silent = VIDEO / "silent.mp4"
    print("rendering picture…")
    run([
        "ffmpeg", "-y", "-loglevel", "error",
        "-f", "concat", "-safe", "0", "-i", str(concat),
        "-vf", f"fps={FPS},format=yuv420p",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-movflags", "+faststart",
        str(silent),
    ])

    # ---- the voice: each block delayed to its own beat
    print("laying narration…")
    inputs, filters, labels = [], [], []
    for i, b in enumerate(beats):
        wav = VIDEO / "audio" / f"{b['n']:02d}.wav"
        inputs += ["-i", str(wav)]
        delay = int(b["startMs"] + b["padHeadMs"])
        filters.append(f"[{i}:a]adelay={delay}|{delay},apad[a{i}]")
        labels.append(f"[a{i}]")
    total_ms = sum(s["ms"] for s in shots)
    # amix would duck each track as others start; sum them instead, since the
    # blocks never overlap.
    filters.append(
        "".join(labels)
        + f"amix=inputs={len(labels)}:normalize=0:duration=longest,"
        + f"atrim=0:{total_ms / 1000:.3f},loudnorm=I=-16:TP=-1.5:LRA=11,"
        # ElevenLabs returns 96kHz mono; YouTube wants ordinary 48kHz stereo
        + "aresample=48000,pan=stereo|c0=c0|c1=c0[out]"
    )
    voice = VIDEO / "voice.wav"
    run(["ffmpeg", "-y", "-loglevel", "error", *inputs,
         "-filter_complex", ";".join(filters), "-map", "[out]", str(voice)])

    print("muxing…")
    run([
        "ffmpeg", "-y", "-loglevel", "error",
        "-i", str(silent), "-i", str(voice),
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-shortest", str(OUT),
    ])

    # ---- subtitles, split so no cue is a wall of text
    cues, n = [], 1
    for b, text in zip(beats, blocks):
        start = b["startMs"] + b["padHeadMs"]
        sentences = [s.strip() for s in re.split(r"(?<=[.?!])\s+", text) if s.strip()]
        spoken = sum(len(s) for s in sentences) or 1
        t = start
        for sent in sentences:
            dur = b["narrationMs"] * len(sent) / spoken
            cues.append((n, t, t + dur, "\n".join(wrap(sent))))
            t += dur
            n += 1
    SRT.write_text(
        "\n\n".join(
            f"{i}\n{srt_time(a)} --> {srt_time(bb)}\n{txt}" for i, a, bb, txt in cues
        ) + "\n"
    )

    concat.unlink(missing_ok=True)
    silent.unlink(missing_ok=True)
    voice.unlink(missing_ok=True)

    dur = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=nw=1:nk=1", str(OUT)]).stdout.strip()
    mins, secs = divmod(float(dur), 60)
    print(f"\n{OUT.relative_to(ROOT)}  {int(mins)}:{secs:04.1f}  ({len(cues)} subtitle cues)")
    if float(dur) > 180:
        print("WARNING: over the 3:00 limit")


if __name__ == "__main__":
    main()
