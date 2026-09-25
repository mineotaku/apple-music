import os
import aiofiles
from fastapi import UploadFile
from typing import Optional, Tuple

UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "") or os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "songs")

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Warning: could not initialize Supabase client: {e}")

class StorageService:
    @staticmethod
    async def save_uploaded_file(file: UploadFile, subfolder: str = "songs") -> Tuple[str, str, int, Optional[str]]:
        """
        Saves an uploaded audio file into local uploads and Supabase Storage bucket.
        Returns: (local_file_path, storage_key, file_size, public_cdn_url)
        """
        target_dir = os.path.join(UPLOAD_DIR, subfolder)
        os.makedirs(target_dir, exist_ok=True)
        
        file_path = os.path.join(target_dir, file.filename)
        size = 0

        # Read file bytes
        file_bytes = await file.read()
        size = len(file_bytes)

        # 1. Save local copy for zero-latency / offline caching
        async with aiofiles.open(file_path, 'wb') as out_file:
            await out_file.write(file_bytes)

        storage_key = f"{subfolder}/{file.filename}"
        public_url = None

        # 2. Upload to Supabase Storage Bucket for global CDN streaming
        if supabase_client:
            try:
                # Ensure bucket exists
                try:
                    supabase_client.storage.get_bucket(SUPABASE_BUCKET)
                except Exception:
                    try:
                        supabase_client.storage.create_bucket(SUPABASE_BUCKET, options={"public": True})
                    except Exception:
                        pass

                # Upload to Supabase
                res = supabase_client.storage.from_(SUPABASE_BUCKET).upload(
                    path=storage_key,
                    file=file_bytes,
                    file_options={"content-type": file.content_type or "audio/mpeg", "upsert": "true"}
                )
                
                # Get public CDN URL for high-speed streaming
                public_url = supabase_client.storage.from_(SUPABASE_BUCKET).get_public_url(storage_key)
            except Exception as e:
                print(f"Notice: Supabase upload fallback to local storage: {e}")

        return file_path, storage_key, size, public_url

    @staticmethod
    def get_file_path(storage_key: str) -> str:
        return os.path.join(UPLOAD_DIR, storage_key)

    @staticmethod
    def delete_file(storage_key: str) -> bool:
        if supabase_client:
            try:
                supabase_client.storage.from_(SUPABASE_BUCKET).remove([storage_key])
            except Exception:
                pass

        path = os.path.join(UPLOAD_DIR, storage_key)
        if os.path.exists(path):
            try:
                os.remove(path)
                return True
            except OSError:
                return False
        return False
