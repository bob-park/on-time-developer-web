'use client';

export default function DrawerToggle() {
  // handle
  const handleToggle = () => {
    const toggle = document.getElementById('mobile-drawer') as HTMLInputElement | null;

    if (toggle) {
      toggle.checked = !toggle.checked;
    }
  };

  return (
    <button type="button" className="btn btn-ghost btn-square md:hidden" aria-label="open menu" onClick={handleToggle}>
      <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
