'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Key } from 'lucide-react';
import { sendOtp, verifyOtp } from '@/app/actions/user-auth';
import { useRouter } from 'next/navigation';

export default function UserLoginModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsMounted(false);
      setStep(1);
      setEmail('');
      setOtp('');
      setError('');
      setSuccess('');
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await sendOtp(email);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('OTP sent to your email!');
        setStep(2);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError('');

    try {
      const res = await verifyOtp(email, otp);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Login successful!');
        // Small delay to show success
        setTimeout(() => {
          onClose();
          router.refresh();
          router.push('/practice');
        }, 1000);
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  }

  const handleBack = () => {
    setStep(1);
    setError('');
    setSuccess('');
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target.className === 'modal-overlay') onClose();
      }}
    >
      <div
        className={`auth-container ${!isMounted ? 'hidden' : ''}`}
        style={{ opacity: isMounted ? 1 : 0, transform: isMounted ? 'scale(1)' : 'scale(0.95)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-white/50 hover:text-white transition-colors"
          title="Close"
        >
          <X size={24} />
        </button>

        <div className="content-wrapper">
          <h2 className="title">
            {step === 1 ? 'Student Login' : 'Enter OTP'}
          </h2>
          <p className="subtitle">
            {step === 1
              ? 'Enter your whitelisted college email to verify access.'
              : `We sent a code to ${email}. Please enter it below.`}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="input-field">
                <input
                  type="email"
                  placeholder="Student Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <Mail className="icon" size={20} />
              </div>
              {error && <p className="error-msg">{error}</p>}
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="input-field">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                />
                <Key className="icon" size={20} />
              </div>
              {error && <p className="error-msg">{error}</p>}
              {success && <p className="success-msg">{success}</p>}

              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button type="button" onClick={handleBack} className="back-link" disabled={loading}>
                Change Email
              </button>
            </form>
          )}

          <p className="note">
            * Access is restricted to whitelisted students only.
          </p>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .auth-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          background: rgba(10, 10, 10, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          box-shadow: 0 0 40px rgba(32, 140, 41, 0.2);
          padding: 3rem 2rem;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .content-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .title {
            color: white;
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .subtitle {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.9rem;
            margin-bottom: 2rem;
            max-width: 80%;
        }

        .auth-form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .input-field {
            position: relative;
            width: 100%;
        }

        .input-field input {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            padding: 1rem 1rem 1rem 3rem;
            border-radius: 12px;
            font-size: 1rem;
            outline: none;
            transition: all 0.2s;
        }

        .input-field input:focus {
            border-color: rgba(32, 140, 41, 0.5);
            background: rgba(32, 140, 41, 0.05);
        }

        .input-field .icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255, 255, 255, 0.4);
        }

        .btn {
            background: #2f8d46;
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            margin-top: 0.5rem;
        }

        .btn:hover:not(:disabled) {
            background: #267a3a;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(32, 140, 41, 0.3);
        }

        .btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .error-msg {
            color: #ff4444;
            font-size: 0.85rem;
            background: rgba(255, 68, 68, 0.1);
            padding: 0.5rem;
            border-radius: 8px;
        }

        .success-msg {
            color: #4caf50;
            font-size: 0.85rem;
            background: rgba(76, 175, 80, 0.1);
            padding: 0.5rem;
            border-radius: 8px;
        }

        .back-link {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.85rem;
            cursor: pointer;
            text-decoration: underline;
        }

        .back-link:hover {
            color: white;
        }

        .note {
            margin-top: 2rem;
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.3);
        }

        .hidden {
            display: none;
        }
      `}</style>
    </div>
  );
}
