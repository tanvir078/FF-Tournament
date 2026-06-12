import { FormEvent, useEffect, useState } from 'react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

export default function SettingsPage() {
  const [support, setSupport] = useState({ telegramUrl: '', whatsappUrl: '' });
  const [brand, setBrand] = useState({
    brandName: 'ArenaHub', logoUrl: '', primaryColor: '#0ea5e9', secondaryColor: '#7c3aed',
    socialTitle: '', socialDescription: '', socialImage: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/support/settings').then(({ data }) => setSupport({ telegramUrl: data.telegramUrl || '', whatsappUrl: data.whatsappUrl || '' }));
    api.get('/platform/settings').then(({ data }) => setBrand({
      brandName: data.brandName || 'ArenaHub', logoUrl: data.logoUrl || '',
      primaryColor: data.primaryColor || '#0ea5e9', secondaryColor: data.secondaryColor || '#7c3aed',
      socialTitle: data.socialMetadata?.title || '', socialDescription: data.socialMetadata?.description || '',
      socialImage: data.socialMetadata?.image || '',
    }));
  }, []);

  const save = async (action: () => Promise<unknown>, success: string) => {
    setError('');
    try {
      await action();
      setMessage(success);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Unable to save settings.');
    }
  };

  const saveSupport = async (event: FormEvent) => {
    event.preventDefault();
    await save(() => api.put('/support/settings', support), 'Support links saved.');
  };

  const saveBrand = async (event: FormEvent) => {
    event.preventDefault();
    await save(() => api.patch('/admin/platform/settings', {
      brandName: brand.brandName, logoUrl: brand.logoUrl || null,
      primaryColor: brand.primaryColor, secondaryColor: brand.secondaryColor,
      socialMetadata: { title: brand.socialTitle, description: brand.socialDescription, image: brand.socialImage },
    }), 'Platform brand saved. Reload the panel to refresh the sidebar preview.');
  };

  return <div className="min-h-screen space-y-5 bg-gray-900 px-4 py-8 text-white">
    <div className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold">Platform Settings</h1>
      <p className="mt-1 text-gray-400">Manage ArenaHub branding and fallback support channels.</p>
    </div>
    {message && <p className="mx-auto max-w-5xl rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">{message}</p>}
    {error && <p className="mx-auto max-w-5xl rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_320px]">
      <Card className="p-6">
        <h2 className="mb-2 text-xl font-bold">Platform Branding</h2>
        <p className="mb-5 text-sm text-gray-400">Used by the user web, mobile app, and management sidebar.</p>
        <form onSubmit={saveBrand} className="space-y-4">
          <Input value={brand.brandName} onChange={(e) => setBrand({ ...brand, brandName: e.target.value })} placeholder="ArenaHub" required />
          <Input value={brand.logoUrl} onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })} placeholder="Logo URL" />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-gray-400">Primary color<Input className="mt-1" type="color" value={brand.primaryColor} onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })} /></label>
            <label className="text-sm text-gray-400">Secondary color<Input className="mt-1" type="color" value={brand.secondaryColor} onChange={(e) => setBrand({ ...brand, secondaryColor: e.target.value })} /></label>
          </div>
          <h3 className="pt-2 text-sm font-bold uppercase tracking-wide text-gray-400">Social Metadata</h3>
          <Input value={brand.socialTitle} onChange={(e) => setBrand({ ...brand, socialTitle: e.target.value })} placeholder="Share title" />
          <Input value={brand.socialDescription} onChange={(e) => setBrand({ ...brand, socialDescription: e.target.value })} placeholder="Share description" />
          <Input value={brand.socialImage} onChange={(e) => setBrand({ ...brand, socialImage: e.target.value })} placeholder="Share image URL" />
          <Button type="submit">Save Brand</Button>
        </form>
      </Card>
      <div className="space-y-5">
        <Card className="overflow-hidden">
          <div className="h-24" style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor})` }} />
          <div className="p-5">
            {brand.logoUrl && <img src={brand.logoUrl} alt="" className="-mt-12 mb-3 h-14 w-14 rounded-xl border-2 border-gray-800 object-cover" />}
            <p className="text-xl font-bold">{brand.brandName || 'ArenaHub'}</p>
            <p className="mt-1 text-sm text-gray-400">{brand.socialDescription || 'Multi-game esports tournament platform'}</p>
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="mb-2 text-xl font-bold">Support Settings</h2>
          <p className="mb-4 text-sm text-gray-400">Shown beside in-site support as optional fallback channels.</p>
          <form onSubmit={saveSupport} className="space-y-4">
            <Input value={support.telegramUrl} onChange={(e) => setSupport({ ...support, telegramUrl: e.target.value })} placeholder="https://t.me/..." />
            <Input value={support.whatsappUrl} onChange={(e) => setSupport({ ...support, whatsappUrl: e.target.value })} placeholder="https://wa.me/..." />
            <Button type="submit">Save Support Links</Button>
          </form>
        </Card>
      </div>
    </div>
  </div>;
}
