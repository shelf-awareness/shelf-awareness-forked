'use client';

import { useState } from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { GeoAlt, Envelope, Github } from 'react-bootstrap-icons';
import Link from 'next/link';

const Footer = () => {
  const [imgSrc, setImgSrc] = useState('/shelf-awareness-logo.png');
  const currentYear = new Date().getFullYear();

  return (
<footer className="navandfooter mt-auto pt-3 pt-md-5">

  <Container>
    <Row className="justify-content-center text-center text-md-start gy-3 gy-md-4">

      {/* Company Info */}
      <Col md={4} lg={3}>
        <Link
          href="/"
          className={
            'nav-link p-0 d-inline-flex align-items-center ' +
            'justify-content-center justify-content-md-start gap-2 py-1'
          }
        >
          <div
            className="p-1 rounded"
            style={{ backgroundColor: 'var(--timberwolf)' }}
          >
            <Image
              src={imgSrc}
              alt="Shelf Awareness Logo"
              width={50}
              height={50}
              onError={() => setImgSrc('/fallback-logo.png')}
            />
          </div>

          <h5 className="fw-bold mb-0">
            Shelf Awareness
          </h5>
        </Link>

        <p className="footer-text-muted small mb-2 mb-md-3 px-2 px-md-0">
          Keep track of your pantry shelf, cut down on food waste, and
          discover recipes with what you already have.
        </p>
      </Col>

      {/* Browse */}
      <Col md={2}>
        <h6 className="fw-bold mb-2 mb-md-3">Browse</h6>
        <ul className="list-unstyled small footer-links mb-0">
          <li className="mb-1 mb-md-2">
            <Link href="/" className="nav-link p-0 py-1">
              Home
            </Link>
          </li>
          <li className="mb-1 mb-md-2">
            <Link href="/aboutus" className="nav-link p-0 py-1">
              About Us
            </Link>
          </li>
          <li className="mb-1 mb-md-2">
            <Link href="/dashboard" className="nav-link p-0 py-1">
              Dashboard
            </Link>
          </li>
        </ul>
      </Col>

      {/* Features */}
      <Col md={2}>
        <h6 className="fw-bold mb-2 mb-md-3">Features</h6>
        <ul className="list-unstyled small footer-links mb-0">
          <li className="mb-1 mb-md-2">
            <Link href="/view-pantry" className="nav-link p-0 py-1">
              View Pantry Shelf
            </Link>
          </li>
          <li className="mb-1 mb-md-2">
            <Link href="/shopping-list" className="nav-link p-0 py-1">
              Shopping List
            </Link>
          </li>
          <li className="mb-1 mb-md-2">
            <Link href="/recipes" className="nav-link p-0 py-1">
              Recipes
            </Link>
          </li>
        </ul>
      </Col>

      {/* Contact */}
      <Col md={4} lg={3}>
        <h6 className="fw-bold mb-2 mb-md-3">Contact</h6>
        <ul className="list-unstyled small footer-text-muted mb-0">

          <li className="d-flex flex-column flex-md-row align-items-center align-items-md-start mb-2 mb-md-3 gap-1">
            <GeoAlt />
            <span className="text-break">
              2500 Campus Rd, Honolulu, HI 96822
            </span>
          </li>

          <li className="d-flex flex-column flex-md-row align-items-center align-items-md-start mb-2 mb-md-3 gap-1">
            <Envelope />
            <span className="text-break">
              ShelfAwarenessApp@gmail.com
            </span>
          </li>

          <li>
            <a
              href="https://github.com/shelf-awareness"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link p-0 d-inline-flex align-items-center gap-2 py-1"
            >
              <Github />
              View on GitHub
            </a>
          </li>
        </ul>
      </Col>
    </Row>
  </Container>

  {/* Copyright */}
  <div className="footer-bottom-bar py-2 py-md-3 mt-3 mt-md-5">
    <Container>
      <Row>
        <Col className="text-center small">
          &copy; {currentYear} Shelf Awareness. All Rights Reserved.
        </Col>
      </Row>
    </Container>
  </div>
</footer>

  );
};

export default Footer;
