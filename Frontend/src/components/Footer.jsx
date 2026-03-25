export default function Footer() {
  return (
    <footer className="w-full max-w-7xl mx-auto px-12 py-24 grid grid-cols-2 md:grid-cols-4 gap-16 mt-40" style={{ borderTop: '1px solid var(--theme-border-faint)' }}>
      <div className="col-span-2 md:col-span-1">
        <div className="text-2xl font-black font-headline mb-8 italic transition-colors duration-400" style={{ color: 'var(--theme-text-heading)' }}>Focus Forge</div>
        <p className="font-body text-sm leading-relaxed max-w-xs transition-colors duration-400" style={{ color: 'var(--theme-text-muted)' }}>
          Building the future of technical autonomy. One curriculum at a time.
        </p>
      </div>
      <div>
        <h5 className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-10 font-bold">Brand</h5>
        <ul className="space-y-5 text-xs font-label tracking-widest font-medium" style={{ color: 'var(--theme-text-muted)' }}>
          <li><a className="hover:text-primary transition-colors" href="#">STORY</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">DESIGN</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">MEDIA</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-10 font-bold">Product</h5>
        <ul className="space-y-5 text-xs font-label tracking-widest font-medium" style={{ color: 'var(--theme-text-muted)' }}>
          <li><a className="hover:text-primary transition-colors" href="#">PIPELINE</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">ENTERPRISE</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">SECURITY</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-label text-xs uppercase tracking-[0.2em] text-primary mb-10 font-bold">Company</h5>
        <ul className="space-y-5 text-xs font-label tracking-widest font-medium" style={{ color: 'var(--theme-text-muted)' }}>
          <li><a className="hover:text-primary transition-colors" href="#">CAREERS</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">LEGAL</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">CONTACT</a></li>
        </ul>
      </div>
      <div className="col-span-2 md:col-span-4 flex flex-col md:flex-row justify-between items-center pt-12 mt-12" style={{ borderTop: '1px solid var(--theme-border-faint)' }}>
        <p className="font-label text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--theme-text-faint)' }}>© 2026 Focus Forge. Team NightShift Devs</p>
        <div className="flex gap-10 mt-8 md:mt-0">
          <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-all text-xl" style={{ color: 'var(--theme-text-faint)' }}>public</span>
          <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-all text-xl" style={{ color: 'var(--theme-text-faint)' }}>share</span>
          <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-all text-xl" style={{ color: 'var(--theme-text-faint)' }}>alternate_email</span>
        </div>
      </div>
    </footer>
  );
}
