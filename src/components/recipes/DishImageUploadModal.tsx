/* eslint-disable react/jsx-no-bind */

'use client';

import React, { useState } from 'react';
import { Modal, Button, Form, ProgressBar } from 'react-bootstrap';
import swal from 'sweetalert';
import Image from 'next/image';

type Props = {
  show: boolean;
  onHide: () => void;
  recipeId: number;
  recipeTitle: string;
  userEmail: string | null;
};

export default function DishImageUploadModal({
  show,
  onHide,
  recipeId,
  recipeTitle,
  userEmail,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const maxFileSize = 5 * 1024 * 1024;

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

  function handleClose() {
    setFile(null);
    setPreview(null);
    setProgress(0);
    onHide();
  }

  async function handleUpload() {
  if (!file) return alert('Select a file');
  if (!userEmail) return alert('Must be signed in');

  setUploading(true);

  // Convert file to Base64 temporarily for testing  
  const reader = new FileReader();
  reader.onloadend = async () => {
    const url = reader.result as string;

    try {
      await fetch('/api/recipe-images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId,
          userEmail,
          name: file.name,
          url,
        }),
      });
      alert('Upload complete!');
      handleClose();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  reader.readAsDataURL(file); // converts image to base64 for now
}


  return (
    <Modal show={show} onHide={handleClose} centered size="lg" fullscreen="sm-down">
      <Modal.Header closeButton>
        <Modal.Title>
          Share Your
          {' '}
          {recipeTitle}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Upload Photo</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={uploading}
            />
            <Form.Text className="text-muted">
              Maximum file size: 5MB. Accepted formats: JPG, PNG, GIF, WebP
            </Form.Text>
          </Form.Group>

          {preview && (
            <div className="mb-3 text-center">
              <Image
                src={preview}
                alt="preview"
                width={400}
                height={300}
                style={{ objectFit: 'cover', borderRadius: '8px', maxWidth: '100%', height: 'auto' }}
                unoptimized
              />
            </div>
          )}

          {uploading && (
            <ProgressBar
              now={progress}
              label={`${progress}%`}
              animated
              className="mb-3"
            />
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={handleUpload}
          disabled={!file || !userEmail || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
