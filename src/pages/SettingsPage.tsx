import React, { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Save,
  Image as ImageIcon,
  Upload,
  RotateCcw,
  Award,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, isLoading: contextLoading } = useSettings();
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (settings) {
      setCompanyName(settings.company_name);
      setLogo(settings.logo || '/logo-official.svg');
      setAddress(settings.address);
      setPhone(settings.phone);
      setEmail(settings.email);
      setFooterText(settings.footer_text);
      setOperatingBy(settings.operating_by);
      setTermsConditions(settings.terms_conditions);
    }
  }, [settings]);

  // Handle Logo File Upload
  const handleLogoFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Url = e.target?.result as string;
      if (base64Url) {
        setLogo(base64Url);
        toast.success('Logo uploaded successfully! Preview updated below.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleLogoFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFileUpload(e.dataTransfer.files[0]);
    }
  };

  const resetToDefaultLogo = () => {
    setLogo('/logo-official.svg');
    toast.info('Logo reset to default official Thaibah Travels logo');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateSettings({
        company_name: companyName,
        logo,
        address,
        phone,
        email,
        footer_text: footerText,
        operating_by: operatingBy,
        terms_conditions: termsConditions,
      });

      toast.success('Company branding saved! New logo is now updated across the entire software.');
    } catch (err) {
      toast.error('Failed to update company settings.');
    } finally {
      setSaving(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
        <div className="w-10 h-10 border-4 border-brand-900/20 border-t-brand-900 rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold">Loading System Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Title Header */}
      <div className="glass-panel p-6 rounded-3xl">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
          <Award className="w-4 h-4" />
          <span>Official Company Configuration</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Company Branding &amp; Ticket Settings</h1>
        <p className="text-xs text-blue-100 mt-1">
          Upload your company logo and edit contact details. Updates automatically sync across the navbar, vouchers, and PDFs in real-time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Identity & Logo Upload */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 dark:text-gold-400 font-bold text-sm uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-brand-900" />
            <span>Company Identity &amp; Logo Upload</span>
          </div>

          {/* Interactive Logo Upload Component */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Company Logo Image Upload *
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Logo Preview Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center h-40 relative">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Live Logo Preview</div>
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center h-20 w-full max-w-[200px]">
                  <img
                    src={logo || '/logo-official.svg'}
                    alt="Company Logo Preview"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo-official.svg';
                    }}
                  />
                </div>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="md:col-span-2 p-6 rounded-2xl border-2 border-dashed border-brand-900/30 hover:border-brand-900 bg-blue-50/40 dark:bg-slate-950 hover:bg-blue-50/80 transition cursor-pointer flex flex-col items-center justify-center text-center h-40 space-y-2 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-brand-900 dark:text-white">
                    Click to browse or drag &amp; drop your logo file
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports PNG, JPG, WebP, or SVG (Max 5MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Reset & URL Options */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={resetToDefaultLogo}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-brand-900 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Official Default Logo</span>
              </button>

              <div className="text-[11px] text-slate-400 font-medium">
                Uploaded logo will render across all travel vouchers &amp; topbars
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Operating Entity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Operating Entity *
              </label>
              <input
                type="text"
                required
                value={operatingBy}
                onChange={(e) => setOperatingBy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-brand-900"
              />
            </div>
          </div>
        </div>

        {/* Contact Information & Address */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 dark:text-gold-400 font-bold text-sm uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-brand-900" />
            <span>Contact Information &amp; Office Address</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Numbers */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Phone / Hotline Numbers *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Official Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-900"
                />
              </div>
            </div>

            {/* Office Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Full Physical Address *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-900"
              />
            </div>
          </div>
        </div>

        {/* Footer & Terms */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-brand-900 dark:text-gold-400 font-bold text-sm uppercase tracking-wider">
            <FileText className="w-4 h-4 text-brand-900" />
            <span>Ticket Footer &amp; Terms Conditions</span>
          </div>

          <div className="space-y-4">
            {/* Footer Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Footer Tagline Text
              </label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-900"
              />
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Terms &amp; Conditions (One point per line)
              </label>
              <textarea
                rows={7}
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-brand-900 leading-relaxed"
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
                <span>Save All Settings &amp; Sync Logo</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
