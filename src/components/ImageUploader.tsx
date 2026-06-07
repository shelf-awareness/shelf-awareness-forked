'use client';

import React, { useState } from 'react';
import swal from 'sweetalert';
import Image from 'next/image';

type SessionUser = { id: string; email: string; randomKey: string };
type Props = { user?: SessionUser | null };

export default function ImageUploader({ user }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      swal('Invalid File', 'Please choose an image file.', 'error');
      return;
    }
    if (f.size > maxFileSize) {
      swal('File Too Large', 'File must be smaller than 5MB.', 'error');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!file) return swal('No File Selected', 'Please select a file to upload.', 'warning');
    if (!user?.email) return swal('Not Signed In', 'You must be signed in to upload.', 'warning');

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userEmail', user.email);

    try {
      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      swal('Upload Complete!', 'Your image has been uploaded successfully.', 'success');
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
      swal('Upload Failed', 'An error occurred during upload.', 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFile} />
      {preview && (
        <Image
          src={preview}
          alt="preview"
          width={120}
          height={120}
          style={{ objectFit: 'cover' }}
          unoptimized
        />
      )}
      <button type="button" onClick={handleUpload} disabled={!file || !user || uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}
