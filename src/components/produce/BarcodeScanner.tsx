'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { Button } from 'react-bootstrap';
import styles from '../../styles/barcode-scanner.module.css';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onDetected, onClose }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let isMounted = true;
    let scannerControls: IScannerControls | null = null;

    const startScan = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length) throw new Error('No camera found.');

        const firstDeviceId = devices[0].deviceId;

        scannerControls = await reader.decodeFromVideoDevice(
          firstDeviceId,
          videoRef.current!,
          (result: Result | undefined) => {
            if (result && isMounted) {
              onDetected(result.getText());
              scannerControls?.stop();
              onClose();
            }
          },
        );

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Error accessing camera');
        setLoading(false);
      }
    };

    startScan();

    return () => {
      isMounted = false;
      scannerControls?.stop();
    };
  }, [onDetected, onClose]);

  return (
    <div className={styles.container}>
      <h5>Scan a Barcode</h5>
      {error && <p className={styles.errorText}>{error}</p>}
      {loading && <p>Initializing camera...</p>}

      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video ref={videoRef} className={styles.video} />

      <Button onClick={onClose} className={styles.closeButton}>
        Close
      </Button>
    </div>
  );
};

export default BarcodeScanner;
