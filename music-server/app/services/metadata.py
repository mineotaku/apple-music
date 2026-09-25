import math
import struct
import io
import os
from typing import Dict, Any, Optional
import mutagen
from mutagen.id3 import ID3, APIC

def extract_audio_metadata(file_path: str) -> Dict[str, Any]:
    """
    Extracts ID3, Vorbis, or MP4 metadata using Mutagen (Section 5 of plan).
    """
    metadata = {
        "title": "Untitled Track",
        "artist": "Unknown Artist",
        "album": "Single",
        "duration": 180,
        "bitrate": "24-bit / 96kHz ALAC",
        "codec": "Apple Lossless",
        "genre": "Soundtrack",
        "release_year": 2026,
        "cover_gradient": ["#fa2d48", "#8b5cf6"],
        "has_artwork": False
    }

    try:
        audio = mutagen.File(file_path)
        if audio is not None:
            if audio.info:
                metadata["duration"] = int(getattr(audio.info, "length", 180))
                bitrate_kbps = getattr(audio.info, "bitrate", 0)
                if bitrate_kbps:
                    metadata["bitrate"] = f"{int(bitrate_kbps / 1000)} kbps"
                
                # Codec detection
                ext = os.path.splitext(file_path)[1].lower()
                if ext in [".flac", ".alac"]:
                    metadata["codec"] = "Apple Lossless"
                elif ext in [".m4a", ".aac"]:
                    metadata["codec"] = "AAC 256kbps"
                elif ext == ".mp3":
                    metadata["codec"] = "MP3 (LAME)"
                elif ext == ".wav":
                    metadata["codec"] = "Hi-Res PCM WAV"

            # Tags extraction
            tags = audio.tags
            if tags:
                if "TIT2" in tags:
                    metadata["title"] = str(tags["TIT2"])
                elif "title" in tags:
                    metadata["title"] = str(tags["title"][0])

                if "TPE1" in tags:
                    metadata["artist"] = str(tags["TPE1"])
                elif "artist" in tags:
                    metadata["artist"] = str(tags["artist"][0])

                if "TALB" in tags:
                    metadata["album"] = str(tags["TALB"])
                elif "album" in tags:
                    metadata["album"] = str(tags["album"][0])

                if "TCON" in tags:
                    metadata["genre"] = str(tags["TCON"])
                elif "genre" in tags:
                    metadata["genre"] = str(tags["genre"][0])
    except Exception as e:
        print(f"Metadata extraction fallback for {file_path}: {e}")

    # Fallback to filename if title is default
    if metadata["title"] == "Untitled Track":
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        parts = base_name.split("-")
        if len(parts) >= 2:
            metadata["artist"] = parts[0].strip()
            metadata["title"] = parts[1].strip()
        else:
            metadata["title"] = base_name

    return metadata


def generate_procedural_wav(bpm: int = 120, root_freq: float = 261.63, pattern: str = "synthwave", duration_seconds: int = 30) -> bytes:
    """
    Synthesizes a valid PCM WAV in memory for procedural lossless streaming.
    """
    sample_rate = 22050
    num_channels = 1
    bits_per_sample = 16
    num_samples = int(sample_rate * duration_seconds)
    data_size = num_samples * num_channels * (bits_per_sample // 8)

    buf = io.BytesIO()

    # RIFF Header
    buf.write(b"RIFF")
    buf.write(struct.pack("<I", 36 + data_size))
    buf.write(b"WAVE")

    # fmt Subchunk
    buf.write(b"fmt ")
    buf.write(struct.pack("<I", 16)) # Subchunk1Size
    buf.write(struct.pack("<H", 1))  # PCM
    buf.write(struct.pack("<H", num_channels))
    buf.write(struct.pack("<I", sample_rate))
    buf.write(struct.pack("<I", sample_rate * num_channels * (bits_per_sample // 8)))
    buf.write(struct.pack("<H", num_channels * (bits_per_sample // 8)))
    buf.write(struct.pack("<H", bits_per_sample))

    # data Subchunk
    buf.write(b"data")
    buf.write(struct.pack("<I", data_size))

    beat_duration = 60.0 / bpm
    scale = [1.0, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8, 2.0]
    minor_scale = [1.0, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5, 2.0]

    for i in range(num_samples):
        t = i / sample_rate
        current_beat = int(t / beat_duration)
        beat_phase = (t % beat_duration) / beat_duration

        sample = 0.0

        if pattern == "synthwave":
            note_idx = current_beat % 4
            freq = root_freq * minor_scale[note_idx % len(minor_scale)]
            envelope = math.exp(-beat_phase * 4)
            bass_freq = root_freq * 0.5
            sample += math.sin(2 * math.pi * freq * t) * 0.4 * envelope
            sample += math.sin(2 * math.pi * bass_freq * t) * 0.3
        elif pattern == "lofi":
            chord_idx = int(current_beat / 2) % 4
            chord_freqs = [root_freq, root_freq * 1.2, root_freq * 1.5]
            for cf in chord_freqs:
                sample += math.sin(2 * math.pi * cf * t) * 0.15
            if beat_phase < 0.2:
                sample += math.sin(2 * math.pi * 60 * (1 - beat_phase * 5) * t) * 0.3 * math.exp(-beat_phase * 10)
        elif pattern == "piano":
            notes = [0, 2, 4, 6, 4, 2]
            note_idx = notes[current_beat % len(notes)]
            freq = root_freq * scale[note_idx]
            env = math.exp(-beat_phase * 2.5)
            sample += math.sin(2 * math.pi * freq * t) * 0.35 * env
            sample += math.sin(2 * math.pi * freq * 2 * t) * 0.15 * env
        else:
            sample += math.sin(2 * math.pi * root_freq * t) * 0.25
            sample += math.sin(2 * math.pi * (root_freq * 1.5) * t) * 0.2

        # Clamp 16-bit
        sample = max(-1.0, min(1.0, sample))
        int_sample = int(sample * 32767)
        buf.write(struct.pack("<h", int_sample))

    return buf.getvalue()
