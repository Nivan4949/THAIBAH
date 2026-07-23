import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import { Setting } from '../types/database';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Save,
  Image as ImageIcon,
  Award,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [footerText, setFooterText] = useState('');
  const [operatingBy, setOperatingBy] = useState('');
  const [termsConditions, setTermsConditions] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await settingsService.getSettings();
    setSettings(data);
    setCompanyName(data.company_name);
    setLogo(data.logo);
    setAddress(data.address);
    setPhone(data.phone);
    setEmail(data.email);
    setFooterText(data.footer_text);
    setOperatingBy(data.operating_by);
    setTermsConditions(data.terms_conditions);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updated = await settingsService.updateSettings({
      company_name: companyName,
      logo,
      address,
      phone,
      email,
      footer_text: footerText,
      operating_by: operatingBy,
      terms_conditions: termsConditions,
    });

    setSaving(false);
    if (updated) {
      toast.success('Company settings saved successfully! Changes apply to all travel vouchers.');
      setSettings(updated);
    } else {
      toast.error('Failed to update company settings.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <div className="w-10 h-10 border-4 border-brand-900/20 border-t-brand-900 rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold">Loading System Configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
          <Award className="w-4 h-4" />
          <span>Official Company Configuration</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Company Branding &amp; Ticket Settings</h1>
        <p className="text-xs text-blue-100 mt-1">
          Updates here automatically reflect on every generated travel voucher, PDF export, and printed document.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Identity */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 font-bold text-sm uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-brand-900" />
            <span>Company Identity &amp; Branding</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Operating Entity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Operating Entity *
              </label>
              <input
                type="text"
                required
                value={operatingBy}
                onChange={(e) => setOperatingBy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Logo Image URL */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company Logo Asset Vector / Path
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="/logo-official.svg"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono font-medium text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information & Address */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 font-bold text-sm uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-brand-900" />
            <span>Contact Information &amp; Office Address</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Numbers */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone / Hotline Numbers *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            {/* Office Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Physical Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>
          </div>
        </div>

        {/* Footer & Terms */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 font-bold text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4 text-brand-900" />
            <span>Ticket Footer &amp; Terms Conditions</span>
          </div>

          <div className="space-y-4">
            {/* Footer Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Footer Tagline Text
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Terms &amp; Conditions (One point per line)
              </label>
              <textarea
                rows={7}
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-brand-900 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-brand-900 hover:bg-brand-800 text-white font-bold rounded-2xl text-sm shadow-md flex items-center gap-2 transition transform active:scale-95"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
