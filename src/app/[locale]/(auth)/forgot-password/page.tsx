'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { ArrowLeft, GraduationCap, Globe } from 'lucide-react';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendCode = async () => {
    setLoading(true);
    // TODO: Implement email verification code sending
    setTimeout(() => {
      setCodeSent(true);
      setMessage(t('codeSent'));
      setLoading(false);
    }, 1000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    // TODO: Implement password reset API
    setTimeout(() => {
      setMessage(t('passwordChanged'));
      setLoading(false);
    }, 1000);
  };

  const switchLocale = locale === 'en' ? 'zh' : 'en';

  return (
    <div className="w-full max-w-md px-4">
      <div className="flex justify-end mb-4">
        <Link
          href="/forgot-password"
          locale={switchLocale}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          {switchLocale === 'zh' ? '中文' : 'English'}
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle>{t('forgotPasswordTitle')}</CardTitle>
          <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendCode}
                  disabled={loading || !email}
                  className="whitespace-nowrap"
                >
                  {t('sendCode')}
                </Button>
              </div>
            </div>

            {codeSent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code">{t('verificationCode')}</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {message && (
              <p className="text-sm text-primary">{message}</p>
            )}

            {codeSent && (
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? tc('loading') : t('resetPassword')}
              </Button>
            )}

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                {t('backToLogin')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
