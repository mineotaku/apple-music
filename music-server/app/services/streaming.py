import os
from typing import Generator, Optional, Union
from fastapi import Request, Response, HTTPException
from fastapi.responses import StreamingResponse

CHUNK_SIZE = 512 * 1024 # 512 KB chunks for smooth seeking and bandwidth efficiency

def range_streamer(file_path: str, start: int, end: int, chunk_size: int = 64 * 1024) -> Generator[bytes, None, None]:
    with open(file_path, "rb") as f:
        f.seek(start)
        bytes_remaining = end - start + 1
        while bytes_remaining > 0:
            read_size = min(chunk_size, bytes_remaining)
            data = f.read(read_size)
            if not data:
                break
            bytes_remaining -= len(data)
            yield data

def stream_audio_file(request: Request, file_path_or_bytes: Union[str, bytes], content_type: str = "audio/wav") -> Response:
    if isinstance(file_path_or_bytes, bytes):
        audio_bytes = file_path_or_bytes
        total_size = len(audio_bytes)
        range_header = request.headers.get("Range")

        if not range_header:
            return Response(
                content=audio_bytes,
                status_code=200,
                media_type=content_type,
                headers={
                    "Accept-Ranges": "bytes",
                    "Content-Length": str(total_size),
                    "Cache-Control": "public, max-age=3600"
                }
            )

        # Parse range header e.g. "bytes=0-102400"
        try:
            range_val = range_header.replace("bytes=", "").strip()
            parts = range_val.split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if parts[1] else min(start + CHUNK_SIZE - 1, total_size - 1)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid Range header")

        if start >= total_size or end >= total_size or start > end:
            return Response(
                status_code=416,
                headers={"Content-Range": f"bytes */{total_size}"},
                content="Requested range not satisfiable"
            )

        chunk = audio_bytes[start : end + 1]
        return Response(
            content=chunk,
            status_code=206,
            media_type=content_type,
            headers={
                "Content-Range": f"bytes {start}-{end}/{total_size}",
                "Accept-Ranges": "bytes",
                "Content-Length": str(len(chunk)),
                "Cache-Control": "no-cache",
            }
        )

    # For local disk file
    file_path = file_path_or_bytes
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found on server")

    total_size = os.path.getsize(file_path)
    range_header = request.headers.get("Range")

    if not range_header:
        def full_file_gen():
            with open(file_path, "rb") as f:
                while chunk := f.read(CHUNK_SIZE):
                    yield chunk

        return StreamingResponse(
            full_file_gen(),
            status_code=200,
            media_type=content_type,
            headers={
                "Accept-Ranges": "bytes",
                "Content-Length": str(total_size),
                "Cache-Control": "public, max-age=3600"
            }
        )

    try:
        range_val = range_header.replace("bytes=", "").strip()
        parts = range_val.split("-")
        start = int(parts[0]) if parts[0] else 0
        end = int(parts[1]) if parts[1] else min(start + CHUNK_SIZE - 1, total_size - 1)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid Range header")

    if start >= total_size or end >= total_size or start > end:
        return Response(
            status_code=416,
            headers={"Content-Range": f"bytes */{total_size}"},
            content="Requested range not satisfiable"
        )

    chunk_length = end - start + 1
    return StreamingResponse(
        range_streamer(file_path, start, end),
        status_code=206,
        media_type=content_type,
        headers={
            "Content-Range": f"bytes {start}-{end}/{total_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_length),
            "Cache-Control": "no-cache",
        }
    )
