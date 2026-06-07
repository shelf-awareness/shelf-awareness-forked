'use client';

import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import swal from 'sweetalert';
import '@/styles/buttons.css';

interface UpdatePFPModalProps {
  show: boolean;
  onHide: () => void;
  onSaved: (newPfpURL: string) => void;
  currentPfpURL: string;
}

export default function UpdatePFPModal({
  show,
  onHide,
  onSaved,
  currentPfpURL,
}: UpdatePFPModalProps) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pfpURL, setPfpURL] = useState(currentPfpURL);

  useEffect(() => {
    if (show) {
      setPfpURL(currentPfpURL);
      setErr(null);
    }
  }, [show, currentPfpURL]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErr(null);

      const trimmedURL = pfpURL.trim();
      if (!trimmedURL) {
        setErr('Profile picture URL cannot be empty.');
        return;
      }

      // Basic URL validation
      try {
        new URL(trimmedURL);
      } catch {
        setErr('Please enter a valid URL.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/profile/update-pfp', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pfpURL: trimmedURL }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Failed to update profile picture');
        }

        onSaved(trimmedURL);
        swal('Success', 'Your profile picture has been updated', 'success', { timer: 2000 });
        onHide();
        router.refresh();
      } catch (error: unknown) {
        setErr(error instanceof Error ? error.message : 'Failed to update profile picture');
      } finally {
        setIsLoading(false);
      }
    },
    [onHide, onSaved, router, pfpURL],
  );

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Update Profile Picture</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Profile Picture URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/image.jpg"
              value={pfpURL}
              onChange={(e) => setPfpURL(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              Enter a direct link to an image (JPG, PNG, GIF, etc.)
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-between mt-4">
            <Button type="submit" className="btn-add" disabled={isLoading}>
              {isLoading ? 'Updating…' : 'Update Picture'}
            </Button>
            <Button variant="secondary" type="button" onClick={onHide}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}